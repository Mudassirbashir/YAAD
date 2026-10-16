/// Offline mutation model matching YAAD's offline-first architecture.
///
/// Corresponds to `PendingOfflineOperation` in `src/lib/offlineDb.ts`.
library;

enum OfflineMutationType {
  createList,
  updateList,
  deleteList,
  saveList,
  addItem,
  updateItem,
  deleteItem,
  completeItem,
  uncompleteItem,
  updateProfile,
}

enum SyncStatus {
  pending,
  syncing,
  failed,
  synced,
}

final class PendingOfflineOperation {
  PendingOfflineOperation({
    required this.id,
    required this.type,
    required this.userId,
    required this.listId,
    this.itemId,
    required this.payload,
    required this.timestamp,
    this.retryCount = 0,
    this.lastError,
    this.syncStatus = SyncStatus.pending,
  });

  final String id;
  final OfflineMutationType type;
  final String userId;
  final String listId;
  final String? itemId;
  final Map<String, dynamic> payload;
  final int timestamp;
  int retryCount;
  String? lastError;
  SyncStatus syncStatus;

  factory PendingOfflineOperation.fromJson(Map<String, dynamic> json) {
    OfflineMutationType parseType(String? val) {
      switch (val) {
        case 'CREATE_LIST':
        case 'createList':
          return OfflineMutationType.createList;
        case 'UPDATE_LIST':
        case 'updateList':
          return OfflineMutationType.updateList;
        case 'DELETE_LIST':
        case 'deleteList':
          return OfflineMutationType.deleteList;
        case 'SAVE_LIST':
        case 'saveList':
          return OfflineMutationType.saveList;
        case 'ADD_ITEM':
        case 'addItem':
          return OfflineMutationType.addItem;
        case 'UPDATE_ITEM':
        case 'updateItem':
          return OfflineMutationType.updateItem;
        case 'DELETE_ITEM':
        case 'deleteItem':
          return OfflineMutationType.deleteItem;
        case 'COMPLETE_ITEM':
        case 'completeItem':
          return OfflineMutationType.completeItem;
        case 'UNCOMPLETE_ITEM':
        case 'uncompleteItem':
          return OfflineMutationType.uncompleteItem;
        case 'UPDATE_PROFILE':
        case 'updateProfile':
          return OfflineMutationType.updateProfile;
        default:
          return OfflineMutationType.saveList;
      }
    }

    SyncStatus parseStatus(String? val) {
      switch (val) {
        case 'syncing':
          return SyncStatus.syncing;
        case 'failed':
          return SyncStatus.failed;
        case 'synced':
          return SyncStatus.synced;
        case 'pending':
        default:
          return SyncStatus.pending;
      }
    }

    return PendingOfflineOperation(
      id: json['id'] as String? ?? '',
      type: parseType(json['type'] as String?),
      userId: json['userId'] as String? ?? json['user_id'] as String? ?? '',
      listId: json['listId'] as String? ?? json['list_id'] as String? ?? '',
      itemId: json['itemId'] as String? ?? json['item_id'] as String?,
      payload: json['payload'] is Map ? Map<String, dynamic>.from(json['payload']) : {},
      timestamp: (json['timestamp'] as num?)?.toInt() ?? DateTime.now().millisecondsSinceEpoch,
      retryCount: (json['retryCount'] as num?)?.toInt() ?? (json['retry_count'] as num?)?.toInt() ?? 0,
      lastError: json['lastError'] as String? ?? json['last_error'] as String?,
      syncStatus: parseStatus(json['syncStatus'] as String? ?? json['sync_status'] as String?),
    );
  }

  Map<String, dynamic> toJson() {
    String typeToString() {
      switch (type) {
        case OfflineMutationType.createList:
          return 'CREATE_LIST';
        case OfflineMutationType.updateList:
          return 'UPDATE_LIST';
        case OfflineMutationType.deleteList:
          return 'DELETE_LIST';
        case OfflineMutationType.saveList:
          return 'SAVE_LIST';
        case OfflineMutationType.addItem:
          return 'ADD_ITEM';
        case OfflineMutationType.updateItem:
          return 'UPDATE_ITEM';
        case OfflineMutationType.deleteItem:
          return 'DELETE_ITEM';
        case OfflineMutationType.completeItem:
          return 'COMPLETE_ITEM';
        case OfflineMutationType.uncompleteItem:
          return 'UNCOMPLETE_ITEM';
        case OfflineMutationType.updateProfile:
          return 'UPDATE_PROFILE';
      }
    }

    return {
      'id': id,
      'type': typeToString(),
      'userId': userId,
      'listId': listId,
      if (itemId != null) 'itemId': itemId,
      'payload': payload,
      'timestamp': timestamp,
      'retryCount': retryCount,
      if (lastError != null) 'lastError': lastError,
      'syncStatus': syncStatus.name,
    };
  }

  @override
  String toString() => 'PendingOfflineOperation(id: $id, type: ${type.name}, status: ${syncStatus.name})';
}
