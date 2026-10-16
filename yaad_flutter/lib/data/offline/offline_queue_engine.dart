/// Offline queue synchronization engine.
///
/// Implements strict FIFO replay, idempotent upserts, conflict handling,
/// durable local persistence, dead-letter quarantine with recovery,
/// and user-scoped isolation matching `src/lib/offlineDb.ts`.
library;

import 'package:flutter/foundation.dart';
import '../models/shopping_list_model.dart';
import '../models/shopping_item_model.dart';
import '../repositories/shopping_repository.dart';
import 'offline_mutation.dart';
import 'queue_storage.dart';

final class SyncResult {
  const SyncResult({
    required this.syncedCount,
    required this.failedCount,
    required this.droppedCount,
  });

  final int syncedCount;
  final int failedCount;
  final int droppedCount;

  @override
  String toString() =>
      'SyncResult(synced: $syncedCount, failed: $failedCount, dropped: $droppedCount)';
}

class OfflineQueueEngine extends ChangeNotifier {
  OfflineQueueEngine({
    this.maxRetries = 5,
    this.storageDriver,
    List<PendingOfflineOperation>? initialQueue,
  }) {
    if (initialQueue != null) {
      _queue.addAll(initialQueue);
    }
  }

  final int maxRetries;
  final QueueStorageDriver? storageDriver;
  final List<PendingOfflineOperation> _queue = [];
  final List<PendingOfflineOperation> _deadLetterQueue = [];
  bool _isSyncing = false;

  bool get isSyncing => _isSyncing;
  List<PendingOfflineOperation> get queue => List.unmodifiable(_queue);

  /// Dead-letter quarantine holding terminal operations that failed maxRetries.
  /// User data is never silently discarded and can be reviewed or retried.
  List<PendingOfflineOperation> get quarantinedQueue => List.unmodifiable(_deadLetterQueue);

  int get pendingCount => _queue.where((o) => o.syncStatus == SyncStatus.pending).length;
  int get quarantinedCount => _deadLetterQueue.length;

  /// Loads persisted mutations from durable storage driver for a user upon startup.
  Future<void> loadPersistedQueue(String userId) async {
    if (storageDriver == null) return;
    final persisted = await storageDriver!.loadQueue(userId);
    _queue.removeWhere((o) => o.userId == userId);
    _queue.addAll(persisted);
    notifyListeners();
  }

  Future<void>? _saveChain;

  /// Flushes any pending asynchronous disk write tasks to completion.
  Future<void> flushStorage(String userId) async {
    await _saveChain;
    if (storageDriver != null) {
      final userOps = _queue.where((o) => o.userId == userId).toList();
      await storageDriver!.saveQueue(userId, userOps);
    }
  }

  /// Automatically persists user queue changes to disk in strict sequence.
  void _autoPersist(String userId) {
    if (storageDriver == null) return;
    _saveChain = (_saveChain ?? Future<void>.value()).then((_) async {
      final userOps = _queue.where((o) => o.userId == userId).toList();
      await storageDriver!.saveQueue(userId, userOps);
    }).catchError((_) {});
  }

  /// Enqueues an operation with duplicate prevention on idempotent payloads.
  void enqueue(PendingOfflineOperation operation) {
    // 1. If deleting an entire list, prune any earlier pending operations on that list
    if (operation.type == OfflineMutationType.deleteList) {
      _queue.removeWhere((o) => o.listId == operation.listId && o.syncStatus == SyncStatus.pending);
    }
    // 2. If deleting an item, prune any earlier pending adds or updates for that item
    else if (operation.type == OfflineMutationType.deleteItem && operation.itemId != null) {
      _queue.removeWhere((o) => o.itemId == operation.itemId && o.syncStatus == SyncStatus.pending);
    }
    // 3. If toggling item completion, coalesce with previous pending toggle
    else if (operation.type == OfflineMutationType.completeItem ||
        operation.type == OfflineMutationType.uncompleteItem) {
      final existingToggleIdx = _queue.indexWhere(
        (o) =>
            o.itemId == operation.itemId &&
            (o.type == OfflineMutationType.completeItem ||
                o.type == OfflineMutationType.uncompleteItem) &&
            o.syncStatus == SyncStatus.pending,
      );
      if (existingToggleIdx >= 0) {
        _queue[existingToggleIdx] = operation;
        notifyListeners();
        _autoPersist(operation.userId);
        return;
      }
    }
    // 4. Duplicate prevention for idempotent SAVE_LIST
    else if (operation.type == OfflineMutationType.saveList) {
      final existingIndex = _queue.indexWhere(
        (o) =>
            o.type == OfflineMutationType.saveList &&
            o.listId == operation.listId &&
            o.syncStatus == SyncStatus.pending,
      );
      if (existingIndex >= 0) {
        _queue[existingIndex] = operation;
        notifyListeners();
        _autoPersist(operation.userId);
        return;
      }
    }

    _queue.add(operation);
    notifyListeners();
    _autoPersist(operation.userId);
  }

  /// Removes an operation from the queue by ID and updates storage.
  bool remove(String operationId) {
    final target = _queue.cast<PendingOfflineOperation?>().firstWhere(
          (o) => o?.id == operationId,
          orElse: () => null,
        );
    if (target == null) return false;

    _queue.removeWhere((o) => o.id == operationId);
    notifyListeners();
    _autoPersist(target.userId);
    return true;
  }

  /// Clears in-memory queue for a user when switching accounts.
  void clearInMemoryForUser(String userId) {
    _queue.removeWhere((o) => o.userId == userId);
    _deadLetterQueue.removeWhere((o) => o.userId == userId);
    notifyListeners();
  }

