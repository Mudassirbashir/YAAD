/// Secure configuration loader for Supabase in YAAD Flutter.
///
/// Follows security rules:
/// - Never hardcodes secrets or service-role keys.
/// - Reads from environment `--dart-define` flags:
///   - SUPABASE_URL
///   - SUPABASE_ANON_KEY
/// - Safely sanitizes and validates configuration before client initialization.
library;

abstract final class YaadSupabaseConfig {
  static const String _defaultUrl = String.fromEnvironment('SUPABASE_URL', defaultValue: '');
  static const String _defaultAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY', defaultValue: '');

  static String url = _defaultUrl;
  static String anonKey = _defaultAnonKey;

  /// Updates configuration dynamically at startup if injected via config file or env.
  static void configure({required String newUrl, required String newAnonKey}) {
    url = newUrl.trim();
    anonKey = newAnonKey.trim();
  }

  /// Whether Supabase configuration is valid and non-placeholder.
  static bool get isConfigured {
    return url.isNotEmpty &&
        anonKey.isNotEmpty &&
        url.startsWith('http') &&
        !url.contains('placeholder') &&
        url != 'MY_SUPABASE_URL';
  }

  /// Safe diagnostic output with masked secrets.
  static Map<String, dynamic> get diagnosticSummary {
    String maskKey(String key) {
      if (key.length <= 8) return '***';
      return '${key.substring(0, 6)}...[len:${key.length}]';
    }

    return {
      'isConfigured': isConfigured,
      'urlPresent': url.isNotEmpty,
      'urlHost': Uri.tryParse(url)?.host ?? 'invalid',
      'anonKeyMasked': maskKey(anonKey),
    };
  }
}
