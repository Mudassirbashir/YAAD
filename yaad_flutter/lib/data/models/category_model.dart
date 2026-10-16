/// Canonical Category definitions, aliases, and normalization.
///
/// Matches database table `public.categories` and `src/types.ts`.
library;

final class CategoryModel {
  const CategoryModel({
    required this.id,
    required this.nameEn,
    required this.nameUr,
    required this.nameRomanUrdu,
    required this.icon,
    this.sortOrder = 0,
    this.active = true,
  });

  final String id;
  final String nameEn;
  final String nameUr;
  final String nameRomanUrdu;
  final String icon;
  final int sortOrder;
  final bool active;

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: normalizeCategoryId(json['id'] as String?),
      nameEn: json['name_en'] as String? ?? json['nameEn'] as String? ?? 'Other',
      nameUr: json['name_ur'] as String? ?? json['nameUr'] as String? ?? 'دیگر',
      nameRomanUrdu: json['name_roman_urdu'] as String? ?? json['nameRomanUrdu'] as String? ?? 'Deegar',
      icon: json['icon'] as String? ?? 'category',
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? (json['order'] as num?)?.toInt() ?? 0,
      active: json['active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name_en': nameEn,
      'name_ur': nameUr,
      'name_roman_urdu': nameRomanUrdu,
      'icon': icon,
      'sort_order': sortOrder,
      'active': active,
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CategoryModel && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'CategoryModel(id: $id, nameEn: $nameEn, icon: $icon)';
}

/// Normalizes any category string into the canonical CategoryId,
/// handling backward-compatibility aliases exactly like `src/types.ts:normalizeCategoryId`.
String normalizeCategoryId(String? raw) {
  if (raw == null || raw.trim().isEmpty) return 'other';
  final clean = raw.toLowerCase().trim();

  if (clean == 'oils' || clean == 'oil' || clean == 'cooking_oil' || clean == 'ghee') {
    return 'oils';
  }
  if (clean == 'grocery' || clean == 'canned_food' || clean == 'grains_staples') {
    return 'cooking_essentials';
  }
  if (clean == 'perishables' || clean == 'fresh_produce') {
    return 'vegetables';
  }
  if (clean == 'eggs') {
    return 'poultry';
  }
  if (clean == 'baby') {
    return 'baby_care';
  }
  if (clean == 'medicines') {
    return 'health';
  }
  if (clean == 'herbal') {
    return 'herbs';
  }
  if (clean == 'home' || clean == 'hardware' || clean == 'clothing' || clean == 'pet_supplies') {
    return 'household';
  }

  final exists = standardCategories.any((c) => c.id == clean);
  return exists ? clean : 'other';
}

/// Standard predefined YAAD categories matching `CATEGORIES_LIST` in `src/types.ts`.
const List<CategoryModel> standardCategories = [
  CategoryModel(id: 'vegetables', icon: 'eco', nameEn: 'Vegetables', nameUr: 'سبزیاں', nameRomanUrdu: 'Sabziyan', sortOrder: 1),
  CategoryModel(id: 'fruits', icon: 'nutrition', nameEn: 'Fruits', nameUr: 'پھل', nameRomanUrdu: 'Phal', sortOrder: 2),
  CategoryModel(id: 'dairy', icon: 'water_drop', nameEn: 'Dairy', nameUr: 'دودھ دہی', nameRomanUrdu: 'Doodh Dahi', sortOrder: 3),
  CategoryModel(id: 'meat', icon: 'set_meal', nameEn: 'Meat', nameUr: 'گوشت', nameRomanUrdu: 'Gosht', sortOrder: 4),
  CategoryModel(id: 'poultry', icon: 'egg', nameEn: 'Poultry & Eggs', nameUr: 'مرغی اور انڈے', nameRomanUrdu: 'Murghi aur Anday', sortOrder: 5),
  CategoryModel(id: 'seafood', icon: 'phishing', nameEn: 'Seafood', nameUr: 'مچھلی', nameRomanUrdu: 'Machli', sortOrder: 6),
  CategoryModel(id: 'bakery', icon: 'bakery_dining', nameEn: 'Bakery', nameUr: 'بیکری', nameRomanUrdu: 'Bakery', sortOrder: 7),
  CategoryModel(id: 'oils', icon: 'inventory_2', nameEn: 'Cooking Oil & Ghee', nameUr: 'تیل اور گھی', nameRomanUrdu: 'Tel aur Ghee', sortOrder: 8),
  CategoryModel(id: 'cooking_essentials', icon: 'inventory_2', nameEn: 'Cooking Essentials', nameUr: 'کھانا پکانے کے سامان', nameRomanUrdu: 'Khana Pakanay ka Saman', sortOrder: 9),
  CategoryModel(id: 'rice', icon: 'grain', nameEn: 'Rice', nameUr: 'چاول', nameRomanUrdu: 'Chawal', sortOrder: 10),
  CategoryModel(id: 'grains', icon: 'grain', nameEn: 'Grains', nameUr: 'اناج', nameRomanUrdu: 'Anaaj', sortOrder: 11),
  CategoryModel(id: 'pulses', icon: 'soup', nameEn: 'Pulses & Lentils', nameUr: 'دالیں', nameRomanUrdu: 'Daalein', sortOrder: 12),
  CategoryModel(id: 'spices', icon: 'local_fire_department', nameEn: 'Spices', nameUr: 'مصالحہ جات', nameRomanUrdu: 'Masalay', sortOrder: 13),
  CategoryModel(id: 'herbs', icon: 'spa', nameEn: 'Herbs', nameUr: 'جڑی بوٹیاں', nameRomanUrdu: 'Jari Bootiyan', sortOrder: 14),
  CategoryModel(id: 'dry_fruits', icon: 'grain', nameEn: 'Dry Fruits', nameUr: 'خشک میوہ جات', nameRomanUrdu: 'Khushk Meway', sortOrder: 15),
  CategoryModel(id: 'beverages', icon: 'local_cafe', nameEn: 'Beverages', nameUr: 'مشروبات', nameRomanUrdu: 'Mashroobaat', sortOrder: 16),
  CategoryModel(id: 'snacks', icon: 'cookie', nameEn: 'Snacks', nameUr: 'نمکو اور اسنیکس', nameRomanUrdu: 'Snacks', sortOrder: 17),
  CategoryModel(id: 'frozen', icon: 'ac_unit', nameEn: 'Frozen Food', nameUr: 'منجمد اشیاء', nameRomanUrdu: 'Frozen Items', sortOrder: 18),
  CategoryModel(id: 'sauces_condiments', icon: 'liquor', nameEn: 'Sauces & Condiments', nameUr: 'چٹنیاں اور ساسز', nameRomanUrdu: 'Sauces', sortOrder: 19),
  CategoryModel(id: 'household', icon: 'home', nameEn: 'Household', nameUr: 'گھریلو سامان', nameRomanUrdu: 'Gharelu Saman', sortOrder: 20),
  CategoryModel(id: 'kitchen', icon: 'home', nameEn: 'Kitchen', nameUr: 'باورچی خانہ', nameRomanUrdu: 'Bawarchi Khana', sortOrder: 21),
  CategoryModel(id: 'cleaning', icon: 'cleaning_services', nameEn: 'Cleaning', nameUr: 'صفائی کا سامان', nameRomanUrdu: 'Safai ka Saman', sortOrder: 22),
  CategoryModel(id: 'personal_care', icon: 'soap', nameEn: 'Personal Care', nameUr: 'ذاتی نگہداشت', nameRomanUrdu: 'Personal Care', sortOrder: 23),
  CategoryModel(id: 'baby_care', icon: 'child_care', nameEn: 'Baby Care', nameUr: 'بچوں کی دیکھ بھال', nameRomanUrdu: 'Baby Care', sortOrder: 24),
  CategoryModel(id: 'health', icon: 'medication', nameEn: 'Medicines / Health', nameUr: 'ادویات اور صحت', nameRomanUrdu: 'Dawain aur Sehat', sortOrder: 25),
  CategoryModel(id: 'stationery', icon: 'edit_note', nameEn: 'Stationery', nameUr: 'اسٹیشنری', nameRomanUrdu: 'Stationery', sortOrder: 26),
  CategoryModel(id: 'electronics', icon: 'devices', nameEn: 'Electronics', nameUr: 'الیکٹرانکس', nameRomanUrdu: 'Electronics', sortOrder: 27),
  CategoryModel(id: 'uncategorized', icon: 'category', nameEn: 'Uncategorized', nameUr: 'غیر درجہ بند', nameRomanUrdu: 'Ghair Darja Band', sortOrder: 28),
  CategoryModel(id: 'other', icon: 'category', nameEn: 'Other', nameUr: 'دیگر', nameRomanUrdu: 'Deegar', sortOrder: 29),
];
