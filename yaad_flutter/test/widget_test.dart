import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yaad_flutter/main.dart';

void main() {
  testWidgets('YaadApp renders brand header and interactive foundation pulse', (WidgetTester tester) async {
    // Set a realistic mobile viewport size (e.g. 400x900)
    tester.view.physicalSize = const Size(800, 1200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const YaadApp());

    // Verify title and brand Urdu subtitle are rendered
    expect(find.text('YAAD'), findsOneWidget);
    expect(find.text('یاد'), findsOneWidget);
    expect(find.text('Smart Grocery & Pantry Tracking'), findsOneWidget);

    // Verify initial cycle is 0
    expect(find.text('Verified cycles: 0'), findsOneWidget);

    // Tap pulse button
    final pulseButton = find.text('Verify Frame Pulse');
    await tester.ensureVisible(pulseButton);
    await tester.tap(pulseButton);
    await tester.pump();

    // Verify cycle incremented
    expect(find.text('Verified cycles: 1'), findsOneWidget);
  });
}
