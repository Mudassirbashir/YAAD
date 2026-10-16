/// Shopping List domain model matching Supabase `public.shopping_lists` table.
library;

import 'shopping_item_model.dart';

final class ShoppingListModel {
  const ShoppingListModel({
    required this.id,
    required this.userId,
    required this.title,
    this.householdId,
    this.icon = 'shopping_basket',
    this.isCompleted = false,
    this.completedAt,
    this.items = const [],
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String userId;
  final String? householdId;
  final String title;
  final String icon;
  final bool isCompleted;
  final DateTime? completedAt;
  final List<ShoppingItemModel> items;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory ShoppingListModel.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic val) {
      if (val == null) return null;
      if (val is DateTime) return val;
      if (val is String) return DateTime.tryParse(val);
      if (val is int) return DateTime.fromMillisecondsSinceEpoch(val);
      return null;
    }

    final rawItems = json['items'];
    final parsedItems = <ShoppingItemModel>[];
    if (rawItems is List) {
      for (final item in rawItems) {
        if (item is Map<String, dynamic>) {
          parsedItems.add(ShoppingItemModel.fromJson(item));
        } else if (item is Map) {
          parsedItems.add(ShoppingItemModel.fromJson(Map<String, dynamic>.from(item)));
        }
      }
    }

    return ShoppingListModel(
      id: json['id'] as String? ?? '',
      userId: json['user_id'] as String? ?? json['userId'] as String? ?? '',
      householdId: json['household_id'] as String? ?? json['householdId'] as String?,
      title: json['title'] as String? ?? '',
      icon: json['icon'] as String? ?? 'shopping_basket',
      isCompleted: json['is_completed'] as bool? ??
          json['isCompleted'] as bool? ??
          json['completed'] as bool? ??
          false,
      completedAt: parseDate(json['completed_at'] ?? json['completedAt']),
      items: parsedItems,
      createdAt: parseDate(json['created_at'] ?? json['createdAt']),
      updatedAt: parseDate(json['updated_at'] ?? json['updatedAt']),
    );
  }

  /// Exports map matching the `shopping_lists` relational database schema.
  Map<String, dynamic> toDbJson() {
    return {
      'id': id,
      'user_id': userId,
      if (householdId != null) 'household_id': householdId,
      'title': title,
      'icon': icon,
      'is_completed': isCompleted,
      if (completedAt != null) 'completed_at': completedAt!.toUtc().toIso8601String(),
      'items': items.map((i) => i.toFullJson()).toList(),
      if (createdAt != null) 'created_at': createdAt!.toUtc().toIso8601String(),
      if (updatedAt != null) 'updated_at': updatedAt!.toUtc().toIso8601String(),
    };
  }

  /// Exports complete representation for offline local database and sync payloads.
  Map<String, dynamic> toFullJson() {
    return {
      'id': id,
      'userId': userId,
      'user_id': userId,
      if (householdId != null) 'householdId': householdId,
      if (householdId != null) 'household_id': householdId,
      'title': title,
      'icon': icon,
      'isCompleted': isCompleted,
      'is_completed': isCompleted,
      if (completedAt != null) 'completedAt': completedAt!.toUtc().toIso8601String(),
      'items': items.map((i) => i.toFullJson()).toList(),
      if (createdAt != null) 'createdAt': createdAt!.toUtc().toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toUtc().toIso8601String(),
    };
  }

  ShoppingListModel copyWith({
    String? title,
    String? householdId,
    String? icon,
    bool? isCompleted,
    DateTime? completedAt,
    List<ShoppingItemModel>? items,
    DateTime? updatedAt,
  }) {
    return ShoppingListModel(
      id: id,
      userId: userId,
      householdId: householdId ?? this.householdId,
      title: title ?? this.title,
      icon: icon ?? this.icon,
      isCompleted: isCompleted ?? this.isCompleted,
      completedAt: completedAt ?? this.completedAt,
      items: items ?? this.items,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ShoppingListModel && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'ShoppingListModel(id: $id, title: $title, items: ${items.length})';
}