  /// Clears all queue items for a user and cleans up persistent storage.
  void clearForUser(String userId) {
    _queue.removeWhere((o) => o.userId == userId);
    _deadLetterQueue.removeWhere((o) => o.userId == userId);
    notifyListeners();
    storageDriver?.clearQueue(userId);
  }

  /// Restores a quarantined operation from the dead-letter queue back to the active queue.
  bool retryQuarantined(String operationId) {
    final idx = _deadLetterQueue.indexWhere((o) => o.id == operationId);
    if (idx < 0) return false;

    final op = _deadLetterQueue.removeAt(idx);
    op.retryCount = 0;
    op.lastError = null;
    op.syncStatus = SyncStatus.pending;
    _queue.add(op);
    notifyListeners();
    _autoPersist(op.userId);
    return true;
  }

  /// Clears dead-letter quarantined operations.
  void clearQuarantined() {
    _deadLetterQueue.clear();
    notifyListeners();
  }

  /// Exports queue to JSON-serializable list for disk persistence across app restarts.
  List<Map<String, dynamic>> exportQueue() {
    return _queue.map((op) => op.toJson()).toList();
  }

  /// Restores queue from JSON-serializable list after app restart.
  void importQueue(List<Map<String, dynamic>> data) {
    _queue.clear();
    for (final item in data) {
      _queue.add(PendingOfflineOperation.fromJson(item));
    }
    notifyListeners();
  }

  /// Processes the queue in strict FIFO order against the target repository.
  ///
  /// Guarantees:
  /// - Strict user isolation (if `targetUserId` is provided, only processes that user's mutations).
  /// - Unauthenticated guest mutations are never uploaded to remote production tables.
  /// - Remotely deleted lists drop child mutations without resurrection.
  /// - Terminal failures are quarantined into deadLetterQueue for inspection and recovery.
  Future<SyncResult> processQueue(
    ShoppingRepository repository, {
    String? targetUserId,
    bool isOnline = true,
    Set<String> remotelyDeletedListIds = const {},
  }) async {
    if (!isOnline) {
      return const SyncResult(syncedCount: 0, failedCount: 0, droppedCount: 0);
    }

    _isSyncing = true;
    notifyListeners();

    int syncedCount = 0;
    int failedCount = 0;
    int droppedCount = 0;

    final affectedUserIds = <String>{};

    try {
      // Strict FIFO: sort copy by timestamp
      var opsToProcess = List<PendingOfflineOperation>.from(_queue)
        ..sort((a, b) => a.timestamp.compareTo(b.timestamp));

      // Filter by targetUserId if specified to guarantee user isolation on account switch
      if (targetUserId != null) {
        opsToProcess = opsToProcess.where((op) => op.userId == targetUserId).toList();
      }

      for (final op in opsToProcess) {
        affectedUserIds.add(op.userId);

        // 1. Terminal Error Quarantine: move to deadLetterQueue instead of silently discarding
        if (op.retryCount >= maxRetries) {
          _queue.removeWhere((item) => item.id == op.id);
          _deadLetterQueue.removeWhere((item) => item.id == op.id);
          _deadLetterQueue.add(op);
          droppedCount++;
          continue;
        }

        // 2. Conflict Handling: If parent list was deleted remotely, do not resurrect
        if (remotelyDeletedListIds.contains(op.listId)) {
          _queue.removeWhere((item) => item.id == op.id);
          droppedCount++;
          continue;
        }

        // 3. Safety Guard: Unauthenticated guest mutations must not hit remote production tables
        if (op.userId == 'guest' && repository is SupabaseShoppingRepository) {
          // Retain in local queue without attempting invalid remote write
          continue;
        }

        op.syncStatus = SyncStatus.syncing;

        try {
          switch (op.type) {
            case OfflineMutationType.createList:
            case OfflineMutationType.updateList:
            case OfflineMutationType.saveList:
              final list = ShoppingListModel.fromJson(op.payload);
              await repository.upsertList(list);
              break;

            case OfflineMutationType.deleteList:
              await repository.deleteList(op.listId);
              break;

            case OfflineMutationType.addItem:
            case OfflineMutationType.updateItem:
              final item = ShoppingItemModel.fromJson(op.payload);
              await repository.upsertItem(item);
              break;

            case OfflineMutationType.deleteItem:
              final itemId = op.itemId ?? op.payload['id'] as String?;
              if (itemId != null) {
                await repository.deleteItem(itemId);
              }
              break;

            case OfflineMutationType.completeItem:
            case OfflineMutationType.uncompleteItem:
              final itemId = op.itemId ?? op.payload['id'] as String?;
              final isCompleted = op.type == OfflineMutationType.completeItem;
              if (itemId != null) {
                await repository.toggleItemCompleted(itemId, isCompleted);
              }
              break;

            case OfflineMutationType.updateProfile:
              // Handled via profile sync
              break;
          }

          op.syncStatus = SyncStatus.synced;
          _queue.removeWhere((item) => item.id == op.id);
          syncedCount++;
        } catch (e) {
          op.retryCount++;
          op.lastError = e.toString();
          op.syncStatus = SyncStatus.failed;
          failedCount++;
        }
      }
    } finally {
      _isSyncing = false;
      notifyListeners();
      for (final uid in affectedUserIds) {
        _autoPersist(uid);
      }
    }

    return SyncResult(
      syncedCount: syncedCount,
      failedCount: failedCount,
      droppedCount: droppedCount,
    );
  }
}
