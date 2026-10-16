import 'package:flutter/material.dart';

/// Centralized YAAD Design Tokens
///
/// Single source of truth for colors, typography, spacing, and radii across YAAD Flutter,
/// matching `src/design-system/tokens.ts`.
abstract final class YaadColors {
  // Brand identity
  static const Color deepGreen = Color(0xFF003527);
  static const Color primary = Color(0xFF0F3D2E);
  static const Color primaryContainer = Color(0xFF14523E);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color yellow = Color(0xFFFCBC1F);
  static const Color yellowLight = Color(0xFFFFDEA3);
  static const Color yellowDark = Color(0xFF7A5900);
  static const Color cream = Color(0xFFFDF6E3);

  // Semantic palette
  static const Color background = Color(0xFFF7FAF5);
  static const Color surface = Color(0xFFF7FAF5);
  static const Color surfaceLowest = Color(0xFFFFFFFF);
  static const Color surfaceLow = Color(0xFFF1F4F0);
  static const Color surfaceContainer = Color(0xFFECEFEA);
  static const Color surfaceHigh = Color(0xFFE6E9E4);
  static const Color surfaceHighest = Color(0xFFE0E3DF);

  // Text tokens
  static const Color textPrimary = Color(0xFF191C1A);
  static const Color textSecondary = Color(0xFF404944);
  static const Color textMuted = Color(0xFF717974);
  static const Color textInverse = Color(0xFFEFF2ED);

  // Status
  static const Color success = Color(0xFF16A34A);
  static const Color successContainer = Color(0xFFDCFCE7);
  static const Color warning = Color(0xFFD97706);
  static const Color warningContainer = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFBA1A1A);
  static const Color errorContainer = Color(0xFFFFDAD6);
  static const Color info = Color(0xFF2563EB);
  static const Color infoContainer = Color(0xFFDBEAFE);
}

abstract final class YaadSpacing {
  static const double xxs = 2.0;
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double base = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
}

abstract final class YaadRadii {
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
  static const double full = 9999.0;
}
