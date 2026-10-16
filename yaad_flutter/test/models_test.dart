import 'package:flutter_test/flutter_test.dart';
import 'package:yaad_flutter/data/models/category_model.dart';
import 'package:yaad_flutter/data/models/household_model.dart';
import 'package:yaad_flutter/data/models/shopping_item_model.dart';
import 'package:yaad_flutter/data/models/shopping_list_model.dart';
import 'package:yaad_flutter/data/models/user_profile_model.dart';

void main() {
  group('Domain Models Serialization & Validation Tests', () {
    test('CategoryModel normalization maps backward compatibility aliases', () {
      expect(normalizeCategoryId('oils'), 'oils');
      expect(normalizeCategoryId('ghee'), 'oils');
      expect(normalizeCategoryId('cooking_oil'), 'oils');
      expect(normalizeCategoryId('grocery'), 'cooking_essentials');
      expect(normalizeCategoryId('canned_food'), 'cooking_essentials');
      expect(normalizeCategoryId('perishables'), 'vegetables');
      expect(normalizeCategoryId('fresh_produce'), 'vegetables');
      expect(normalizeCategoryId('eggs'), 'poultry');
      expect(normalizeCategoryId('baby'), 'baby_care');
      expect(normalizeCategoryId('medicines'), 'health');
      expect(normalizeCategoryId('herbal'), 'herbs');
      expect(normalizeCategoryId('home'), 'household');
      expect(normalizeCategoryId('hardware'), 'household');
      expect(normalizeCategoryId('unknown_random_cat'), 'other');
      expect(normalizeCategoryId(null), 'other');
    });

    test('UserProfileModel roundtrip serialization and null safety', () {
      final json = {
        'id': 'u-12345',
        'full_name': 'Ali Khan',
        'email': 'ali@example.com',
        'avatar_url': 'https://res.cloudinary.com/avatar.jpg',
        'phone_number': '+923001234567',
        'language': 'roman-urdu',
        'has_completed_setup': true,
        'is_verified': true,
        'created_at': '2026-10-16T12:00:00.000Z',
      };

      final profile = UserProfileModel.fromJson(json);
      expect(profile.id, 'u-12345');
      expect(profile.fullName, 'Ali Khan');
      expect(profile.email, 'ali@example.com');
      expect(profile.phoneNumber, '+923001234567');
      expect(profile.language, 'roman-urdu');
      expect(profile.hasCompletedSetup, isTrue);
      expect(profile.isVerified, isTrue);
      expect(profile.isSuspended, isFalse);

      final exported = profile.toJson();
      expect(exported['full_name'], 'Ali Khan');
      expect(exported['phone_number'], '+923001234567');
      expect(exported['language'], 'roman-urdu');
      expect(exported['has_completed_setup'], isTrue);
    });

    test('ShoppingItemModel serialization to DB and Full JSON with multilingual names', () {
      final json = {
        'id': 'item-1',
        'list_id': 'list-100',
        'user_id': 'u-12345',
        'item_name': 'Aloo (Potatoes)',
        'category': 'perishables', // Should normalize to 'vegetables'
        'quantity': '1',
        'unit': 'pao',
        'raw_input': '1 pau aloo',
        'is_completed': false,
        'sort_order': 2,
        'canonical_name': 'potato',
        'name_urdu': 'آلو',
        'name_roman_urdu': 'Aloo',
        'emoji': '🥔',
      };

      final item = ShoppingItemModel.fromJson(json);
      expect(item.id, 'item-1');
      expect(item.category, 'vegetables'); // Aliased properly
      expect(item.nameUrdu, 'آلو');
      expect(item.nameRomanUrdu, 'Aloo');
      expect(item.unit, 'pao');

      final dbJson = item.toDbJson();
      expect(dbJson['id'], 'item-1');
      expect(dbJson['item_name'], 'Aloo (Potatoes)');
      expect(dbJson['category'], 'vegetables');
      expect(dbJson['unit'], 'pao');
      expect(dbJson['is_completed'], isFalse);

      final fullJson = item.toFullJson();
      expect(fullJson['nameUrdu'], 'آلو');
      expect(fullJson['canonicalName'], 'potato');
      expect(fullJson['emoji'], '🥔');
    });

    test('ShoppingListModel serialization with embedded and relational items', () {
      final listJson = {
        'id': 'list-100',
        'user_id': 'u-12345',
        'household_id': 'hh-500',
        'title': 'Haftawar Rashan',
        'icon': 'shopping_basket',
        'is_completed': false,
        'items': [
          {
            'id': 'item-1',
            'list_id': 'list-100',
            'user_id': 'u-12345',
            'item_name': 'Basmati Chawal',
            'category': 'rice',
            'quantity': '5',
            'unit': 'kg',
          },
          {
            'id': 'item-2',
            'list_id': 'list-100',
            'user_id': 'u-12345',
            'item_name': 'Milk Pack',
            'category': 'dairy',
            'quantity': '2',
            'unit': 'bottle',
          }
        ],
      };

      final list = ShoppingListModel.fromJson(listJson);
      expect(list.id, 'list-100');
      expect(list.householdId, 'hh-500');
      expect(list.title, 'Haftawar Rashan');
      expect(list.items.length, 2);
      expect(list.items[0].itemName, 'Basmati Chawal');
      expect(list.items[1].unit, 'bottle');

      final dbExport = list.toDbJson();
      expect(dbExport['household_id'], 'hh-500');
      expect((dbExport['items'] as List).length, 2);
    });

    test('HouseholdModel and HouseholdMemberModel mapping', () {
      final hhJson = {
        'id': 'hh-1',
        'name': 'Bashir Family',
        'created_by': 'u-admin',
      };
      final hh = HouseholdModel.fromJson(hhJson);
      expect(hh.name, 'Bashir Family');
      expect(hh.createdBy, 'u-admin');

      final memberJson = {
        'id': 'm-1',
        'household_id': 'hh-1',
        'user_id': 'u-member',
        'role': 'admin',
        'status': 'accepted',
        'user_email': 'family@example.com',
      };
      final member = HouseholdMemberModel.fromJson(memberJson);
      expect(member.role, HouseholdRole.admin);
      expect(member.status, HouseholdMemberStatus.accepted);
      expect(member.userEmail, 'family@example.com');
    });
  });
}
