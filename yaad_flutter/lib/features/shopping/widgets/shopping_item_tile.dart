import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/localization/app_strings.dart';
import '../../../core/theme/tokens.dart';
import '../../../core/units/pakistani_units.dart';
import '../../../data/models/shopping_item_model.dart';

/// Interactive Shopping Item Tile with fluid completion transitions and bilingual support.
///
/// Adheres to:
/// - WWDC24 Session 10145 ("Enhance your UI animations and transitions") for spring transitions.
/// - WWDC26 Session 220 ("Refine accessibility for custom controls") for touch targets.
class ShoppingItemTile extends StatelessWidget {
  const ShoppingItemTile({
    super.key,
    required this.item,
    required this.onToggleCompletion,
    required this.onDelete,
    required this.language,
  });

  final ShoppingItemModel item;
  final ValueChanged<bool> onToggleCompletion;
  final VoidCallback onDelete;
  final AppLanguage language;

  @override
  Widget build(BuildContext context) {
    final isUrdu = language == AppLanguage.ur;
    final isCompleted = item.isCompleted;

    return Dismissible(
      key: ValueKey(item.id),
      direction: DismissDirection.endToStart,
      onDismissed: (_) {
        HapticFeedback.mediumImpact();
        onDelete();
      },
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: YaadSpacing.base),
        decoration: BoxDecoration(
          color: YaadColors.error,
          borderRadius: BorderRadius.circular(YaadRadii.md),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white, size: 24),
      ),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        margin: const EdgeInsets.symmetric(vertical: YaadSpacing.xs),
        padding: const EdgeInsets.symmetric(
          horizontal: YaadSpacing.base,
          vertical: YaadSpacing.md,
        ),
        decoration: BoxDecoration(
          color: isCompleted ? YaadColors.surfaceLow : YaadColors.surfaceLowest,
          borderRadius: BorderRadius.circular(YaadRadii.md),
          border: Border.all(
            color: isCompleted ? YaadColors.surfaceContainer : YaadColors.borderSubtle,
            width: 1,
          ),
          boxShadow: isCompleted
              ? null
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Row(
          children: [
            // Accessible Checkbox (min 48x48 touch target)
            InkWell(
              onTap: () {
                HapticFeedback.lightImpact();
                onToggleCompletion(!isCompleted);
              },
              borderRadius: BorderRadius.circular(YaadRadii.full),
              child: SizedBox(
                width: 48,
                height: 48,
                child: Center(
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeOutBack,
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isCompleted ? YaadColors.primary : Colors.transparent,
                      border: Border.all(
                        color: isCompleted ? YaadColors.primary : YaadColors.textMuted,
                        width: 2,
                      ),
                    ),
                    child: isCompleted
                        ? const Icon(Icons.check, size: 16, color: Colors.white)
                        : null,
                  ),
                ),
              ),
            ),
            const SizedBox(width: YaadSpacing.xs),

            // Item Name & Bilingual Subtitle
            Expanded(
              child: Column(
                crossAxisAlignment:
                    isUrdu ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                  AnimatedDefaultTextStyle(
                    duration: const Duration(milliseconds: 200),
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      decoration: isCompleted
                          ? TextDecoration.lineThrough
                          : TextDecoration.none,
                      color: isCompleted
                          ? YaadColors.textMuted
                          : YaadColors.textPrimary,
                    ),
                    child: Text(
                      item.itemName,
                      style: TextStyle(
                        decoration: isCompleted
                            ? TextDecoration.lineThrough
                            : TextDecoration.none,
                      ),
                      textDirection:
                          isUrdu ? TextDirection.rtl : TextDirection.ltr,
                    ),
                  ),
                  if (item.nameUrdu != null &&
                      item.nameUrdu!.isNotEmpty &&
                      item.nameUrdu != item.itemName)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        item.nameUrdu!,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: isCompleted
                              ? YaadColors.textMuted
                              : YaadColors.primaryContainer,
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Quantity & Pakistani Unit Badge
            if (item.quantity != null && item.quantity!.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(left: YaadSpacing.sm),
                padding: const EdgeInsets.symmetric(
                  horizontal: YaadSpacing.sm,
                  vertical: YaadSpacing.xxs,
                ),
                decoration: BoxDecoration(
                  color: isCompleted
                      ? YaadColors.surfaceContainer
                      : YaadColors.yellowLight,
                  borderRadius: BorderRadius.circular(YaadRadii.full),
                ),
                child: Text(
                  '${item.quantity!} ${PakistaniUnits.formatUnit(item.unit, inUrdu: isUrdu)}',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isCompleted
                        ? YaadColors.textMuted
                        : YaadColors.yellowDark,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
