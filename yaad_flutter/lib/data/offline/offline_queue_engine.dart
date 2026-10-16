/// Offline queue synchronization engine.
///
/// Implements strict FIFO replay, idempotent upserts, conflict handling,
/// and terminal error backoff matching `tests/offline-queue.test.ts`.
library;

import '../models/shopping_list_model.dart';
import '../models/shopping_item_model.dart';
import '../repositories/shopping_repository.dart';
import 'offline_mutation.dart';

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

final class OfflineQueueEngine {
  OfflineQueueEngine({this.maxRetries = 5});

  final int maxRetries;
  final List<PendingOfflineOperation> _queue = [];

  List<PendingOfflineOperation> get queue => List.unmodifiable(_queue);

  int get pendingCount => _queue.where((o) => o.syncStatus == SyncStatus.pending).length;

  /// Enqueues an operation with duplicate prevention on idempotent payloads.
  void enqueue(PendingOfflineOperation operation) {
    // Duplicate prevention for idempotent SAVE_LIST
    if (operation.type == OfflineMutationType.saveList) {
      final existingIndex = _queue.indexWhere(
        (o) =>
            o.type == OfflineMutationType.saveList &&
            o.listId == operation.listId &&
            o.syncStatus == SyncStatus.pending,
      );
      if (existingIndex >= 0) {
        // Update pending operation with newer snapshot
        _queue[existingIndex] = operation;
        return;
      }
    }

    _queue.add(operation);
  }

  /// Removes an operation from the queue by ID.
  bool remove(String operationId) {
    final initialLen = _queue.length;
    _queue.removeWhere((o) => o.id == operationId);
    return _queue.length < initialLen;
  }

  /// Clears all queue items for a user.
  void clearForUser(String userId) {
    _queue.removeWhere((o) => o.userId == userId);
  }

  /// Processes the queue in strict FIFO order against the target repository.
  Future<SyncResult> processQueue(
    ShoppingRepository repository, {
    bool isOnline = true,
    Set<String> remotelyDeletedListIds = const {},
  }) async {
    if (!isOnline) {
      return const SyncResult(syncedCount: 0, failedCount: 0, droppedCount: 0);
    }

    int syncedCount = 0;
    int failedCount = 0;
    int droppedCount = 0;

    // Strict FIFO: sort copy by timestamp
    final opsToProcess = List<PendingOfflineOperation>.from(_queue)
      ..sort((a, b) => a.timestamp.compareTo(b.timestamp));

    for (final op in opsToProcess) {
      // 1. Terminal Error Quarantine: drop if retry limit exceeded to unblock queue
      if (op.retryCount >= maxRetries) {
        _queue.removeWhere((item) => item.id == op.id);
        droppedCount++;
        continue;
      }

      // 2. Conflict Handling: If parent list was deleted remotely, do not resurrect
      if (remotelyDeletedListIds.contains(op.listId)) {
        _queue.removeWhere((item) => item.id == op.id);
        droppedCount++;
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

    return SyncResult(
      syncedCount: syncedCount,
      failedCount: failedCount,
      droppedCount: droppedCount,
    );
  }
}
