/// Pakistani grocery units, number words, and extraction logic.
///
/// Fully preserves traditional South Asian weights, packaging terms,
/// and vernacular fractions (e.g., pao, adha, sawa, dedh, darjan, gucchi).
library;

/// Representation of a parsed quantity and unit from input text.
final class ExtractedQuantityAndUnit {
  const ExtractedQuantityAndUnit({
    required this.quantity,
    required this.unit,
    required this.cleanName,
  });

  final String? quantity;
  final String? unit;
  final String cleanName;

  @override
  String toString() => 'ExtractedQuantityAndUnit(qty: $quantity, unit: $unit, name: $cleanName)';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ExtractedQuantityAndUnit &&
          runtimeType == other.runtimeType &&
          quantity == other.quantity &&
          unit == other.unit &&
          cleanName == other.cleanName;

  @override
  int get hashCode => Object.hash(quantity, unit, cleanName);
}

/// Metadata and definitions for standard grocery units in Pakistan.
abstract final class PakistaniUnits {
  // Canonical unit constants matching src/lib/recognition/quantityExtractor.ts
  static const String kg = 'kg';
  static const String g = 'g';
  static const String mg = 'mg';
  static const String l = 'l';
  static const String ml = 'ml';
  static const String dozen = 'dozen';
  static const String packet = 'packet';
  static const String bottle = 'bottle';
  static const String box = 'box';
  static const String can = 'can';
  static const String jar = 'jar';
  static const String bag = 'bag';
  static const String carton = 'carton';
  static const String bundle = 'bundle';
  static const String pair = 'pair';
  static const String piece = 'piece';
  static const String pao = 'pao'; // Traditional South Asian 250g
  static const String seer = 'seer';

