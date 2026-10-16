import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/shopping_list_model.dart';
import 'offline_mutation.dart';

/// Contract for persisting pending offline mutations across application restarts.
abstract interface class QueueStorageDriver {
  Future<List<PendingOfflineOperation>> loadQueue(String userId);
  Future<void> saveQueue(String userId, List<PendingOfflineOperation> queue);
  Future<void> clearQueue(String userId);
}

/// Durable SharedPreferences driver matching web app's `yaad_offline_queue_u_${userId}` format.
final class SharedPreferencesQueueStorageDriver implements QueueStorageDriver {
  const SharedPreferencesQueueStorageDriver();

  static String _queueKey(String userId) => 'yaad_offline_queue_u_$userId';

  @override
  Future<List<PendingOfflineOperation>> loadQueue(String userId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_queueKey(userId));
      if (raw == null || raw.isEmpty) return [];

      final decoded = jsonDecode(raw);
      if (decoded is List) {
        return decoded
            .map((item) => PendingOfflineOperation.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  @override
  Future<void> saveQueue(String userId, List<PendingOfflineOperation> queue) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final serialized = jsonEncode(queue.map((op) => op.toJson()).toList());
      await prefs.setString(_queueKey(userId), serialized);
    } catch (_) {
      // Non-fatal persistence failure
    }
  }

  @override
  Future<void> clearQueue(String userId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_queueKey(userId));
    } catch (_) {
      // Non-fatal
    }
  }
}

/// In-memory queue driver for hermetic unit testing.
final class InMemoryQueueStorageDriver implements QueueStorageDriver {
  final Map<String, List<PendingOfflineOperation>> _storage = {};

  @override
  Future<List<PendingOfflineOperation>> loadQueue(String userId) async {
    return List.from(_storage[userId] ?? []);
  }

  @override
  Future<void> saveQueue(String userId, List<PendingOfflineOperation> queue) async {
    _storage[userId] = List.from(queue);
  }

  @override
  Future<void> clearQueue(String userId) async {
    _storage.remove(userId);
  }
}

/// Contract for persisting cached shopping lists across application restarts.
abstract interface class ListStorageDriver {
  Future<List<ShoppingListModel>> loadLists(String userId);
  Future<void> saveLists(String userId, List<ShoppingListModel> lists);
  Future<void> clearLists(String userId);
}

/// Durable SharedPreferences driver matching web app's `yaad_offline_lists_u_${userId}` format.
final class SharedPreferencesListStorageDriver implements ListStorageDriver {
  const SharedPreferencesListStorageDriver();

  static String _listsKey(String userId) => 'yaad_offline_lists_u_$userId';

  @override
  Future<List<ShoppingListModel>> loadLists(String userId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_listsKey(userId));
      if (raw == null || raw.isEmpty) return [];

      final decoded = jsonDecode(raw);
      if (decoded is List) {
        return decoded
            .map((item) => ShoppingListModel.fromJson(Map<String, dynamic>.from(item)))
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  @override
  Future<void> saveLists(String userId, List<ShoppingListModel> lists) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final serialized = jsonEncode(lists.map((l) => l.toFullJson()).toList());
      await prefs.setString(_listsKey(userId), serialized);
    } catch (_) {
      // Non-fatal persistence failure
    }
  }

  @override
  Future<void> clearLists(String userId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_listsKey(userId));
    } catch (_) {
      // Non-fatal
    }
  }
}

/// In-memory list cache driver for testing.
final class InMemoryListStorageDriver implements ListStorageDriver {
  final Map<String, List<ShoppingListModel>> _storage = {};

  @override
  Future<List<ShoppingListModel>> loadLists(String userId) async {
    return List.from(_storage[userId] ?? []);
  }

  @override
  Future<void> saveLists(String userId, List<ShoppingListModel> lists) async {
    _storage[userId] = List.from(lists);
  }

  @override
  Future<void> clearLists(String userId) async {
    _storage.remove(userId);
  }
}
