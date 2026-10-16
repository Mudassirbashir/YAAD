import 'package:flutter_test/flutter_test.dart';
import 'package:yaad_flutter/core/units/pakistani_units.dart';

void main() {
  group('Pakistani Grocery Quantities & Units Tests', () {
    test('Traditional Pakistani Weights & Fractions match tests/pakistani-units.test.ts', () {
      final weightTests = [
        (input: '1 pau aloo', expectedQty: '1', expectedUnit: 'pao'),
        (input: 'adha pau mirch', expectedQty: '0.5', expectedUnit: 'pao'),
        (input: 'sawa kilo sugar', expectedQty: '1.25', expectedUnit: 'kg'),
        (input: 'dedh kilo chawal', expectedQty: '1.5', expectedUnit: 'kg'),
        (input: 'adha kilo tamatar', expectedQty: '0.5', expectedUnit: 'kg'),
      ];

      for (final t in weightTests) {
        final result = extractQuantityAndUnit(t.input);
        expect(result.quantity, t.expectedQty, reason: 'Quantity for "${t.input}"');
        expect(result.unit, t.expectedUnit, reason: 'Unit for "${t.input}"');
      }
    });

    test('Packaging & Count Units match tests/pakistani-units.test.ts', () {
      final packageTests = [
        (input: '1 dazan anday', expectedQty: '1', expectedUnit: 'dozen'),
        (input: '2 darjan kele', expectedQty: '2', expectedUnit: 'dozen'),
        (input: '1 dozen eggs', expectedQty: '1', expectedUnit: 'dozen'),
        (input: '1 packet nimco', expectedQty: '1', expectedUnit: 'packet'),
        (input: '1 dabba dahi', expectedQty: '1', expectedUnit: 'box'),
        (input: '1 gucchi podina', expectedQty: '1', expectedUnit: 'bundle'),
        (input: '2 tali dhania', expectedQty: '2', expectedUnit: 'bundle'),
        (input: '1 bottle doodh', expectedQty: '1', expectedUnit: 'bottle'),
      ];

      for (final t in packageTests) {
        final result = extractQuantityAndUnit(t.input);
        expect(result.quantity, t.expectedQty, reason: 'Quantity for "${t.input}"');
        expect(result.unit, t.expectedUnit, reason: 'Unit for "${t.input}"');
      }
    });

    test('Urdu and English unit formatting', () {
      expect(PakistaniUnits.formatUnit('kg'), 'kg');
      expect(PakistaniUnits.formatUnit('kg', inUrdu: true), 'کلو');
      expect(PakistaniUnits.formatUnit('pao', inUrdu: true), 'پاؤ');
      expect(PakistaniUnits.formatUnit('dozen', inUrdu: true), 'درجن');
      expect(PakistaniUnits.formatUnit('bundle', inUrdu: true), 'گڈی');
      expect(PakistaniUnits.formatUnit('box', inUrdu: true), 'ڈبہ');
    });

    test('Handles edge cases and unformatted inputs', () {
      expect(extractQuantityAndUnit('').quantity, isNull);
      expect(extractQuantityAndUnit('tamatar').quantity, isNull);
      expect(extractQuantityAndUnit('tamatar').unit, isNull);
      expect(extractQuantityAndUnit('tamatar').cleanName, 'tamatar');

      final combined = extractQuantityAndUnit('2kg pyaz');
      expect(combined.quantity, '2');
      expect(combined.unit, 'kg');
      expect(combined.cleanName, 'pyaz');
    });
  });
}
