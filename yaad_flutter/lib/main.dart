import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/config/supabase_config.dart';
import 'core/theme/theme.dart';
import 'core/theme/tokens.dart';

import 'data/offline/offline_queue_engine.dart';
import 'data/repositories/auth_repository.dart';
import 'data/repositories/shopping_repository.dart';
import 'features/shopping/screens/shopping_list_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  ShoppingRepository repository;
  AuthRepository authRepository;
  final queueEngine = OfflineQueueEngine();

  if (YaadSupabaseConfig.isConfigured) {
    try {
      await Supabase.initialize(
        url: YaadSupabaseConfig.url,
        // ignore: deprecated_member_use
        anonKey: YaadSupabaseConfig.anonKey,
      );
      final client = Supabase.instance.client;
      repository = SupabaseShoppingRepository(client);
      authRepository = SupabaseAuthRepository(client);
    } catch (_) {
      repository = MockShoppingRepository();
      authRepository = MockAuthRepository();
    }
  } else {
    repository = MockShoppingRepository();
    authRepository = MockAuthRepository();
  }

  runApp(YaadApp(
    repository: repository,
    authRepository: authRepository,
    queueEngine: queueEngine,
  ));
}

/// Root widget for the YAAD Flutter application.
class YaadApp extends StatelessWidget {
  const YaadApp({
    super.key,
    this.repository,
    this.authRepository,
    this.queueEngine,
    this.home,
  });

  final ShoppingRepository? repository;
  final AuthRepository? authRepository;
  final OfflineQueueEngine? queueEngine;
  final Widget? home;

  @override
  Widget build(BuildContext context) {
    final repo = repository ?? MockShoppingRepository();
    final auth = authRepository ?? MockAuthRepository();
    final queue = queueEngine ?? OfflineQueueEngine();
    final currentUserId = auth.currentUserId ?? 'guest';

    return MaterialApp(
      title: 'YAAD - یاد',
      debugShowCheckedModeBanner: false,
      theme: YaadTheme.lightTheme,
      home: home ??
          ShoppingListScreen(
            repository: repo,
            authRepository: auth,
            queueEngine: queue,
            initialUserId: currentUserId,
          ),
    );
  }
}

/// Initial foundation screen showcasing YAAD branding and architecture.
class YaadHomePage extends StatefulWidget {
  const YaadHomePage({super.key});

  @override
  State<YaadHomePage> createState() => _YaadHomePageState();
}

class _YaadHomePageState extends State<YaadHomePage> {
  int _counter = 0;

  void _increment() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Text(
              'YAAD',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                letterSpacing: 1.2,
              ),
            ),
            SizedBox(width: 8),
            Text(
              'یاد',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(YaadSpacing.base),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Brand header card
              Card(
                color: YaadColors.primary,
                child: Padding(
                  padding: const EdgeInsets.all(YaadSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: YaadSpacing.sm,
                          vertical: YaadSpacing.xs,
                        ),
                        decoration: BoxDecoration(
                          color: YaadColors.yellow,
                          borderRadius: BorderRadius.circular(YaadRadii.sm),
                        ),
                        child: const Text(
                          'Flutter Foundation',
                          style: TextStyle(
                            color: YaadColors.textPrimary,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const SizedBox(height: YaadSpacing.md),
                      const Text(
                        'Smart Grocery & Pantry Tracking',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: YaadSpacing.xs),
                      const Text(
                        'Isolated mobile core running alongside existing Web & Express stack.',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: YaadSpacing.base),

              // Architectural Readiness Cards
              const _StatusTile(
                title: 'Design System',
                subtitle: 'Material 3 aligned with YAAD design tokens',
                status: 'Verified',
                icon: Icons.palette_outlined,
              ),
              const SizedBox(height: YaadSpacing.sm),
              const _StatusTile(
                title: 'Android Toolchain',
                subtitle: 'JDK 17 + SDK 36 + build-tools 34.0.0 configured',
                status: 'Ready',
                icon: Icons.android_outlined,
              ),
              const SizedBox(height: YaadSpacing.sm),
              const _StatusTile(
                title: 'Web & Desktop',
                subtitle: 'Chrome and Windows targets operational',
                status: 'Ready',
                icon: Icons.devices_outlined,
              ),
              const SizedBox(height: YaadSpacing.lg),

              // Foundation interactive verification
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(YaadSpacing.base),
                  child: Column(
                    children: [
                      const Text(
                        'Foundation Interaction Check',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: YaadColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: YaadSpacing.sm),
                      Text(
                        'Verified cycles: $_counter',
                        style: const TextStyle(
                          fontSize: 14,
                          color: YaadColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: YaadSpacing.md),
                      ElevatedButton.icon(
                        onPressed: _increment,
                        icon: const Icon(Icons.check_circle_outline, size: 18),
                        label: const Text('Verify Frame Pulse'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusTile extends StatelessWidget {
  const _StatusTile({
    required this.title,
    required this.subtitle,
    required this.status,
    required this.icon,
  });

  final String title;
  final String subtitle;
  final String status;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: YaadSpacing.base,
          vertical: YaadSpacing.md,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(YaadSpacing.sm),
              decoration: BoxDecoration(
                color: YaadColors.surfaceLow,
                borderRadius: BorderRadius.circular(YaadRadii.sm),
              ),
              child: Icon(icon, color: YaadColors.primary),
            ),
            const SizedBox(width: YaadSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                      color: YaadColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: YaadSpacing.xxs),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: YaadColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: YaadSpacing.sm,
                vertical: YaadSpacing.xxs,
              ),
              decoration: BoxDecoration(
                color: YaadColors.successContainer,
                borderRadius: BorderRadius.circular(YaadRadii.full),
              ),
              child: Text(
                status,
                style: const TextStyle(
                  color: YaadColors.success,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
