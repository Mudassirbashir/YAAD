import 'package:flutter/material.dart';

/// Responsive layout utilities adhering to WWDC24 Session 10147
/// ("Elevate your tab and sidebar experience").
///
/// Seamlessly shifts between compact single-column phone presentation
/// and adaptive dual-column tablet/desktop workspace.
abstract final class ResponsiveLayout {
  static const double tabletBreakpoint = 650.0;
  static const double desktopBreakpoint = 1024.0;

  static bool isCompact(BuildContext context) =>
      MediaQuery.sizeOf(context).width < tabletBreakpoint;

  static bool isTablet(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return width >= tabletBreakpoint && width < desktopBreakpoint;
  }

  static bool isDesktop(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= desktopBreakpoint;
}

/// Adaptive layout builder providing different UI trees based on viewport width.
class ResponsiveLayoutBuilder extends StatelessWidget {
  const ResponsiveLayoutBuilder({
    super.key,
    required this.compact,
    required this.expanded,
  });

  final WidgetBuilder compact;
  final WidgetBuilder expanded;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth < ResponsiveLayout.tabletBreakpoint) {
          return compact(context);
        } else {
          return expanded(context);
        }
      },
    );
  }
}
