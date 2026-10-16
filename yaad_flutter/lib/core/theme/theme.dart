import 'package:flutter/material.dart';
import 'tokens.dart';

/// Centralized Material 3 Theme for YAAD
abstract final class YaadTheme {
  static ThemeData get lightTheme {
    final colorScheme = ColorScheme(
      brightness: Brightness.light,
      primary: YaadColors.primary,
      onPrimary: YaadColors.onPrimary,
      primaryContainer: YaadColors.primaryContainer,
      onPrimaryContainer: YaadColors.onPrimary,
      secondary: YaadColors.yellow,
      onSecondary: YaadColors.textPrimary,
      secondaryContainer: YaadColors.yellowLight,
      onSecondaryContainer: YaadColors.yellowDark,
      error: YaadColors.error,
      onError: Colors.white,
      errorContainer: YaadColors.errorContainer,
      onErrorContainer: YaadColors.error,
      surface: YaadColors.surface,
      onSurface: YaadColors.textPrimary,
      surfaceContainerLowest: YaadColors.surfaceLowest,
      surfaceContainerLow: YaadColors.surfaceLow,
      surfaceContainer: YaadColors.surfaceContainer,
      surfaceContainerHigh: YaadColors.surfaceHigh,
      surfaceContainerHighest: YaadColors.surfaceHighest,
      onSurfaceVariant: YaadColors.textSecondary,
      outline: YaadColors.textMuted,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: YaadColors.background,
      appBarTheme: const AppBarTheme(
        backgroundColor: YaadColors.primary,
        foregroundColor: YaadColors.onPrimary,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: YaadColors.surfaceLowest,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(YaadRadii.md),
          side: const BorderSide(color: YaadColors.surfaceContainer),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: YaadColors.primary,
          foregroundColor: YaadColors.onPrimary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(YaadRadii.md),
          ),
          padding: const EdgeInsets.symmetric(
            horizontal: YaadSpacing.base,
            vertical: YaadSpacing.md,
          ),
        ),
      ),
    );
  }
}
