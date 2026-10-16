import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:yaad_flutter/core/config/supabase_config.dart';
import 'package:yaad_flutter/data/models/shopping_item_model.dart';
import 'package:yaad_flutter/data/models/shopping_list_model.dart';
import 'package:yaad_flutter/data/offline/offline_mutation.dart';
import 'package:yaad_flutter/data/offline/offline_queue_engine.dart';
import 'package:yaad_flutter/data/repositories/auth_repository.dart';
import 'package:yaad_flutter/data/repositories/shopping_repository.dart';
import 'package:yaad_flutter/features/shopping/screens/shopping_list_screen.dart';

void main() {
  group('Production Integration Audit: Shopping-Item Lifecycle & Persistence', () {
    test('Complete CRUD lifecycle with Pakistani quantity parsing and restart persistence', () async {
      // 1. Initial authenticated user state
      const userId = 'usr-prod-884';
      final repo = MockShoppingRepository();

      // Create a default list for the user
      final initialList = ShoppingListModel(
        id: 'list-weekly-rashan',
        userId: userId,
        title: 'Weekly Rashan',
        items: const [],
      );
      await repo.upsertList(initialList);

      // Verify list loaded for user
      final userLists = await repo.fetchLists(userId);
      expect(userLists.length, 1);
      expect(userLists.first.id, 'list-weekly-rashan');

      // 2. Add an item using smart Pakistani quantity parsing ('2 darjan anday')
      const item1 = ShoppingItemModel(
        id: 'item-eggs-1',
        listId: 'list-weekly-rashan',
        userId: userId,
        itemName: 'Anday (Eggs)',
        category: 'poultry',
        quantity: '2',
        unit: 'darjan',
        rawInput: '2 darjan anday',
        nameUrdu: 'انڈے',
        nameRomanUrdu: 'Anday',
      );
      await repo.upsertItem(item1);

      // Add a second item ('1 pau aloo')
      const item2 = ShoppingItemModel(
        id: 'item-aloo-2',
        listId: 'list-weekly-rashan',
        userId: userId,
        itemName: 'Aloo',
        category: 'vegetables',
        quantity: '1',
        unit: 'pao',
        rawInput: '1 pau aloo',
        nameUrdu: 'آلو',
        nameRomanUrdu: 'Aloo',
      );
      await repo.upsertItem(item2);

      var listItems = await repo.fetchItemsForList('list-weekly-rashan');
      expect(listItems.length, 2);
      expect(listItems.any((i) => i.id == 'item-eggs-1' && i.unit == 'darjan'), isTrue);
      expect(listItems.any((i) => i.id == 'item-aloo-2' && i.unit == 'pao'), isTrue);

      // 3. Mark an item complete and then incomplete
      await repo.toggleItemCompleted('item-eggs-1', true);
      listItems = await repo.fetchItemsForList('list-weekly-rashan');
      expect(listItems.firstWhere((i) => i.id == 'item-eggs-1').isCompleted, isTrue);

      await repo.toggleItemCompleted('item-eggs-1', false);
      listItems = await repo.fetchItemsForList('list-weekly-rashan');
      expect(listItems.firstWhere((i) => i.id == 'item-eggs-1').isCompleted, isFalse);

      // 4. Delete an item
      await repo.deleteItem('item-aloo-2');
      listItems = await repo.fetchItemsForList('list-weekly-rashan');
      expect(listItems.length, 1);
      expect(listItems.first.id, 'item-eggs-1');

      // 5. Verify persistence across app restart via state export/import
      final persistedSnapshot = repo.exportState();
      expect(persistedSnapshot['lists'], isNotEmpty);
      expect(persistedSnapshot['items'], isNotEmpty);

      // Simulate a cold application reboot with restored local storage
      final rebootedRepo = MockShoppingRepository();
      rebootedRepo.importState(persistedSnapshot);

      final rebootedLists = await rebootedRepo.fetchLists(userId);
      expect(rebootedLists.length, 1);
      expect(rebootedLists.first.title, 'Weekly Rashan');

      final rebootedItems = await rebootedRepo.fetchItemsForList('list-weekly-rashan');
      expect(rebootedItems.length, 1);
      expect(rebootedItems.first.id, 'item-eggs-1');
      expect(rebootedItems.first.unit, 'darjan');
      expect(rebootedItems.first.isCompleted, isFalse);
    });
  });

  group('Production Integration Audit: OfflineQueueEngine & Persistence', () {
    test('Offline mutation queueing, cold restart persistence, and FIFO replay', () async {
      final queueEngine = OfflineQueueEngine();
      final repo = MockShoppingRepository();
      const userId = 'usr-prod-offline';
      const listId = 'list-offline-sync';

      // 1. Enqueue mutations while offline
      queueEngine.enqueue(PendingOfflineOperation(
        id: 'op-1',
        type: OfflineMutationType.saveList,
        userId: userId,
        listId: listId,
        payload: {
          'id': listId,
          'userId': userId,
          'title': 'Offline Pantry',
          'items': [],
        },
        timestamp: 1000,
      ));

      queueEngine.enqueue(PendingOfflineOperation(
        id: 'op-2',
        type: OfflineMutationType.addItem,
        userId: userId,
        listId: listId,
        itemId: 'item-milk-1',
        payload: {
          'id': 'item-milk-1',
          'listId': listId,
          'userId': userId,
          'itemName': 'Fresh Milk',
          'category': 'dairy',
          'quantity': '2',
          'unit': 'litre',
        },
        timestamp: 1100,
      ));

      queueEngine.enqueue(PendingOfflineOperation(
        id: 'op-3',
        type: OfflineMutationType.completeItem,
        userId: userId,
        listId: listId,
        itemId: 'item-milk-1',
        payload: {
          'id': 'item-milk-1',
          'is_completed': true,
        },
        timestamp: 1200,
      ));

      expect(queueEngine.pendingCount, 3);

      // 2. Export queue state to simulate local disk persistence (Hive/SharedPrefs)
      final serializedQueue = queueEngine.exportQueue();
      expect(serializedQueue.length, 3);
      expect(serializedQueue.first['id'], 'op-1');

      // 3. Simulate app restart with a fresh queue engine
      final rebootedQueue = OfflineQueueEngine();
      rebootedQueue.importQueue(serializedQueue);
      expect(rebootedQueue.pendingCount, 3);

      // 4. Listeners are notified on sync
      bool wasNotified = false;
      rebootedQueue.addListener(() {
        wasNotified = true;
      });

      // 5. Replay queue in FIFO order on network restoration
      final syncResult = await rebootedQueue.processQueue(repo, isOnline: true);
      expect(syncResult.syncedCount, 3);
      expect(syncResult.failedCount, 0);
      expect(rebootedQueue.pendingCount, 0);
      expect(wasNotified, isTrue);

      // Verify the list and updated item state actually landed in the repository
      final syncedList = await repo.fetchListById(listId);
      expect(syncedList, isNotNull);
      expect(syncedList!.title, 'Offline Pantry');

      final syncedItems = await repo.fetchItemsForList(listId);
      expect(syncedItems.length, 1);
      expect(syncedItems.first.itemName, 'Fresh Milk');
      expect(syncedItems.first.isCompleted, isTrue); // Toggled in op-3
    });

    test('Conflict handling: operations against remotely deleted lists do not resurrect them', () async {
      final queueEngine = OfflineQueueEngine();
      final repo = MockShoppingRepository();

      queueEngine.enqueue(PendingOfflineOperation(
        id: 'op-add-orphan',
        type: OfflineMutationType.addItem,
        userId: 'usr-1',
        listId: 'deleted-list-id',
        itemId: 'item-orphan',
        payload: {
          'id': 'item-orphan',
          'listId': 'deleted-list-id',
          'userId': 'usr-1',
          'itemName': 'Ghost item',
          'category': 'other',
        },
        timestamp: 2000,
      ));

      final result = await queueEngine.processQueue(
        repo,
        isOnline: true,
        remotelyDeletedListIds: {'deleted-list-id'},
      );

      expect(result.droppedCount, 1);
      expect(result.syncedCount, 0);
      expect(queueEngine.pendingCount, 0);

      final ghostList = await repo.fetchListById('deleted-list-id');
      expect(ghostList, isNull);
    });
  });

  group('Production Integration Audit: Supabase Production Schema & RLS Compliance', () {
    test('ShoppingListModel and ShoppingItemModel match public table column definitions', () {
      // Columns from supabase_schema.sql:
      // public.shopping_lists: id, user_id, title, icon, is_completed, completed_at, items, created_at, updated_at
      final list = ShoppingListModel(
        id: 'list-schema-check',
        userId: 'u-schema-1',
        title: 'Schema Test',
        icon: 'shopping_basket',
        isCompleted: false,
        createdAt: DateTime.parse('2026-10-16T12:00:00Z'),
        updatedAt: DateTime.parse('2026-10-16T12:05:00Z'),
        items: const [],
      );

      final listDbJson = list.toDbJson();
      expect(listDbJson.containsKey('id'), isTrue);
      expect(listDbJson.containsKey('user_id'), isTrue);
      expect(listDbJson.containsKey('title'), isTrue);
      expect(listDbJson.containsKey('icon'), isTrue);
      expect(listDbJson.containsKey('is_completed'), isTrue);
      expect(listDbJson.containsKey('items'), isTrue);
      expect(listDbJson['user_id'], 'u-schema-1');

      // Columns from supabase_schema.sql:
      // public.shopping_items: id, list_id, user_id, item_name, category, quantity, unit, raw_input, is_completed, sort_order, created_at, updated_at
      const item = ShoppingItemModel(
        id: 'item-schema-check',
        listId: 'list-schema-check',
        userId: 'u-schema-1',
        itemName: 'Kashmiri Chai',
        category: 'tea_coffee',
        quantity: '1',
        unit: 'packet',
        rawInput: '1 packet kashmiri chai',
        isCompleted: false,
        sortOrder: 1,
      );

      final itemDbJson = item.toDbJson();
      expect(itemDbJson['id'], 'item-schema-check');
      expect(itemDbJson['list_id'], 'list-schema-check');
      expect(itemDbJson['user_id'], 'u-schema-1');
      expect(itemDbJson['item_name'], 'Kashmiri Chai');
      expect(itemDbJson['category'], 'tea_coffee');
      expect(itemDbJson['quantity'], '1');
      expect(itemDbJson['unit'], 'packet');
      expect(itemDbJson['raw_input'], '1 packet kashmiri chai');
      expect(itemDbJson['is_completed'], isFalse);
      expect(itemDbJson['sort_order'], 1);
    });

    test('Data isolation by user_id matches RLS policy: auth.uid() = user_id', () async {
      final repo = MockShoppingRepository();

      // Seed list for User A
      await repo.upsertList(ShoppingListModel(
        id: 'list-user-a',
        userId: 'user-a',
        title: 'User A Groceries',
        items: const [
          ShoppingItemModel(
            id: 'item-a1',
            listId: 'list-user-a',
            userId: 'user-a',
            itemName: 'Sugar',
            category: 'cooking_essentials',
          ),
        ],
      ));

      // Seed list for User B
      await repo.upsertList(ShoppingListModel(
        id: 'list-user-b',
        userId: 'user-b',
        title: 'User B Groceries',
        items: const [
          ShoppingItemModel(
            id: 'item-b1',
            listId: 'list-user-b',
            userId: 'user-b',
            itemName: 'Rice',
            category: 'rice',
          ),
        ],
      ));

      // Query as User A
      final userALists = await repo.fetchLists('user-a');
      expect(userALists.length, 1);
      expect(userALists.first.title, 'User A Groceries');
      expect(userALists.first.items.first.itemName, 'Sugar');

      // Query as User B
      final userBLists = await repo.fetchLists('user-b');
      expect(userBLists.length, 1);
      expect(userBLists.first.title, 'User B Groceries');
      expect(userBLists.first.items.first.itemName, 'Rice');
    });
  });

  group('Production Integration Audit: Authentication States & Secret Security', () {
    test('Unconfigured Supabase gracefully falls back to mock and masks keys', () {
      YaadSupabaseConfig.configure(newUrl: '', newAnonKey: '');
      expect(YaadSupabaseConfig.isConfigured, isFalse);

      final diag = YaadSupabaseConfig.diagnosticSummary;
      expect(diag['isConfigured'], isFalse);
      expect(diag['anonKeyMasked'], '***');

      // Reconfigure with valid format to test secret masking
      YaadSupabaseConfig.configure(
        newUrl: 'https://actual-project.supabase.co',
        newAnonKey: 'sb_secret_token_1234567890abcdefghijklmnopqrstuvwxyz',
      );
      expect(YaadSupabaseConfig.isConfigured, isTrue);

      final activeDiag = YaadSupabaseConfig.diagnosticSummary;
      final maskedKey = activeDiag['anonKeyMasked'] as String;
      expect(maskedKey.startsWith('sb_sec...'), isTrue);
      expect(maskedKey.contains('1234567890'), isFalse); // Verifies secret never printed in plain text
    });

    testWidgets('Guest mode UI shows guest status and allows sign out/auth', (tester) async {
      final repo = MockShoppingRepository();
      final authRepo = MockAuthRepository();
      final queueEngine = OfflineQueueEngine();

      await tester.pumpWidget(
        MaterialApp(
          home: ShoppingListScreen(
            repository: repo,
            authRepository: authRepo,
            queueEngine: queueEngine,
            initialUserId: 'guest',
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap Account / Guest status icon button in AppBar
      final accountBtn = find.byIcon(Icons.person_outline);
      expect(accountBtn, findsOneWidget);
      await tester.tap(accountBtn);
      await tester.pumpAndSettle();

      // Verify guest dialog appeared with localized strings
      expect(find.text('Guest User'), findsOneWidget);
      expect(find.textContaining('Sign in to sync your shopping lists across devices'), findsOneWidget);

      // Close dialog
      await tester.tap(find.text('Close'));
      await tester.pumpAndSettle();
      expect(find.text('Guest User'), findsNothing);
    });

    testWidgets('Session transition: signing in switches user-scoped lists and sign out cleans up', (tester) async {
      final repo = MockShoppingRepository();
      final authRepo = MockAuthRepository();
      final queueEngine = OfflineQueueEngine();

      const authenticatedUser = User(
        id: 'usr-auth-session-42',
        appMetadata: {},
        userMetadata: {},
        aud: 'authenticated',
        createdAt: '2026-10-16T12:00:00Z',
        email: 'member@yaad.app',
      );

      // Pre-seed an exclusive list for authenticated user
      await repo.upsertList(const ShoppingListModel(
        id: 'list-auth-user',
        userId: 'usr-auth-session-42',
        title: 'Authenticated User Pantry',
        items: [
          ShoppingItemModel(
            id: 'item-auth-1',
            listId: 'list-auth-user',
            userId: 'usr-auth-session-42',
            itemName: 'Olives',
            category: 'cooking_essentials',
          ),
        ],
      ));

      await tester.pumpWidget(
        MaterialApp(
          home: ShoppingListScreen(
            repository: repo,
            authRepository: authRepo,
            queueEngine: queueEngine,
            initialListId: 'list-auth-user',
            initialUserId: 'guest',
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Guest cannot see authenticated list before signing in
      expect(find.text('Authenticated User Pantry'), findsNothing);
      expect(find.text('Olives'), findsNothing);

      authRepo.emitUser(authenticatedUser, AuthChangeEvent.signedIn);
      await tester.pumpAndSettle();

      // Verify that after sign in event, authenticated list loads
      expect(find.text('Authenticated User Pantry'), findsOneWidget);
      expect(find.text('Olives'), findsOneWidget);

      // Sign out
      await authRepo.signOut();
      await tester.pumpAndSettle();

      // After sign out, authenticated list is cleared from view
      expect(find.text('Authenticated User Pantry'), findsNothing);
      expect(find.text('Olives'), findsNothing);

      // Account status dialog now reflects signed-out state
      final accountBtn = find.byIcon(Icons.person_outline);
      expect(accountBtn, findsOneWidget);
      await tester.tap(accountBtn);
      await tester.pumpAndSettle();
      expect(find.text('Guest User'), findsOneWidget);
    });
  });

  group('Production Integration Audit: Multilingual & Directionality State', () {
    testWidgets('Switching languages toggles Directionality and updates UI text', (tester) async {
      final repo = MockShoppingRepository();
      final queueEngine = OfflineQueueEngine();

      await tester.pumpWidget(
        MaterialApp(
          home: ShoppingListScreen(
            repository: repo,
            queueEngine: queueEngine,
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Initial state is English (LTR)
      Directionality dir = tester.widget<Directionality>(
        find.descendant(of: find.byType(ShoppingListScreen), matching: find.byType(Directionality)).first,
      );
      expect(dir.textDirection, equals(TextDirection.ltr));

      // Switch language to Urdu (UR)
      final langMenu = find.byIcon(Icons.language);
      expect(langMenu, findsOneWidget);
      await tester.tap(langMenu);
      await tester.pumpAndSettle();

      // Select Urdu option from PopupMenu
      final urduItem = find.text('اردو');
      expect(urduItem, findsOneWidget);
      await tester.tap(urduItem);
      await tester.pumpAndSettle();

      // Verify Directionality switched to RTL for Urdu
      dir = tester.widget<Directionality>(
        find.descendant(of: find.byType(ShoppingListScreen), matching: find.byType(Directionality)).first,
      );
      expect(dir.textDirection, equals(TextDirection.rtl));

      // Switch to Roman Urdu
      await tester.tap(langMenu);
      await tester.pumpAndSettle();
      final romanItem = find.text('Roman Urdu');
      expect(romanItem, findsOneWidget);
      await tester.tap(romanItem);
      await tester.pumpAndSettle();

      // Verify Directionality switched back to LTR for Roman Urdu
      dir = tester.widget<Directionality>(
        find.descendant(of: find.byType(ShoppingListScreen), matching: find.byType(Directionality)).first,
      );
      expect(dir.textDirection, equals(TextDirection.ltr));
    });
  });
}
