import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:yaad_flutter/core/theme/theme.dart';
import 'package:yaad_flutter/core/theme/tokens.dart';

void main() {
  group('YAAD Theme & Design Tokens Tests', () {
    test('Tokens match official brand colors', () {
      expect(YaadColors.primary, const Color(0xFF0F3D2E));
      expect(YaadColors.deepGreen, const Color(0xFF003527));
      expect(YaadColors.yellow, const Color(0xFFFCBC1F));
      expect(YaadColors.cream, const Color(0xFFFDF6E3));
      expect(YaadColors.background, const Color(0xFFF7FAF5));
    });

    test('YaadTheme provides Material 3 light theme with brand color scheme', () {
      final theme = YaadTheme.lightTheme;
      expect(theme.useMaterial3, isTrue);
      expect(theme.colorScheme.primary, YaadColors.primary);
      expect(theme.colorScheme.secondary, YaadColors.yellow);
      expect(theme.scaffoldBackgroundColor, YaadColors.background);
      expect(theme.appBarTheme.backgroundColor, YaadColors.primary);
    });
  });
}
