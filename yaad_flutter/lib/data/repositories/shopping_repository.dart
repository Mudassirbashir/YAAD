/// Shopping list and item repository with Supabase and Mock implementations.
library;

import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/shopping_list_model.dart';
import '../models/shopping_item_model.dart';

abstract interface class ShoppingRepository {
  Future<List<ShoppingListModel>> fetchLists(String userId);
  Future<ShoppingListModel?> fetchListById(String listId);
  Future<void> upsertList(ShoppingListModel list);
  Future<void> deleteList(String listId);

  Future<List<ShoppingItemModel>> fetchItemsForList(String listId);
  Future<void> upsertItem(ShoppingItemModel item);
  Future<void> deleteItem(String itemId);
  Future<void> toggleItemCompleted(String itemId, bool isCompleted);
}

/// Supabase implementation matching `public.shopping_lists` and `public.shopping_items`.
final class SupabaseShoppingRepository implements ShoppingRepository {
  SupabaseShoppingRepository(this._client);

  final SupabaseClient _client;

  @override
  Future<List<ShoppingListModel>> fetchLists(String userId) async {
    final response = await _client
        .from('shopping_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', ascending: false);

    final lists = (response as List).map((row) {
      return ShoppingListModel.fromJson(Map<String, dynamic>.from(row));
    }).toList();

    return lists;
  }

  @override
  Future<ShoppingListModel?> fetchListById(String listId) async {
    final response = await _client
        .from('shopping_lists')
        .select('*')
        .eq('id', listId)
        .maybeSingle();

    if (response == null) return null;
    return ShoppingListModel.fromJson(Map<String, dynamic>.from(response));
  }

  @override
  Future<void> upsertList(ShoppingListModel list) async {
    await _client.from('shopping_lists').upsert(list.toDbJson());
  }

  @override
  Future<void> deleteList(String listId) async {
    await _client.from('shopping_lists').delete().eq('id', listId);
  }

  @override
  Future<List<ShoppingItemModel>> fetchItemsForList(String listId) async {
    final response = await _client
        .from('shopping_items')
        .select('*')
        .eq('list_id', listId)
        .order('sort_order', ascending: true);

    return (response as List).map((row) {
      return ShoppingItemModel.fromJson(Map<String, dynamic>.from(row));
    }).toList();
  }

  @override
  Future<void> upsertItem(ShoppingItemModel item) async {
    await _client.from('shopping_items').upsert(item.toDbJson());
  }

  @override
  Future<void> deleteItem(String itemId) async {
    await _client.from('shopping_items').delete().eq('id', itemId);
  }

  @override
  Future<void> toggleItemCompleted(String itemId, bool isCompleted) async {
    await _client
        .from('shopping_items')
        .update({'is_completed': isCompleted})
        .eq('id', itemId);
  }
}

/// In-memory Mock Repository for unit testing and offline simulation.
final class MockShoppingRepository implements ShoppingRepository {
  final Map<String, ShoppingListModel> lists = {};
  final Map<String, ShoppingItemModel> items = {};

  @override
  Future<List<ShoppingListModel>> fetchLists(String userId) async {
    final userLists = lists.values
        .where((l) => l.userId == userId)
        .toList()
      ..sort((a, b) => (b.createdAt ?? DateTime.now()).compareTo(a.createdAt ?? DateTime.now()));
    return userLists;
  }

  @override
  Future<ShoppingListModel?> fetchListById(String listId) async {
    return lists[listId];
  }

  @override
  Future<void> upsertList(ShoppingListModel list) async {
    lists[list.id] = list;
    for (final item in list.items) {
      items[item.id] = item;
    }
  }

  @override
  Future<void> deleteList(String listId) async {
    lists.remove(listId);
    items.removeWhere((_, item) => item.listId == listId);
  }

  @override
  Future<List<ShoppingItemModel>> fetchItemsForList(String listId) async {
    final listItems = items.values.where((i) => i.listId == listId).toList()
      ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
    return listItems;
  }

  @override
  Future<void> upsertItem(ShoppingItemModel item) async {
    items[item.id] = item;
    final parent = lists[item.listId];
    if (parent != null) {
      final updatedItems = List<ShoppingItemModel>.from(parent.items);
      final index = updatedItems.indexWhere((i) => i.id == item.id);
      if (index >= 0) {
        updatedItems[index] = item;
      } else {
        updatedItems.add(item);
      }
      lists[parent.id] = parent.copyWith(items: updatedItems);
    }
  }

  @override
  Future<void> deleteItem(String itemId) async {
    final item = items.remove(itemId);
    if (item != null) {
      final parent = lists[item.listId];
      if (parent != null) {
        final updatedItems = parent.items.where((i) => i.id != itemId).toList();
        lists[parent.id] = parent.copyWith(items: updatedItems);
      }
    }
  }

  @override
  Future<void> toggleItemCompleted(String itemId, bool isCompleted) async {
    final item = items[itemId];
    if (item != null) {
      await upsertItem(item.copyWith(isCompleted: isCompleted));
    }
  }
}
