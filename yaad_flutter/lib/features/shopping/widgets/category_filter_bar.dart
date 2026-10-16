import 'package:flutter/material.dart';
import '../../../core/localization/app_strings.dart';
import '../../../core/theme/tokens.dart';
import '../../../data/models/category_model.dart';

/// Horizontal category filter bar with item counts and smooth animated selection.
class CategoryFilterBar extends StatelessWidget {
  const CategoryFilterBar({
    super.key,
    required this.selectedCategoryId,
    required this.onSelectCategory,
    required this.language,
    required this.categoryCounts,
  });

  final String selectedCategoryId;
  final ValueChanged<String> onSelectCategory;
  final AppLanguage language;
  final Map<String, int> categoryCounts;

  @override
  Widget build(BuildContext context) {
    // Collect active categories that have items, plus standard categories
    final categoriesWithItems = standardCategories.where((c) {
      final count = categoryCounts[c.id] ?? 0;
      return count > 0;
    }).toList();

    // If fewer than 4 categories have items, show popular ones
    final displayedCategories = categoriesWithItems.length >= 3
        ? categoriesWithItems
        : standardCategories.take(8).toList();

    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: YaadSpacing.base),
        itemCount: displayedCategories.length + 1, // +1 for "All"
        separatorBuilder: (_, _) => const SizedBox(width: YaadSpacing.xs),
        itemBuilder: (context, index) {
          if (index == 0) {
            final isSelected = selectedCategoryId == 'all';
            final totalCount = categoryCounts.values.fold<int>(0, (sum, c) => sum + c);
            final allLabel = YaadStrings.get('all_categories', language);

            return _FilterPill(
              label: '$allLabel ($totalCount)',
              isSelected: isSelected,
              onTap: () => onSelectCategory('all'),
            );
          }

          final category = displayedCategories[index - 1];
          final isSelected = selectedCategoryId == category.id;
          final count = categoryCounts[category.id] ?? 0;

          final categoryLabel = language == AppLanguage.ur
              ? category.nameUr
              : language == AppLanguage.romanUrdu
                  ? category.nameRomanUrdu
                  : category.nameEn;

          return _FilterPill(
            label: count > 0 ? '$categoryLabel ($count)' : categoryLabel,
            isSelected: isSelected,
            onTap: () => onSelectCategory(category.id),
          );
        },
      ),
    );
  }
}

class _FilterPill extends StatelessWidget {
  const _FilterPill({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(YaadRadii.full),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(
          horizontal: YaadSpacing.base,
          vertical: YaadSpacing.xs,
        ),
        decoration: BoxDecoration(
          color: isSelected ? YaadColors.primary : YaadColors.surfaceLowest,
          borderRadius: BorderRadius.circular(YaadRadii.full),
          border: Border.all(
            color: isSelected ? YaadColors.primary : YaadColors.surfaceContainer,
            width: 1.5,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: YaadColors.primary.withValues(alpha: 0.2),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              color: isSelected ? Colors.white : YaadColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }
}
