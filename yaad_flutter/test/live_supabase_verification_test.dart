// ignore_for_file: avoid_print
import 'package:flutter_test/flutter_test.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:yaad_flutter/core/config/supabase_config.dart';
import 'package:yaad_flutter/data/models/shopping_item_model.dart';
import 'package:yaad_flutter/data/models/shopping_list_model.dart';
import 'package:yaad_flutter/data/repositories/auth_repository.dart';
import 'package:yaad_flutter/data/repositories/shopping_repository.dart';

/// Test configuration for live opt-in Supabase integration verification.
abstract final class LiveSupabaseTestConfig {
  static const String testEmail = String.fromEnvironment('SUPABASE_TEST_EMAIL', defaultValue: '');
  static const String testPassword = String.fromEnvironment('SUPABASE_TEST_PASSWORD', defaultValue: '');

  static bool get hasTestCredentials =>
      testEmail.isNotEmpty && testPassword.isNotEmpty && !testEmail.contains('example.com');
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Live Supabase Security & Authentication Guard Verification', () {
    test('Unauthenticated user is strictly blocked from writing guest data into Supabase tables', () async {
      // Mock client without authenticated session
      final client = SupabaseClient(
        'https://dummyproject.supabase.co',
        'dummy_anon_key_for_testing_purposes_only_not_a_real_secret',
      );
      final repo = SupabaseShoppingRepository(client);

      const guestList = ShoppingListModel(
        id: 'list-unauth-attempt',
        userId: 'guest',
        title: 'Guest List',
        items: [],
      );

      // Verify that calling upsertList with userId: 'guest' throws AuthException
      expect(
        () async => await repo.upsertList(guestList),
        throwsA(isA<AuthException>()),
      );

      // Verify that unauthenticated reads return empty list safely without DB errors
      final fetched = await repo.fetchLists('guest');
      expect(fetched, isEmpty);

      final singleList = await repo.fetchListById('list-unauth-attempt');
      expect(singleList, isNull);
    });
  });

  group('Live Supabase Opt-In Network Verification', () {
    test('Execute non-destructive real CRUD lifecycle when credentials are provided', () async {
      if (!YaadSupabaseConfig.isConfigured || !LiveSupabaseTestConfig.hasTestCredentials) {
        // Report missing prerequisites clearly without failing hermetic test runs
        final summary = YaadSupabaseConfig.diagnosticSummary;
        print('\n-------------------------------------------------------------');
        print('Opt-in Live Supabase Verification: SKIPPED (Prerequisites not provided)');
        print('Supabase Configured: ${summary['isConfigured']}');
        print('URL Present: ${summary['urlPresent']}');
        print('Test Account Configured: ${LiveSupabaseTestConfig.hasTestCredentials}');
        print('');
        print('To execute live against your Supabase project, run:');
        print('flutter test test/live_supabase_verification_test.dart \\');
        print('  --dart-define=SUPABASE_URL=https://your-project.supabase.co \\');
        print('  --dart-define=SUPABASE_ANON_KEY=your-anon-key \\');
        print('  --dart-define=SUPABASE_TEST_EMAIL=test@yourdomain.com \\');
        print('  --dart-define=SUPABASE_TEST_PASSWORD=your-test-password');
        print('-------------------------------------------------------------\n');
        return;
      }

      // Initialize live client
      await Supabase.initialize(
        url: YaadSupabaseConfig.url,
        // ignore: deprecated_member_use
        anonKey: YaadSupabaseConfig.anonKey,
      );
      final client = Supabase.instance.client;
      final authRepo = SupabaseAuthRepository(client);
      final shoppingRepo = SupabaseShoppingRepository(client);

      // 1. Authenticate with designated test account
      final authResponse = await authRepo.signInWithEmailAndPassword(
        email: LiveSupabaseTestConfig.testEmail,
        password: LiveSupabaseTestConfig.testPassword,
      );
      final testUserId = authResponse.user?.id;
      expect(testUserId, isNotNull, reason: 'Test user must authenticate successfully');

      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final testListId = 'yaad-audit-list-$timestamp';
      final testItemId = 'yaad-audit-item-$timestamp';

      try {
        // 2. Write test list
        final testList = ShoppingListModel(
          id: testListId,
          userId: testUserId!,
          title: 'Audit Test List $timestamp',
          icon: 'shopping_basket',
          isCompleted: false,
          createdAt: DateTime.now().toUtc(),
          items: [
            ShoppingItemModel(
              id: testItemId,
              listId: testListId,
              userId: testUserId,
              itemName: 'Audit Kashmiri Chai',
              category: 'tea_coffee',
              quantity: '2',
              unit: 'packet',
              isCompleted: false,
            ),
          ],
        );

        await shoppingRepo.upsertList(testList);

        // 3. Read back from real Supabase table
        final fetchedList = await shoppingRepo.fetchListById(testListId);
        expect(fetchedList, isNotNull);
        expect(fetchedList!.title, equals('Audit Test List $timestamp'));
        expect(fetchedList.items.length, equals(1));
        expect(fetchedList.items.first.itemName, equals('Audit Kashmiri Chai'));

        // 4. Update item completion state
        await shoppingRepo.toggleItemCompleted(testItemId, true);
        final updatedItems = await shoppingRepo.fetchItemsForList(testListId);
        expect(updatedItems.firstWhere((i) => i.id == testItemId).isCompleted, isTrue);
      } finally {
        // 5. Clean up ONLY the temporary test record created by this test
        try {
          await shoppingRepo.deleteList(testListId);
          final verifyCleanup = await shoppingRepo.fetchListById(testListId);
          expect(verifyCleanup, isNull, reason: 'Temporary test list must be deleted after test');
        } catch (cleanupError) {
          print('Warning during test record cleanup: $cleanupError');
        }

        // 6. Sign out test user
        await authRepo.signOut();
      }
    });
  });
}
