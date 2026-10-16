import 'package:flutter/material.dart';

/// Supported application languages in YAAD.
enum AppLanguage {
  en('English', 'en', TextDirection.ltr),
  ur('اردو', 'ur', TextDirection.rtl),
  romanUrdu('Roman Urdu', 'roman-urdu', TextDirection.ltr);

  const AppLanguage(this.displayName, this.code, this.direction);

  final String displayName;
  final String code;
  final TextDirection direction;

  static AppLanguage fromCode(String? code) {
    if (code == 'ur') return AppLanguage.ur;
    if (code == 'roman-urdu' || code == 'roman') return AppLanguage.romanUrdu;
    return AppLanguage.en;
  }
}

/// Centralized localization dictionary for YAAD Flutter.
///
/// Follows WWDC25 Session 225 ("Explore localization") principles:
/// dynamic text direction, appropriate font adjustments, and natural phrasing.
abstract final class YaadStrings {
  static const Map<String, Map<AppLanguage, String>> _translations = {
    'app_title': {
      AppLanguage.en: 'YAAD',
      AppLanguage.ur: 'یاد',
      AppLanguage.romanUrdu: 'YAAD',
    },
    'tagline': {
      AppLanguage.en: 'Smart Grocery & Pantry Tracking',
      AppLanguage.ur: 'اسمارٹ گھریلو سودا سلف کی فہرست',
      AppLanguage.romanUrdu: 'Smart Rashan aur Pantry List',
    },
    'all_categories': {
      AppLanguage.en: 'All',
      AppLanguage.ur: 'سب',
      AppLanguage.romanUrdu: 'Sab',
    },
    'pending_items': {
      AppLanguage.en: 'To Buy',
      AppLanguage.ur: 'خریدنے والی اشیاء',
      AppLanguage.romanUrdu: 'Kharidnay Wali Cheezein',
    },
    'completed_items': {
      AppLanguage.en: 'Packed in Cart',
      AppLanguage.ur: 'کارٹ میں موجود',
      AppLanguage.romanUrdu: 'Cart Mein Daali Gayi',
    },
    'empty_list_title': {
      AppLanguage.en: 'Your shopping list is empty',
      AppLanguage.ur: 'آپ کی فہرست خالی ہے',
      AppLanguage.romanUrdu: 'Aap ki list khali hai',
    },
    'empty_list_subtitle': {
      AppLanguage.en: 'Add items using Pakistani units like "1 pau aloo" or "sawa kilo sugar"',
      AppLanguage.ur: 'اشیاء شامل کریں جیسے "1 پاؤ آلو" یا "سوا کلو چینی"',
      AppLanguage.romanUrdu: 'Cheezein shamil karein jaise "1 pau aloo" ya "sawa kilo cheeni"',
    },
    'add_item_hint': {
      AppLanguage.en: 'e.g. 1 pau aloo, sawa kilo sugar, 1 dozen eggs...',
      AppLanguage.ur: 'مثلاً: 1 پاؤ آلو، سوا کلو چینی، 1 درجن انڈے...',
      AppLanguage.romanUrdu: 'Maslan: 1 pau aloo, sawa kilo cheeni, 1 darjan anday...',
    },
    'add_button': {
      AppLanguage.en: 'Add',
      AppLanguage.ur: 'شامل کریں',
      AppLanguage.romanUrdu: 'Shamil Karein',
    },
    'trip_progress': {
      AppLanguage.en: 'Shopping Progress',
      AppLanguage.ur: 'خریداری کی پیشرفت',
      AppLanguage.romanUrdu: 'Shopping ki Progress',
    },
    'items_packed': {
      AppLanguage.en: 'packed',
      AppLanguage.ur: 'پیک ہو گئیں',
      AppLanguage.romanUrdu: 'pack ho gayin',
    },
    'complete_trip': {
      AppLanguage.en: 'Complete Shopping Trip',
      AppLanguage.ur: 'خریداری مکمل کریں',
      AppLanguage.romanUrdu: 'Shopping Mukammal Karein',
    },
    'item_deleted': {
      AppLanguage.en: 'Item removed',
      AppLanguage.ur: 'آئٹم حذف ہو گیا',
      AppLanguage.romanUrdu: 'Item hata diya gaya',
    },
    'undo': {
      AppLanguage.en: 'Undo',
      AppLanguage.ur: 'واپس لائیں',
      AppLanguage.romanUrdu: 'Wapas Layein',
    },
    'category': {
      AppLanguage.en: 'Category',
      AppLanguage.ur: 'درجہ',
      AppLanguage.romanUrdu: 'Category',
    },
    'categories': {
      AppLanguage.en: 'Categories',
      AppLanguage.ur: 'اقسام',
      AppLanguage.romanUrdu: 'Categories',
    },
    'clear_completed': {
      AppLanguage.en: 'Clear Completed',
      AppLanguage.ur: 'مکمل اشیاء صاف کریں',
      AppLanguage.romanUrdu: 'Mukammal Cheezein Hatayein',
    },
    'guest_user': {
      AppLanguage.en: 'Guest User',
      AppLanguage.ur: 'مہمان صارف',
      AppLanguage.romanUrdu: 'Guest User',
    },
    'guest_subtitle': {
      AppLanguage.en: 'Sign in to sync your shopping lists across devices',
      AppLanguage.ur: 'لسٹیں سنک اور محفوظ رکھنے کے لیے سائن ان کریں',
      AppLanguage.romanUrdu: 'Lists sync aur mehfooz rakhne k liye sign in karein',
    },
    'synced': {
      AppLanguage.en: 'All changes synced',
      AppLanguage.ur: 'تمام تبدیلیاں سنک ہو گئیں',
      AppLanguage.romanUrdu: 'Tamam tabdeeliyan sync ho gayin',
    },
    'syncing': {
      AppLanguage.en: 'Syncing...',
      AppLanguage.ur: 'سنک ہو رہا ہے...',
      AppLanguage.romanUrdu: 'Sync ho raha hai...',
    },
    'pending_changes': {
      AppLanguage.en: 'pending changes',
      AppLanguage.ur: 'تبدیلیاں باقی ہیں',
      AppLanguage.romanUrdu: 'tabdeeliyan baqi hain',
    },
  };

  static String get(String key, AppLanguage lang) {
    return _translations[key]?[lang] ?? _translations[key]?[AppLanguage.en] ?? key;
  }
}
