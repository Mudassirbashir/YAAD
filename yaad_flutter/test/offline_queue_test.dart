import 'package:flutter_test/flutter_test.dart';
import 'package:yaad_flutter/data/offline/offline_mutation.dart';
import 'package:yaad_flutter/data/offline/offline_queue_engine.dart';
import 'package:yaad_flutter/data/repositories/shopping_repository.dart';

void main() {
  group('Offline Queue & Synchronization Engine Tests', () {
    test('Strict FIFO ordering: mutations are executed in chronological order', () async {
      final engine = OfflineQueueEngine();
      final repo = MockShoppingRepository();

      // Enqueue multiple distinct mutations in timestamp order
      engine.enqueue(PendingOfflineOperation(
        id: 'op-1',
        type: OfflineMutationType.saveList,
        userId: 'u-1',
        listId: 'list-1',
        payload: {
          'id': 'list-1',
          'userId': 'u-1',
          'title': 'First List',
          'items': [],
        },
        timestamp: 1000,
      ));

      engine.enqueue(PendingOfflineOperation(
        id: 'op-2',
        type: OfflineMutationType.saveList,
        userId: 'u-1',
        listId: 'list-2',
        payload: {
          'id': 'list-2',
          'userId': 'u-1',
          'title': 'Second List',
          'items': [],
        },
        timestamp: 2000,
      ));

      final result = await engine.processQueue(repo, isOnline: true);
      expect(result.syncedCount, 2);
      expect(result.failedCount, 0);

      expect((await repo.fetchListById('list-1'))?.title, 'First List');
      expect((await repo.fetchListById('list-2'))?.title, 'Second List');
      expect(engine.pendingCount, 0);
    });

    test('Offline safety: mutations accumulate and do not drop when offline', () async {
      final engine = OfflineQueueEngine();
      final repo = MockShoppingRepository();

      engine.enqueue(PendingOfflineOperation(
        id: 'op-1',
        type: OfflineMutationType.saveList,
        userId: 'u-1',
        listId: 'list-1',
        payload: {
          'id': 'list-1',
          'userId': 'u-1',
          'title': 'Offline List',
          'items': [],
        },
        timestamp: 1000,
      ));

      // Attempt to sync while offline
      final result = await engine.processQueue(repo, isOnline: false);
      expect(result.syncedCount, 0);
      expect(result.failedCount, 0);
      expect(result.droppedCount, 0);
      expect(engine.pendingCount, 1); // Preserved in queue

      // Now come online
      final onlineResult = await engine.processQueue(repo, isOnline: true);
      expect(onlineResult.syncedCount, 1);
      expect(engine.pendingCount, 0);
    });

    test('Conflict handling: remotely deleted list drops child mutations without resurrection', () async {
      final engine = OfflineQueueEngine();
      final repo = MockShoppingRepository();

      // Enqueue adding an item to a list that was deleted remotely
      engine.enqueue(PendingOfflineOperation(
        id: 'op-add-item',
        type: OfflineMutationType.addItem,
        userId: 'u-1',
        listId: 'list-deleted-remotely',
        itemId: 'item-1',
        payload: {
          'id': 'item-1',
          'listId': 'list-deleted-remotely',
          'userId': 'u-1',
          'itemName': 'Bread',
          'category': 'bakery',
        },
        timestamp: 1000,
      ));

      // Replay with remotelyDeletedListIds set
      final result = await engine.processQueue(
        repo,
        isOnline: true,
        remotelyDeletedListIds: {'list-deleted-remotely'},
      );

      expect(result.syncedCount, 0);
      expect(result.droppedCount, 1); // Dropped safely
      expect(engine.pendingCount, 0);

      // Verify list was not revived
      final list = await repo.fetchListById('list-deleted-remotely');
      expect(list, isNull);
    });

    test('Terminal failure quarantine: bad operation exceeding maxRetries is dropped to unblock queue', () async {
      final engine = OfflineQueueEngine(maxRetries: 3);
      final repo = MockShoppingRepository();

      // Faulty operation with retry count already at threshold
      engine.enqueue(PendingOfflineOperation(
        id: 'op-bad',
        type: OfflineMutationType.saveList,
        userId: 'u-1',
        listId: 'list-corrupted',
        payload: {'corrupted': true},
        timestamp: 1000,
        retryCount: 3, // Exceeds or meets threshold
      ));

      // Valid subsequent operation
      engine.enqueue(PendingOfflineOperation(
        id: 'op-valid',
        type: OfflineMutationType.saveList,
        userId: 'u-1',
        listId: 'list-good',
        payload: {
          'id': 'list-good',
          'userId': 'u-1',
          'title': 'Good List',
          'items': [],
        },
        timestamp: 2000,
      ));

      final result = await engine.processQueue(repo, isOnline: true);
      expect(result.droppedCount, 1); // op-bad dropped
      expect(result.syncedCount, 1); // op-valid executed successfully
      expect(engine.pendingCount, 0);

      final goodList = await repo.fetchListById('list-good');
      expect(goodList?.title, 'Good List');
    });

    test('Duplicate prevention on pending idempotent SAVE_LIST', () {
      final engine = OfflineQueueEngine();

      engine.enqueue(PendingOfflineOperation(
        id: 'op-1',
        type: OfflineMutationType.saveList,
        userId: 'u-1',
        listId: 'list-1',
        payload: {'id': 'list-1', 'title': 'First Draft'},
        timestamp: 1000,
      ));

      expect(engine.pendingCount, 1);

      // Enqueue newer draft for same list while op-1 is pending
      engine.enqueue(PendingOfflineOperation(
        id: 'op-2',
        type: OfflineMutationType.saveList,
        userId: 'u-1',
        listId: 'list-1',
        payload: {'id': 'list-1', 'title': 'Second Draft'},
        timestamp: 1500,
      ));

      // Should coalesce rather than queue redundant full payloads
      expect(engine.pendingCount, 1);
      expect(engine.queue.first.payload['title'], 'Second Draft');
    });
  });
}
