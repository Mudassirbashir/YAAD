import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yaad_flutter/core/localization/app_strings.dart';
import 'package:yaad_flutter/data/models/shopping_item_model.dart';
import 'package:yaad_flutter/data/offline/offline_queue_engine.dart';
import 'package:yaad_flutter/data/repositories/shopping_repository.dart';
import 'package:yaad_flutter/features/shopping/screens/shopping_list_screen.dart';
import 'package:yaad_flutter/features/shopping/widgets/category_filter_bar.dart';
import 'package:yaad_flutter/features/shopping/widgets/shopping_item_tile.dart';
import 'package:yaad_flutter/features/shopping/widgets/smart_item_input.dart';

void main() {
  group('SmartItemInput UI Widget', () {
    testWidgets('parses "1 pau aloo" into live quantity preview chip', (tester) async {
      String? addedName;
      String? addedQuantity;
      String? addedUnit;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SmartItemInput(
              language: AppLanguage.en,
              onAddItem: ({
                required String name,
                required String? quantity,
                required String? unit,
                required String category,
                required String rawInput,
              }) {
                addedName = name;
                addedQuantity = quantity;
                addedUnit = unit;
              },
            ),
          ),
        ),
      );

      final textField = find.byType(TextField);
      expect(textField, findsOneWidget);

      // Type "1 pau aloo"
      await tester.enterText(textField, '1 pau aloo');
      await tester.pump();

      // Verify live chip shows detected quantity ('1 pao') and clean item name ('aloo')
      expect(find.text('1 pao'), findsOneWidget);
      expect(find.text('aloo'), findsOneWidget);

      // Tap submit button (identified by check/add icon)
      final submitButton = find.byType(ElevatedButton);
      expect(submitButton, findsOneWidget);
      await tester.tap(submitButton);
      await tester.pump();

      // Verify callback received parsed values
      expect(addedName, equals('aloo'));
      expect(addedQuantity, equals('1'));
      expect(addedUnit, equals('pao'));
    });

    testWidgets('parses "sawa kilo sugar" and "dedh kilo chawal"', (tester) async {
      String? addedQuantity;
      String? addedUnit;
      String? addedName;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SmartItemInput(
              language: AppLanguage.en,
              onAddItem: ({
                required String name,
                required String? quantity,
                required String? unit,
                required String category,
                required String rawInput,
              }) {
                addedName = name;
                addedQuantity = quantity;
                addedUnit = unit;
              },
            ),
          ),
        ),
      );

      final textField = find.byType(TextField);

      // Sawa kilo
      await tester.enterText(textField, 'sawa kilo sugar');
      await tester.pump();
      expect(find.textContaining('1.25 kg'), findsOneWidget);

      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();
      expect(addedName, equals('sugar'));
      expect(addedQuantity, equals('1.25'));
      expect(addedUnit, equals('kg'));

      // Dedh kilo
      await tester.enterText(textField, 'dedh kilo chawal');
      await tester.pump();
      expect(find.textContaining('1.5 kg'), findsOneWidget);

      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();
      expect(addedName, equals('chawal'));
      expect(addedQuantity, equals('1.5'));
      expect(addedUnit, equals('kg'));
    });
  });

  group('ShoppingItemTile Widget', () {
    testWidgets('renders item details, unit pill, and toggles completion', (tester) async {
      bool? toggledState;
      final testItem = ShoppingItemModel(
        id: 'test-item-1',
        listId: 'list-1',
        userId: 'user-1',
        itemName: 'Aloo',
        category: 'vegetables',
        quantity: '1',
        unit: 'pao',
        nameUrdu: 'آلو',
        isCompleted: false,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ShoppingItemTile(
              item: testItem,
              language: AppLanguage.en,
              onToggleCompletion: (val) => toggledState = val,
              onDelete: () {},
            ),
          ),
        ),
      );

      // Verify item title and Urdu subtitle
      expect(find.text('Aloo'), findsOneWidget);
      expect(find.text('آلو'), findsOneWidget);

      // Verify unit pill
      expect(find.text('1 pao'), findsOneWidget);

      // Tap checkbox touch target
      final inkWell = find.byType(InkWell).first;
      await tester.tap(inkWell);
      await tester.pump();

      expect(toggledState, isTrue);
    });

    testWidgets('completed item renders strike-through and filled checkbox', (tester) async {
      final completedItem = ShoppingItemModel(
        id: 'test-item-2',
        listId: 'list-1',
        userId: 'user-1',
        itemName: 'Chawal',
        category: 'rice',
        isCompleted: true,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ShoppingItemTile(
              item: completedItem,
              language: AppLanguage.en,
              onToggleCompletion: (_) {},
              onDelete: () {},
            ),
          ),
        ),
      );

      // Verify check icon is present
      expect(find.byIcon(Icons.check), findsOneWidget);

      // Verify text has strikethrough
      final textWidget = tester.widget<Text>(find.text('Chawal'));
      expect(textWidget.style?.decoration, equals(TextDecoration.lineThrough));
    });
  });

  group('CategoryFilterBar Widget', () {
    testWidgets('renders category pills and reacts to selection', (tester) async {
      String? selected;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CategoryFilterBar(
              selectedCategoryId: 'all',
              onSelectCategory: (cat) => selected = cat,
              language: AppLanguage.en,
              categoryCounts: const {
                'vegetables': 2,
                'rice': 1,
              },
            ),
          ),
        ),
      );

      // "All (3)" should be present
      expect(find.text('All (3)'), findsOneWidget);

      // Tap on vegetables pill
      final vegPill = find.textContaining('Vegetables');
      expect(vegPill, findsOneWidget);
      await tester.tap(vegPill);
      await tester.pump();

      expect(selected, equals('vegetables'));
    });
  });

  group('ShoppingListScreen End-to-End & Layout', () {
    testWidgets('renders full screen, allows category filter, and toggles items', (tester) async {
      final repo = MockShoppingRepository();
      final queue = OfflineQueueEngine();

      tester.view.physicalSize = const Size(400, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          home: ShoppingListScreen(
            repository: repo,
            queueEngine: queue,
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Check initial rashan items
      expect(find.text('Aloo'), findsOneWidget);
      expect(find.text('Sugar'), findsOneWidget);
      expect(find.text('Basmati Rice'), findsOneWidget);

      // Progress bar should show 0/3 packed initially
      expect(find.textContaining('0 / 3 packed'), findsOneWidget);

      // Filter by vegetables
      final vegFilter = find.textContaining('Vegetables');
      await tester.tap(vegFilter);
      await tester.pumpAndSettle();

      // Only Aloo should remain in the filtered view
      expect(find.text('Aloo'), findsOneWidget);
      expect(find.text('Sugar'), findsNothing);
      expect(find.text('Basmati Rice'), findsNothing);

      // Switch back to All
      final allFilter = find.textContaining('All');
      await tester.tap(allFilter);
      await tester.pumpAndSettle();
      expect(find.text('Sugar'), findsOneWidget);
    });

    testWidgets('responsive dual-pane layout triggers on tablet width (>=650dp)', (tester) async {
      final repo = MockShoppingRepository();
      final queue = OfflineQueueEngine();

      // Set tablet viewport (800x1200)
      tester.view.physicalSize = const Size(800, 1200);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          home: ShoppingListScreen(
            repository: repo,
            queueEngine: queue,
          ),
        ),
      );
      await tester.pumpAndSettle();

      // In tablet view, the sidebar should show "Categories" title
      expect(find.text('Categories'), findsOneWidget);
      expect(find.text('All'), findsOneWidget);
      expect(find.text('Aloo'), findsOneWidget);
    });

    testWidgets('multilingual switching updates Directionality to RTL for Urdu', (tester) async {
      final repo = MockShoppingRepository();
      final queue = OfflineQueueEngine();

      tester.view.physicalSize = const Size(400, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          home: ShoppingListScreen(
            repository: repo,
            queueEngine: queue,
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Open language popup menu
      final langButton = find.byIcon(Icons.language);
      expect(langButton, findsOneWidget);
      await tester.tap(langButton);
      await tester.pumpAndSettle();

      // Select Urdu
      final urduItem = find.text('اردو');
      expect(urduItem, findsOneWidget);
      await tester.tap(urduItem);
      await tester.pumpAndSettle();

      // Directionality in ShoppingListScreen should now be RTL
      final directionalityFinder = find.descendant(
        of: find.byType(ShoppingListScreen),
        matching: find.byType(Directionality),
      );
      final directionality = tester.widget<Directionality>(directionalityFinder.first);
      expect(directionality.textDirection, equals(TextDirection.rtl));

      // Check for Urdu text in the UI
      expect(find.textContaining('خریدنے والی اشیاء'), findsOneWidget);
    });
  });
}
