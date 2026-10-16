import 'package:flutter/material.dart';
import '../../../core/localization/app_strings.dart';
import '../../../core/theme/tokens.dart';
import '../../../core/units/pakistani_units.dart';

/// Smart Item Input with live Pakistani quantity auto-detection.
///
/// Implements principles from:
/// - WWDC26 Session 292 ("Design intuitive search experiences") for live parsing feedback.
/// - WWDC26 Session 220 ("Refine accessibility for custom controls") for 48x48 touch targets.
class SmartItemInput extends StatefulWidget {
  const SmartItemInput({
    super.key,
    required this.onAddItem,
    required this.language,
    this.initialCategory = 'vegetables',
  });

  final void Function({
    required String name,
    required String? quantity,
    required String? unit,
    required String category,
    required String rawInput,
  }) onAddItem;

  final AppLanguage language;
  final String initialCategory;

  @override
  State<SmartItemInput> createState() => _SmartItemInputState();
}

class _SmartItemInputState extends State<SmartItemInput> {
  late final TextEditingController _controller;
  late String _selectedCategory;
  ExtractedQuantityAndUnit? _detected;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory;
    _controller = TextEditingController();
    _controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _controller.removeListener(_onTextChanged);
    _controller.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final text = _controller.text;
    if (text.trim().isEmpty) {
      if (_detected != null) {
        setState(() => _detected = null);
      }
      return;
    }

    final parsed = extractQuantityAndUnit(text);
    setState(() {
      _detected = parsed;
    });
  }

  void _handleSubmit() {
    final rawText = _controller.text.trim();
    if (rawText.isEmpty) return;

    final parsed = extractQuantityAndUnit(rawText);
    final itemName = parsed.cleanName.isNotEmpty ? parsed.cleanName : rawText;

    widget.onAddItem(
      name: itemName,
      quantity: parsed.quantity,
      unit: parsed.unit,
      category: _selectedCategory,
      rawInput: rawText,
    );

    _controller.clear();
    setState(() {
      _detected = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = widget.language == AppLanguage.ur;
    final hint = YaadStrings.get('add_item_hint', widget.language);

    return Card(
      elevation: 2,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(YaadRadii.lg),
        side: const BorderSide(color: YaadColors.surfaceContainer, width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: YaadSpacing.base,
          vertical: YaadSpacing.sm,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => _handleSubmit(),
                    textDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: YaadColors.textPrimary,
                    ),
                    decoration: InputDecoration(
                      hintText: hint,
                      hintStyle: const TextStyle(
                        fontSize: 14,
                        color: YaadColors.textMuted,
                      ),
                      hintTextDirection: isUrdu ? TextDirection.rtl : TextDirection.ltr,
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: YaadSpacing.sm),
                // 48x48 Accessible Submit Button
                SizedBox(
                  width: 48,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _handleSubmit,
                    style: ElevatedButton.styleFrom(
                      padding: EdgeInsets.zero,
                      backgroundColor: YaadColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(YaadRadii.md),
                      ),
                    ),
                    child: const Icon(Icons.add, size: 24),
                  ),
                ),
              ],
            ),
            // Live Parsing Feedback Chips (WWDC26 intuitive search principle)
            AnimatedCrossFade(
              duration: const Duration(milliseconds: 200),
              crossFadeState: _detected != null &&
                      (_detected!.quantity != null || _detected!.unit != null)
                  ? CrossFadeState.showFirst
                  : CrossFadeState.showSecond,
              firstChild: Padding(
                padding: const EdgeInsets.only(top: YaadSpacing.xs, bottom: YaadSpacing.xxs),
                child: Wrap(
                  spacing: YaadSpacing.xs,
                  runSpacing: YaadSpacing.xxs,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    if (_detected?.quantity != null)
                      _ChipBadge(
                        icon: Icons.scale_outlined,
                        label: '${_detected!.quantity!} ${PakistaniUnits.formatUnit(_detected!.unit, inUrdu: isUrdu)}',
                        backgroundColor: YaadColors.yellowLight,
                        textColor: YaadColors.yellowDark,
                      ),
                    if (_detected?.cleanName != null && _detected!.cleanName.isNotEmpty)
                      _ChipBadge(
                        icon: Icons.shopping_basket_outlined,
                        label: _detected!.cleanName,
                        backgroundColor: YaadColors.surfaceContainer,
                        textColor: YaadColors.textPrimary,
                      ),
                  ],
                ),
              ),
              secondChild: const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChipBadge extends StatelessWidget {
  const _ChipBadge({
    required this.icon,
    required this.label,
    required this.backgroundColor,
    required this.textColor,
  });

  final IconData icon;
  final String label;
  final Color backgroundColor;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: YaadSpacing.sm,
        vertical: YaadSpacing.xxs,
      ),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(YaadRadii.full),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: textColor),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
