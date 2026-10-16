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

    final rawLists = (response as List).map((row) {
      return ShoppingListModel.fromJson(Map<String, dynamic>.from(row));
    }).toList();

    final enriched = <ShoppingListModel>[];
    for (final list in rawLists) {
      final childItems = await fetchItemsForList(list.id);
      if (childItems.isNotEmpty) {
        enriched.add(list.copyWith(items: childItems));
      } else {
        enriched.add(list);
      }
    }
    return enriched;
  }

  @override
  Future<ShoppingListModel?> fetchListById(String listId) async {
    final response = await _client
        .from('shopping_lists')
        .select('*')
        .eq('id', listId)
        .maybeSingle();

    if (response == null) return null;
    final list = ShoppingListModel.fromJson(Map<String, dynamic>.from(response));
    final childItems = await fetchItemsForList(listId);
    if (childItems.isNotEmpty) {
      return list.copyWith(items: childItems);
    }
    return list;
  }

  @override
  Future<void> upsertList(ShoppingListModel list) async {
    await _client.from('shopping_lists').upsert(list.toDbJson());
    for (final item in list.items) {
      await _client.from('shopping_items').upsert(item.toDbJson());
    }
  }

  @override
  Future<void> deleteList(String listId) async {
    await _client.from('shopping_items').delete().eq('list_id', listId);
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
  MockShoppingRepository({
    Map<String, ShoppingListModel>? initialLists,
    Map<String, ShoppingItemModel>? initialItems,
  }) {
    if (initialLists != null) lists.addAll(initialLists);
    if (initialItems != null) items.addAll(initialItems);
  }

  final Map<String, ShoppingListModel> lists = {};
  final Map<String, ShoppingItemModel> items = {};

  /// Exports current snapshot for testing state restoration across app restarts.
  Map<String, dynamic> exportState() {
    return {
      'lists': lists.map((k, v) => MapEntry(k, v.toFullJson())),
      'items': items.map((k, v) => MapEntry(k, v.toFullJson())),
    };
  }

  /// Imports snapshot to restore state after simulated app restart.
  void importState(Map<String, dynamic> state) {
    lists.clear();
    items.clear();
    final rawLists = state['lists'] as Map<String, dynamic>?;
    if (rawLists != null) {
      for (final entry in rawLists.entries) {
        lists[entry.key] = ShoppingListModel.fromJson(entry.value as Map<String, dynamic>);
      }
    }
    final rawItems = state['items'] as Map<String, dynamic>?;
    if (rawItems != null) {
      for (final entry in rawItems.entries) {
        items[entry.key] = ShoppingItemModel.fromJson(entry.value as Map<String, dynamic>);
      }
    }
  }

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
