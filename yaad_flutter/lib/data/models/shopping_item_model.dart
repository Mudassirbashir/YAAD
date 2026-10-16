/// Shopping Item domain model matching Supabase `public.shopping_items` table
/// and client-side rich item metadata.
library;

import 'category_model.dart';

final class ShoppingItemModel {
  const ShoppingItemModel({
    required this.id,
    required this.listId,
    required this.userId,
    required this.itemName,
    this.category = 'other',
    this.quantity,
    this.unit,
    this.rawInput,
    this.isCompleted = false,
    this.sortOrder = 0,
    this.canonicalName,
    this.nameUrdu,
    this.nameRomanUrdu,
    this.emoji,
    this.note,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String listId;
  final String userId;
  final String itemName;
  final String category;
  final String? quantity;
  final String? unit;
  final String? rawInput;
  final bool isCompleted;
  final int sortOrder;

  // Multilingual and recognition metadata
  final String? canonicalName;
  final String? nameUrdu;
  final String? nameRomanUrdu;
  final String? emoji;
  final String? note;

  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory ShoppingItemModel.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic val) {
      if (val == null) return null;
      if (val is DateTime) return val;
      if (val is String) return DateTime.tryParse(val);
      if (val is int) return DateTime.fromMillisecondsSinceEpoch(val);
      return null;
    }

    final rawCategory = json['category'] as String? ?? json['categoryId'] as String? ?? 'other';
    final normalizedCategory = normalizeCategoryId(rawCategory);

    return ShoppingItemModel(
      id: json['id'] as String? ?? '',
      listId: json['list_id'] as String? ?? json['listId'] as String? ?? '',
      userId: json['user_id'] as String? ?? json['userId'] as String? ?? '',
      itemName: json['item_name'] as String? ?? json['itemName'] as String? ?? json['name'] as String? ?? '',
      category: normalizedCategory,
      quantity: json['quantity']?.toString(),
      unit: json['unit'] as String?,
      rawInput: json['raw_input'] as String? ?? json['rawInput'] as String?,
      isCompleted: json['is_completed'] as bool? ?? json['isCompleted'] as bool? ?? json['completed'] as bool? ?? false,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? (json['sortOrder'] as num?)?.toInt() ?? 0,
      canonicalName: json['canonical_name'] as String? ?? json['canonicalName'] as String?,
      nameUrdu: json['name_urdu'] as String? ?? json['nameUrdu'] as String?,
      nameRomanUrdu: json['name_roman_urdu'] as String? ?? json['nameRomanUrdu'] as String?,
      emoji: json['emoji'] as String?,
      note: json['note'] as String?,
      createdAt: parseDate(json['created_at'] ?? json['createdAt']),
      updatedAt: parseDate(json['updated_at'] ?? json['updatedAt']),
    );
  }

  /// Exports map matching the `shopping_items` relational database schema.
  Map<String, dynamic> toDbJson() {
    return {
      'id': id,
      'list_id': listId,
      'user_id': userId,
      'item_name': itemName,
      'category': category,
      if (quantity != null) 'quantity': quantity,
      if (unit != null) 'unit': unit,
      if (rawInput != null) 'raw_input': rawInput,
      'is_completed': isCompleted,
      'sort_order': sortOrder,
      if (createdAt != null) 'created_at': createdAt!.toUtc().toIso8601String(),
      if (updatedAt != null) 'updated_at': updatedAt!.toUtc().toIso8601String(),
    };
  }

  /// Exports full embedded JSON payload (matching `ShoppingItem` in `src/types.ts` & list JSON column).
  Map<String, dynamic> toFullJson() {
    return {
      'id': id,
      'listId': listId,
      'userId': userId,
      'name': itemName,
      'item_name': itemName,
      'categoryId': category,
      'category': category,
      'completed': isCompleted,
      'is_completed': isCompleted,
      if (quantity != null) 'quantity': quantity,
      if (unit != null) 'unit': unit,
      if (rawInput != null) 'rawInput': rawInput,
      if (rawInput != null) 'raw_input': rawInput,
      'sort_order': sortOrder,
      if (canonicalName != null) 'canonicalName': canonicalName,
      if (nameUrdu != null) 'nameUrdu': nameUrdu,
      if (nameRomanUrdu != null) 'nameRomanUrdu': nameRomanUrdu,
      if (emoji != null) 'emoji': emoji,
      if (note != null) 'note': note,
      if (createdAt != null) 'createdAt': createdAt!.millisecondsSinceEpoch,
      if (updatedAt != null) 'updatedAt': updatedAt!.millisecondsSinceEpoch,
    };
  }

  ShoppingItemModel copyWith({
    String? itemName,
    String? category,
    String? quantity,
    String? unit,
    String? rawInput,
    bool? isCompleted,
    int? sortOrder,
    String? canonicalName,
    String? nameUrdu,
    String? nameRomanUrdu,
    String? emoji,
    String? note,
    DateTime? updatedAt,
  }) {
    return ShoppingItemModel(
      id: id,
      listId: listId,
      userId: userId,
      itemName: itemName ?? this.itemName,
      category: category ?? this.category,
      quantity: quantity ?? this.quantity,
      unit: unit ?? this.unit,
      rawInput: rawInput ?? this.rawInput,
      isCompleted: isCompleted ?? this.isCompleted,
      sortOrder: sortOrder ?? this.sortOrder,
      canonicalName: canonicalName ?? this.canonicalName,
      nameUrdu: nameUrdu ?? this.nameUrdu,
      nameRomanUrdu: nameRomanUrdu ?? this.nameRomanUrdu,
      emoji: emoji ?? this.emoji,
      note: note ?? this.note,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ShoppingItemModel && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'ShoppingItemModel(id: $id, name: $itemName, completed: $isCompleted)';
}
