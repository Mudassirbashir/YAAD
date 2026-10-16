import 'package:flutter_test/flutter_test.dart';
import 'package:yaad_flutter/core/config/supabase_config.dart';
import 'package:yaad_flutter/data/models/household_model.dart';
import 'package:yaad_flutter/data/models/shopping_item_model.dart';
import 'package:yaad_flutter/data/models/shopping_list_model.dart';
import 'package:yaad_flutter/data/models/user_profile_model.dart';
import 'package:yaad_flutter/data/repositories/auth_repository.dart';
import 'package:yaad_flutter/data/repositories/household_repository.dart';
import 'package:yaad_flutter/data/repositories/profile_repository.dart';
import 'package:yaad_flutter/data/repositories/shopping_repository.dart';

void main() {
  group('Repository & Configuration Tests', () {
    test('YaadSupabaseConfig masks sensitive secrets and detects valid configuration', () {
      YaadSupabaseConfig.configure(
        newUrl: 'https://xyzcompany.supabase.co',
        newAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_secret_key_long_string',
      );

      expect(YaadSupabaseConfig.isConfigured, isTrue);
      final diag = YaadSupabaseConfig.diagnosticSummary;
      expect(diag['isConfigured'], isTrue);
      expect(diag['urlHost'], 'xyzcompany.supabase.co');
      expect((diag['anonKeyMasked'] as String).startsWith('eyJhbG...'), isTrue);
      expect((diag['anonKeyMasked'] as String).contains('dummy_secret'), isFalse); // Never exposes secret
    });

    test('MockShoppingRepository CRUD lifecycle and item cascade', () async {
      final repo = MockShoppingRepository();

      final list = ShoppingListModel(
        id: 'list-1',
        userId: 'u-1',
        title: 'Weekly Groceries',
        items: [
          const ShoppingItemModel(
            id: 'item-1',
            listId: 'list-1',
            userId: 'u-1',
            itemName: 'Milk',
            category: 'dairy',
          ),
        ],
      );

      // Create
      await repo.upsertList(list);
      final fetchedLists = await repo.fetchLists('u-1');
      expect(fetchedLists.length, 1);
      expect(fetchedLists.first.title, 'Weekly Groceries');

      // Add item
      const item2 = ShoppingItemModel(
        id: 'item-2',
        listId: 'list-1',
        userId: 'u-1',
        itemName: 'Eggs',
        category: 'poultry',
      );
      await repo.upsertItem(item2);

      final listItems = await repo.fetchItemsForList('list-1');
      expect(listItems.length, 2);

      // Toggle item completion
      await repo.toggleItemCompleted('item-1', true);
      final updatedItems = await repo.fetchItemsForList('list-1');
      expect(updatedItems.firstWhere((i) => i.id == 'item-1').isCompleted, isTrue);

      // Delete list cascades to items
      await repo.deleteList('list-1');
      expect((await repo.fetchLists('u-1')).isEmpty, isTrue);
      expect((await repo.fetchItemsForList('list-1')).isEmpty, isTrue);
    });

    test('MockProfileRepository upsert and retrieve', () async {
      final repo = MockProfileRepository();
      const profile = UserProfileModel(
        id: 'u-100',
        fullName: 'Fatima Zahra',
        email: 'fatima@example.com',
        language: 'ur',
      );

      await repo.upsertProfile(profile);
      final fetched = await repo.getProfile('u-100');
      expect(fetched, isNotNull);
      expect(fetched!.fullName, 'Fatima Zahra');
      expect(fetched.language, 'ur');
    });

    test('MockHouseholdRepository auto-adds creator as owner', () async {
      final repo = MockHouseholdRepository();
      const household = HouseholdModel(
        id: 'hh-1',
        name: 'Home Pantry',
        createdBy: 'u-owner',
      );

      await repo.createHousehold(household);
      final members = await repo.getMembers('hh-1');
      expect(members.length, 1);
      expect(members.first.userId, 'u-owner');
      expect(members.first.role, HouseholdRole.owner);

      // Add member
      const newMember = HouseholdMemberModel(
        id: 'm-2',
        householdId: 'hh-1',
        userId: 'u-child',
        role: HouseholdRole.member,
      );
      await repo.addMember(newMember);

      final updatedMembers = await repo.getMembers('hh-1');
      expect(updatedMembers.length, 2);
    });

    test('MockAuthRepository state stream and sign out', () async {
      final repo = MockAuthRepository();
      expect(repo.isAuthenticated, isFalse);

      await repo.signOut();
      expect(repo.isAuthenticated, isFalse);
    });
  });
}