  /// Mapping from various spelling forms to canonical unit identifier and labels.
  static const Map<String, ({String standard, String label, String urduLabel})> unitMap = {
    // Weight - Kilograms
    'kg': (standard: 'kg', label: 'kg', urduLabel: 'کلو'),
    'kgs': (standard: 'kg', label: 'kg', urduLabel: 'کلو'),
    'kilo': (standard: 'kg', label: 'kg', urduLabel: 'کلو'),
    'kilos': (standard: 'kg', label: 'kg', urduLabel: 'کلو'),
    'kilogram': (standard: 'kg', label: 'kg', urduLabel: 'کلو'),
    'kilograms': (standard: 'kg', label: 'kg', urduLabel: 'کلو'),
    'keelo': (standard: 'kg', label: 'kg', urduLabel: 'کلو'),
    'kelo': (standard: 'kg', label: 'kg', urduLabel: 'کلو'),
    'کلو': (standard: 'kg', label: 'kg', urduLabel: 'کلو'),

    // Weight - Grams
    'g': (standard: 'g', label: 'g', urduLabel: 'گرام'),
    'gm': (standard: 'g', label: 'g', urduLabel: 'گرام'),
    'gms': (standard: 'g', label: 'g', urduLabel: 'گرام'),
    'gram': (standard: 'g', label: 'g', urduLabel: 'گرام'),
    'grams': (standard: 'g', label: 'g', urduLabel: 'گرام'),
    'graam': (standard: 'g', label: 'g', urduLabel: 'گرام'),
    'گرام': (standard: 'g', label: 'g', urduLabel: 'گرام'),

    // Volume - Liters
    'l': (standard: 'l', label: 'l', urduLabel: 'لیٹر'),
    'lt': (standard: 'l', label: 'l', urduLabel: 'لیٹر'),
    'ltr': (standard: 'l', label: 'l', urduLabel: 'لیٹر'),
    'ltrs': (standard: 'l', label: 'l', urduLabel: 'لیٹر'),
    'liter': (standard: 'l', label: 'l', urduLabel: 'لیٹر'),
    'liters': (standard: 'l', label: 'l', urduLabel: 'لیٹر'),
    'litre': (standard: 'l', label: 'l', urduLabel: 'لیٹر'),
    'litres': (standard: 'l', label: 'l', urduLabel: 'لیٹر'),
    'leetar': (standard: 'l', label: 'l', urduLabel: 'لیٹر'),
    'لیٹر': (standard: 'l', label: 'l', urduLabel: 'لیٹر'),

    // Volume - Milliliters
    'ml': (standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر'),
    'mls': (standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر'),
    'milliliter': (standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر'),
    'ملی لیٹر': (standard: 'ml', label: 'ml', urduLabel: 'ملی لیٹر'),

    // Count - Dozen (darjan, dazan)
    'dozen': (standard: 'dozen', label: 'dozen', urduLabel: 'درجن'),
    'dozens': (standard: 'dozen', label: 'dozen', urduLabel: 'درجن'),
    'doz': (standard: 'dozen', label: 'dozen', urduLabel: 'درجن'),
    'darjan': (standard: 'dozen', label: 'dozen', urduLabel: 'درجن'),
    'darzan': (standard: 'dozen', label: 'dozen', urduLabel: 'درجن'),
    'dazan': (standard: 'dozen', label: 'dozen', urduLabel: 'درجن'),
    'درجن': (standard: 'dozen', label: 'dozen', urduLabel: 'درجن'),

    // Packaging - Packets
    'packet': (standard: 'packet', label: 'packet', urduLabel: 'پیکٹ'),
    'packets': (standard: 'packet', label: 'packet', urduLabel: 'پیکٹ'),
    'pack': (standard: 'packet', label: 'packet', urduLabel: 'پیکٹ'),
    'packs': (standard: 'packet', label: 'packet', urduLabel: 'پیکٹ'),
    'pkt': (standard: 'packet', label: 'packet', urduLabel: 'پیکٹ'),
    'pkts': (standard: 'packet', label: 'packet', urduLabel: 'پیکٹ'),
    'پیکٹ': (standard: 'packet', label: 'packet', urduLabel: 'پیکٹ'),

    // Containers - Box (dabba)
    'box': (standard: 'box', label: 'box', urduLabel: 'ڈبہ'),
    'boxes': (standard: 'box', label: 'box', urduLabel: 'ڈبے'),
    'dabba': (standard: 'box', label: 'box', urduLabel: 'ڈبہ'),
    'dabbe': (standard: 'box', label: 'box', urduLabel: 'ڈبے'),
    'ڈبہ': (standard: 'box', label: 'box', urduLabel: 'ڈبہ'),
    'ڈبے': (standard: 'box', label: 'box', urduLabel: 'ڈبے'),

    // Containers - Bottle
    'bottle': (standard: 'bottle', label: 'bottle', urduLabel: 'بوتل'),
    'bottles': (standard: 'bottle', label: 'bottle', urduLabel: 'بوتل'),
    'botal': (standard: 'bottle', label: 'bottle', urduLabel: 'بوتل'),
    'botlein': (standard: 'bottle', label: 'bottle', urduLabel: 'بوتل'),
    'بوتل': (standard: 'bottle', label: 'bottle', urduLabel: 'بوتل'),
    'بوتلیں': (standard: 'bottle', label: 'bottle', urduLabel: 'بوتل'),

    // Bundles & Bunches (gucchi, tali, gaddi)
    'bundle': (standard: 'bundle', label: 'bundle', urduLabel: 'گڈی'),
    'bundles': (standard: 'bundle', label: 'bundle', urduLabel: 'گڈی'),
    'bunch': (standard: 'bundle', label: 'bundle', urduLabel: 'گڈی'),
    'bunches': (standard: 'bundle', label: 'bundle', urduLabel: 'گڈی'),
    'gucchi': (standard: 'bundle', label: 'bundle', urduLabel: 'گچھی'),
    'guchi': (standard: 'bundle', label: 'bundle', urduLabel: 'گچھی'),
    'tali': (standard: 'bundle', label: 'bundle', urduLabel: 'گڈی'),
    'gaddi': (standard: 'bundle', label: 'bundle', urduLabel: 'گڈی'),
    'گڈی': (standard: 'bundle', label: 'bundle', urduLabel: 'گڈی'),
    'گچھی': (standard: 'bundle', label: 'bundle', urduLabel: 'گچھی'),

    // Bags (thela, bori)
    'bag': (standard: 'bag', label: 'bag', urduLabel: 'تھیلا'),
    'bags': (standard: 'bag', label: 'bag', urduLabel: 'تھیلا'),
    'thela': (standard: 'bag', label: 'bag', urduLabel: 'تھیلا'),
    'bori': (standard: 'bag', label: 'bag', urduLabel: 'بوری'),
    'تھیلا': (standard: 'bag', label: 'bag', urduLabel: 'تھیلا'),
    'بوری': (standard: 'bag', label: 'bag', urduLabel: 'بوری'),

    // Discrete Pieces (dana, adad)
    'piece': (standard: 'piece', label: 'piece', urduLabel: 'عدد'),
    'pieces': (standard: 'piece', label: 'piece', urduLabel: 'عدد'),
    'pc': (standard: 'piece', label: 'piece', urduLabel: 'عدد'),
    'pcs': (standard: 'piece', label: 'piece', urduLabel: 'عدد'),
    'adad': (standard: 'piece', label: 'piece', urduLabel: 'عدد'),
    'dana': (standard: 'piece', label: 'piece', urduLabel: 'دانہ'),
    'dane': (standard: 'piece', label: 'piece', urduLabel: 'دانہ'),
    'عدد': (standard: 'piece', label: 'piece', urduLabel: 'عدد'),
    'دانہ': (standard: 'piece', label: 'piece', urduLabel: 'دانہ'),

    // Traditional South Asian Specific (pao, seer)
    'pau': (standard: 'pao', label: 'pao', urduLabel: 'پاؤ'),
    'pao': (standard: 'pao', label: 'pao', urduLabel: 'پاؤ'),
    'paao': (standard: 'pao', label: 'pao', urduLabel: 'پاؤ'),
    'pow': (standard: 'pao', label: 'pao', urduLabel: 'پاؤ'),
    'پاؤ': (standard: 'pao', label: 'pao', urduLabel: 'پاؤ'),
    'پاو': (standard: 'pao', label: 'pao', urduLabel: 'پاؤ'),
    'seer': (standard: 'seer', label: 'seer', urduLabel: 'سیر'),
    'ser': (standard: 'seer', label: 'seer', urduLabel: 'سیر'),
    'سیر': (standard: 'seer', label: 'seer', urduLabel: 'سیر'),
  };

  /// Pakistani word numbers mapping
  static const Map<String, String> wordNumberMap = {
    'half': '0.5',
    'adha': '0.5',
    'aadha': '0.5',
    'aada': '0.5',
    'addha': '0.5',
    'aadhi': '0.5',
    'adhey': '0.5',
    'آدھا': '0.5',
    'ادھا': '0.5',
    'آدھی': '0.5',

    'paon': '0.75',
    'paona': '0.75',
    'pauna': '0.75',
    'pona': '0.75',
    'پونا': '0.75',
    'پونے': '0.75',

    'sawa': '1.25',
    'swa': '1.25',
    'سوا': '1.25',

    'dedh': '1.5',
    'deedh': '1.5',
    'ڈیڑھ': '1.5',

    'dhai': '2.5',
    'dhaai': '2.5',
    'ڈھائی': '2.5',
  };

  /// Resolves the unit's localized label (English or Urdu).
  static String formatUnit(String? unit, {bool inUrdu = false}) {
    if (unit == null || unit.isEmpty) return '';
    final entry = unitMap[unit.toLowerCase()];
    if (entry == null) return unit;
    return inUrdu ? entry.urduLabel : entry.label;
  }
}

/// Extracts quantity, unit, and clean item name from raw user input,
/// adhering strictly to Pakistani grocery specifications.
ExtractedQuantityAndUnit extractQuantityAndUnit(String rawInput) {
  final trimmed = rawInput.trim();
  if (trimmed.isEmpty) {
    return const ExtractedQuantityAndUnit(quantity: null, unit: null, cleanName: '');
  }

  final tokens = trimmed.split(RegExp(r'\s+')).where((t) => t.isNotEmpty).toList();
  if (tokens.isEmpty) {
    return ExtractedQuantityAndUnit(quantity: null, unit: null, cleanName: trimmed);
  }

  final firstLower = tokens[0].toLowerCase();

  // 1. Compound terms: sawa kilo, dedh kilo, adha kilo, adha pau, etc.
  if (tokens.length >= 2) {
    final secondLower = tokens[1].toLowerCase();

    // Word number + unit (e.g. 'sawa kilo', 'adha pau', 'dedh kilo')
    if (PakistaniUnits.wordNumberMap.containsKey(firstLower) &&
        PakistaniUnits.unitMap.containsKey(secondLower)) {
      final qty = PakistaniUnits.wordNumberMap[firstLower]!;
      final unitInfo = PakistaniUnits.unitMap[secondLower]!;
      final remaining = tokens.sublist(2).join(' ');
      return ExtractedQuantityAndUnit(
        quantity: qty,
        unit: unitInfo.standard,
        cleanName: remaining,
      );
    }

    // Number + unit (e.g. '1 pau aloo', '1 dazan anday', '2 darjan kele')
    final parsedFirstNum = double.tryParse(firstLower);
    if (parsedFirstNum != null && PakistaniUnits.unitMap.containsKey(secondLower)) {
      final unitInfo = PakistaniUnits.unitMap[secondLower]!;
      // Format number without unnecessary trailing .0
      final qtyStr = parsedFirstNum % 1 == 0
          ? parsedFirstNum.toInt().toString()
          : parsedFirstNum.toString();
      final remaining = tokens.sublist(2).join(' ');
      return ExtractedQuantityAndUnit(
        quantity: qtyStr,
        unit: unitInfo.standard,
        cleanName: remaining,
      );
    }
  }

  // 2. Standalone number word at start (e.g. 'adha kilo' already handled, but 'pau aloo' -> 1 pao)
  if (PakistaniUnits.unitMap.containsKey(firstLower)) {
    final unitInfo = PakistaniUnits.unitMap[firstLower]!;
    final remaining = tokens.sublist(1).join(' ');
    return ExtractedQuantityAndUnit(
      quantity: '1',
      unit: unitInfo.standard,
      cleanName: remaining,
    );
  }

  // 3. Single word number (e.g. 'adha tamatar' -> 0.5 piece tamatar)
  if (PakistaniUnits.wordNumberMap.containsKey(firstLower)) {
    final qty = PakistaniUnits.wordNumberMap[firstLower]!;
    final remaining = tokens.sublist(1).join(' ');
    return ExtractedQuantityAndUnit(
      quantity: qty,
      unit: null,
      cleanName: remaining,
    );
  }

  // 4. Combined number+unit token (e.g. '2kg aloo', '500g sugar', '1.5l milk')
  final match = RegExp(r'^(\d+(?:\.\d+)?)\s*([a-zA-Z\u0600-\u06FF]+)$').firstMatch(tokens[0]);
  if (match != null) {
    final numStr = match.group(1)!;
    final unitCandidate = match.group(2)!.toLowerCase();
    if (PakistaniUnits.unitMap.containsKey(unitCandidate)) {
      final unitInfo = PakistaniUnits.unitMap[unitCandidate]!;
      final remaining = tokens.sublist(1).join(' ');
      return ExtractedQuantityAndUnit(
        quantity: numStr,
        unit: unitInfo.standard,
        cleanName: remaining,
      );
    }
  }

  // Fallback: no recognizable quantity/unit
  return ExtractedQuantityAndUnit(
    quantity: null,
    unit: null,
    cleanName: trimmed,
  );
}
