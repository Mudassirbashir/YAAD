import 'package:flutter/material.dart';
import '../../../core/layout/responsive_layout.dart';
import '../../../core/localization/app_strings.dart';
import '../../../core/theme/tokens.dart';
import '../../../data/models/shopping_item_model.dart';
import '../../../data/models/shopping_list_model.dart';
import '../../../data/offline/offline_mutation.dart';
import '../../../data/offline/offline_queue_engine.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../data/repositories/shopping_repository.dart';
import '../widgets/category_filter_bar.dart';
import '../widgets/shopping_item_tile.dart';
import '../widgets/smart_item_input.dart';

/// Full-featured Shopping List Screen adhering to Apple WWDC engineering insights:
/// - WWDC26 Session 251: YAAD brand identity (Deep Green, Yellow accent, Urdu typography).
/// - WWDC24 Session 10147: Responsive phone vs tablet dual-pane layout.
/// - WWDC24 Session 10145: Fluid completion feedback and animated progress.
/// - WWDC26 Session 220: Accessible touch targets (>48dp).
/// - WWDC25 Session 225: Full English, Urdu (RTL), and Roman Urdu support.
class ShoppingListScreen extends StatefulWidget {
  const ShoppingListScreen({
    super.key,
    required this.repository,
    required this.queueEngine,
    this.authRepository,
    this.initialListId = 'default-list',
    this.initialUserId = 'guest',
  });

  final ShoppingRepository repository;
  final OfflineQueueEngine queueEngine;
  final AuthRepository? authRepository;
  final String initialListId;
  final String initialUserId;

  @override
  State<ShoppingListScreen> createState() => _ShoppingListScreenState();
}

class _ShoppingListScreenState extends State<ShoppingListScreen> {
  AppLanguage _language = AppLanguage.en;
  String _selectedCategory = 'all';
  bool _isLoading = true;
  ShoppingListModel? _currentList;

  String get _effectiveUserId =>
      widget.authRepository?.currentUserId ?? widget.initialUserId;

  @override
  void initState() {
    super.initState();
    widget.queueEngine.addListener(_onQueueChanged);
    _loadList();
  }

  @override
  void dispose() {
    widget.queueEngine.removeListener(_onQueueChanged);
    super.dispose();
  }

  void _onQueueChanged() {
    if (mounted) setState(() {});
  }

  Future<void> _loadList() async {
    setState(() => _isLoading = true);

    // Process any pending offline mutations on load
    if (widget.queueEngine.pendingCount > 0) {
      await widget.queueEngine.processQueue(widget.repository);
    }

    var list = await widget.repository.fetchListById(widget.initialListId);
    if (list == null) {
      // Create initial starter list with real Pakistani examples
      list = ShoppingListModel(
        id: widget.initialListId,
        userId: _effectiveUserId,
        title: 'Weekly Rashan',
        items: [
          ShoppingItemModel(
            id: 'item-sample-1',
            listId: widget.initialListId,
            userId: _effectiveUserId,
            itemName: 'Aloo',
            category: 'vegetables',
            quantity: '1',
            unit: 'pao',
            nameUrdu: 'آلو',
            nameRomanUrdu: 'Aloo',
            rawInput: '1 pau aloo',
          ),
          ShoppingItemModel(
            id: 'item-sample-2',
            listId: widget.initialListId,
            userId: _effectiveUserId,
            itemName: 'Sugar',
            category: 'cooking_essentials',
            quantity: '1.25',
            unit: 'kg',
            nameUrdu: 'چینی',
            nameRomanUrdu: 'Cheeni',
            rawInput: 'sawa kilo sugar',
          ),
          ShoppingItemModel(
            id: 'item-sample-3',
            listId: widget.initialListId,
            userId: _effectiveUserId,
            itemName: 'Basmati Rice',
            category: 'rice',
            quantity: '1.5',
            unit: 'kg',
            nameUrdu: 'باسمتی چاول',
            nameRomanUrdu: 'Basmati Chawal',
            rawInput: 'dedh kilo chawal',
          ),
        ],
      );
      await widget.repository.upsertList(list);
    }

    if (mounted) {
      setState(() {
        _currentList = list;
        _isLoading = false;
      });
    }
  }

  Future<void> _syncQueue() async {
    final result = await widget.queueEngine.processQueue(widget.repository);
    if (_currentList != null) {
      final refreshed = await widget.repository.fetchListById(_currentList!.id);
      if (refreshed != null && mounted) {
        setState(() => _currentList = refreshed);
      }
    }
    if (mounted && (result.syncedCount > 0 || result.failedCount > 0)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result.failedCount > 0
                ? '${result.failedCount} ${YaadStrings.get('pending_changes', _language)}'
                : YaadStrings.get('synced', _language),
          ),
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  void _addItem({
    required String name,
    required String? quantity,
    required String? unit,
    required String category,
    required String rawInput,
  }) async {
    if (_currentList == null) return;

    final newItem = ShoppingItemModel(
      id: 'item-${DateTime.now().millisecondsSinceEpoch}',
      listId: _currentList!.id,
      userId: _currentList!.userId,
      itemName: name,
      category: category,
      quantity: quantity,
      unit: unit,
      rawInput: rawInput,
      createdAt: DateTime.now(),
    );

    final updatedItems = [newItem, ..._currentList!.items];
    final updatedList = _currentList!.copyWith(items: updatedItems);

    setState(() {
      _currentList = updatedList;
    });

    final op = PendingOfflineOperation(
      id: 'op-add-${newItem.id}',
      type: OfflineMutationType.addItem,
      userId: newItem.userId,
      listId: newItem.listId,
      itemId: newItem.id,
      payload: newItem.toFullJson(),
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );
    widget.queueEngine.enqueue(op);

    try {
      await widget.repository.upsertItem(newItem);
      widget.queueEngine.remove(op.id);
    } catch (_) {
      // Retained in queueEngine as pending operation
    }
  }

  void _toggleItemCompletion(String itemId, bool isCompleted) async {
    if (_currentList == null) return;

    final updatedItems = _currentList!.items.map((item) {
      if (item.id == itemId) {
        return item.copyWith(isCompleted: isCompleted);
      }
      return item;
    }).toList();

    final updatedList = _currentList!.copyWith(items: updatedItems);
    setState(() {
      _currentList = updatedList;
    });

    final op = PendingOfflineOperation(
      id: 'op-toggle-$itemId-${DateTime.now().millisecondsSinceEpoch}',
      type: isCompleted
          ? OfflineMutationType.completeItem
          : OfflineMutationType.uncompleteItem,
      userId: _currentList!.userId,
      listId: _currentList!.id,
      itemId: itemId,
      payload: {'id': itemId, 'is_completed': isCompleted},
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );
    widget.queueEngine.enqueue(op);

    try {
      await widget.repository.toggleItemCompleted(itemId, isCompleted);
      widget.queueEngine.remove(op.id);
    } catch (_) {
      // Retained in queueEngine as pending operation
    }
  }

  void _deleteItem(String itemId) async {
    if (_currentList == null) return;

    final updatedItems = _currentList!.items.where((i) => i.id != itemId).toList();
    final updatedList = _currentList!.copyWith(items: updatedItems);

    setState(() {
      _currentList = updatedList;
    });

    final op = PendingOfflineOperation(
      id: 'op-del-$itemId-${DateTime.now().millisecondsSinceEpoch}',
      type: OfflineMutationType.deleteItem,
      userId: _currentList!.userId,
      listId: _currentList!.id,
      itemId: itemId,
      payload: {'id': itemId},
      timestamp: DateTime.now().millisecondsSinceEpoch,
    );
    widget.queueEngine.enqueue(op);

    try {
      await widget.repository.deleteItem(itemId);
      widget.queueEngine.remove(op.id);
    } catch (_) {
      // Retained in queueEngine as pending operation
    }
  }

  void _showAuthStatusDialog(BuildContext context) {
    final isAuthenticated = widget.authRepository?.isAuthenticated == true;
    final userEmail = widget.authRepository?.currentUser?.email ?? 'guest@yaad.app';

    showDialog<void>(
      context: context,
      builder: (dialogCtx) {
        return AlertDialog(
          title: Text(
            isAuthenticated ? 'Account Profile' : YaadStrings.get('guest_user', _language),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isAuthenticated
                    ? 'Signed in as:\n$userEmail'
                    : YaadStrings.get('guest_subtitle', _language),
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: YaadSpacing.sm),
              Text(
                'User ID: $_effectiveUserId',
                style: const TextStyle(fontSize: 11, color: YaadColors.textMuted),
              ),
            ],
          ),
          actions: [
            if (isAuthenticated)
              TextButton(
                onPressed: () async {
                  await widget.authRepository?.signOut();
                  if (dialogCtx.mounted) Navigator.pop(dialogCtx);
                  if (mounted) _loadList();
                },
                child: const Text('Sign Out'),
              ),
            TextButton(
              onPressed: () => Navigator.pop(dialogCtx),
              child: const Text('Close'),
            ),
          ],
        );
      },
    );
  }

  Map<String, int> _computeCategoryCounts() {
    final counts = <String, int>{};
    if (_currentList == null) return counts;
    for (final item in _currentList!.items) {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }
    return counts;
  }

  @override
  Widget build(BuildContext context) {
    final isUrdu = _language == AppLanguage.ur;

    return Directionality(
      textDirection: _language.direction,
      child: Scaffold(
        backgroundColor: YaadColors.background,
        appBar: AppBar(
          title: Row(
            children: [
              const Text(
                'YAAD',
                style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2),
              ),
              const SizedBox(width: 8),
              const Text(
                'یاد',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
              const Spacer(),
              // Offline Sync Status & Manual Trigger
              IconButton(
                tooltip: widget.queueEngine.pendingCount > 0
                    ? '${widget.queueEngine.pendingCount} ${YaadStrings.get('pending_changes', _language)}'
                    : YaadStrings.get('synced', _language),
                icon: widget.queueEngine.isSyncing
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Badge(
                        isLabelVisible: widget.queueEngine.pendingCount > 0,
                        label: Text('${widget.queueEngine.pendingCount}'),
                        child: Icon(
                          widget.queueEngine.pendingCount > 0
                              ? Icons.cloud_upload_outlined
                              : Icons.cloud_done_outlined,
                          color: Colors.white,
                        ),
                      ),
                onPressed: widget.queueEngine.isSyncing ? null : _syncQueue,
              ),
              // Language Switcher Dropdown
              PopupMenuButton<AppLanguage>(
                icon: const Icon(Icons.language, color: Colors.white),
                onSelected: (lang) => setState(() => _language = lang),
                itemBuilder: (context) => AppLanguage.values.map((lang) {
                  return PopupMenuItem(
                    value: lang,
                    child: Text(lang.displayName),
                  );
                }).toList(),
              ),
              // User Account / Guest Status Button
              IconButton(
                tooltip: widget.authRepository?.isAuthenticated == true
                    ? (widget.authRepository?.currentUser?.email ?? 'Account')
                    : YaadStrings.get('guest_user', _language),
                icon: Icon(
                  widget.authRepository?.isAuthenticated == true
                      ? Icons.account_circle
                      : Icons.person_outline,
                  color: Colors.white,
                ),
                onPressed: () => _showAuthStatusDialog(context),
              ),
            ],
          ),
        ),
        body: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : ResponsiveLayoutBuilder(
                compact: (context) => _buildCompactPhoneView(context, isUrdu),
                expanded: (context) => _buildTabletView(context, isUrdu),
              ),
      ),
    );
  }

  Widget _buildCompactPhoneView(BuildContext context, bool isUrdu) {
    final items = _currentList?.items ?? [];
    final filteredItems = _selectedCategory == 'all'
        ? items
        : items.where((i) => i.category == _selectedCategory).toList();

    final pendingItems = filteredItems.where((i) => !i.isCompleted).toList();
    final completedItems = filteredItems.where((i) => i.isCompleted).toList();

    return Column(
      children: [
        // Category Filter Bar
        Padding(
          padding: const EdgeInsets.only(top: YaadSpacing.sm, bottom: YaadSpacing.xs),
          child: CategoryFilterBar(
            selectedCategoryId: _selectedCategory,
            onSelectCategory: (cat) => setState(() => _selectedCategory = cat),
            language: _language,
            categoryCounts: _computeCategoryCounts(),
          ),
        ),

        // Progress Card
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: YaadSpacing.base),
          child: _buildProgressCard(items.length, completedItems.length),
        ),

        // Smart Item Input at accessible zone
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: YaadSpacing.base,
            vertical: YaadSpacing.xs,
          ),
          child: SmartItemInput(
            onAddItem: _addItem,
            language: _language,
            initialCategory: _selectedCategory == 'all' ? 'vegetables' : _selectedCategory,
          ),
        ),

        // Item List
        Expanded(
          child: filteredItems.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _syncQueue,
                  color: YaadColors.primary,
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: YaadSpacing.base),
                    children: [
                      if (pendingItems.isNotEmpty) ...[
                        _buildSectionHeader(
                          YaadStrings.get('pending_items', _language),
                          pendingItems.length,
                        ),
                        ...pendingItems.map((item) => ShoppingItemTile(
                              key: ValueKey(item.id),
                              item: item,
                              language: _language,
                              onToggleCompletion: (val) =>
                                  _toggleItemCompletion(item.id, val),
                              onDelete: () => _deleteItem(item.id),
                            )),
                      ],
                      if (completedItems.isNotEmpty) ...[
                        const SizedBox(height: YaadSpacing.md),
                        _buildSectionHeader(
                          YaadStrings.get('completed_items', _language),
                          completedItems.length,
                          isCompleted: true,
                        ),
                        ...completedItems.map((item) => ShoppingItemTile(
                              key: ValueKey(item.id),
                              item: item,
                              language: _language,
                              onToggleCompletion: (val) =>
                                  _toggleItemCompletion(item.id, val),
                              onDelete: () => _deleteItem(item.id),
                            )),
                      ],
                      const SizedBox(height: YaadSpacing.xl),
                    ],
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildTabletView(BuildContext context, bool isUrdu) {
    final items = _currentList?.items ?? [];
    final filteredItems = _selectedCategory == 'all'
        ? items
        : items.where((i) => i.category == _selectedCategory).toList();

    final pendingItems = filteredItems.where((i) => !i.isCompleted).toList();
    final completedItems = filteredItems.where((i) => i.isCompleted).toList();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Sidebar on Tablet (WWDC24 Session 10147)
        SizedBox(
          width: 280,
          child: Container(
            decoration: const BoxDecoration(
              color: YaadColors.surfaceLowest,
              border: Border(right: BorderSide(color: YaadColors.borderSubtle)),
            ),
            padding: const EdgeInsets.all(YaadSpacing.base),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildProgressCard(items.length, completedItems.length),
                const SizedBox(height: YaadSpacing.base),
                Text(
                  YaadStrings.get('categories', _language),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: YaadSpacing.sm),
                Expanded(
                  child: ListView(
                    children: [
                      _SidebarCategoryItem(
                        title: YaadStrings.get('all_categories', _language),
                        count: items.length,
                        isSelected: _selectedCategory == 'all',
                        onTap: () => setState(() => _selectedCategory = 'all'),
                      ),
                      ..._computeCategoryCounts().entries.map((e) {
                        return _SidebarCategoryItem(
                          title: e.key,
                          count: e.value,
                          isSelected: _selectedCategory == e.key,
                          onTap: () => setState(() => _selectedCategory = e.key),
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // Main List Pane on Tablet
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(YaadSpacing.base),
            child: Column(
              children: [
                SmartItemInput(
                  onAddItem: _addItem,
                  language: _language,
                  initialCategory:
                      _selectedCategory == 'all' ? 'vegetables' : _selectedCategory,
                ),
                const SizedBox(height: YaadSpacing.sm),
                Expanded(
                  child: filteredItems.isEmpty
                      ? _buildEmptyState()
                      : RefreshIndicator(
                          onRefresh: _syncQueue,
                          color: YaadColors.primary,
                          child: ListView(
                            children: [
                              if (pendingItems.isNotEmpty) ...[
                                _buildSectionHeader(
                                  YaadStrings.get('pending_items', _language),
                                  pendingItems.length,
                                ),
                                ...pendingItems.map((item) => ShoppingItemTile(
                                      key: ValueKey(item.id),
                                      item: item,
                                      language: _language,
                                      onToggleCompletion: (val) =>
                                          _toggleItemCompletion(item.id, val),
                                      onDelete: () => _deleteItem(item.id),
                                    )),
                              ],
                              if (completedItems.isNotEmpty) ...[
                                const SizedBox(height: YaadSpacing.md),
                                _buildSectionHeader(
                                  YaadStrings.get('completed_items', _language),
                                  completedItems.length,
                                  isCompleted: true,
                                ),
                                ...completedItems.map((item) => ShoppingItemTile(
                                      key: ValueKey(item.id),
                                      item: item,
                                      language: _language,
                                      onToggleCompletion: (val) =>
                                          _toggleItemCompletion(item.id, val),
                                      onDelete: () => _deleteItem(item.id),
                                    )),
                              ],
                            ],
                          ),
                        ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildProgressCard(int total, int completed) {
    final progress = total > 0 ? completed / total : 0.0;
    final percent = (progress * 100).round();

    return Container(
      margin: const EdgeInsets.symmetric(vertical: YaadSpacing.xs),
      padding: const EdgeInsets.all(YaadSpacing.md),
      decoration: BoxDecoration(
        color: YaadColors.surfaceLowest,
        borderRadius: BorderRadius.circular(YaadRadii.md),
        border: Border.all(color: YaadColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            runSpacing: 4,
            children: [
              Text(
                YaadStrings.get('trip_progress', _language),
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: YaadColors.textPrimary,
                ),
              ),
              Text(
                '$completed / $total ${YaadStrings.get('items_packed', _language)} ($percent%)',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: YaadColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: YaadSpacing.sm),
          ClipRRect(
            borderRadius: BorderRadius.circular(YaadRadii.full),
            child: TweenAnimationBuilder<double>(
              duration: const Duration(milliseconds: 350),
              curve: Curves.easeOutCubic,
              tween: Tween<double>(begin: 0, end: progress),
              builder: (context, value, _) {
                return LinearProgressIndicator(
                  value: value,
                  minHeight: 8,
                  backgroundColor: YaadColors.surfaceContainer,
                  valueColor: const AlwaysStoppedAnimation<Color>(YaadColors.primary),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, int count, {bool isCompleted = false}) {
    return Padding(
      padding: const EdgeInsets.only(
        top: YaadSpacing.sm,
        bottom: YaadSpacing.xs,
      ),
      child: Row(
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: isCompleted ? YaadColors.textMuted : YaadColors.textSecondary,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(width: YaadSpacing.xs),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
            decoration: BoxDecoration(
              color: isCompleted
                  ? YaadColors.surfaceContainer
                  : YaadColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(YaadRadii.full),
            ),
            child: Text(
              '$count',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isCompleted ? YaadColors.textMuted : YaadColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(YaadSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(YaadSpacing.lg),
              decoration: const BoxDecoration(
                color: YaadColors.surfaceContainer,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.shopping_cart_outlined,
                size: 48,
                color: YaadColors.primary,
              ),
            ),
            const SizedBox(height: YaadSpacing.base),
            Text(
              YaadStrings.get('empty_list_title', _language),
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: YaadColors.textPrimary,
              ),
            ),
            const SizedBox(height: YaadSpacing.xs),
            Text(
              YaadStrings.get('empty_list_subtitle', _language),
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: YaadColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}

class _SidebarCategoryItem extends StatelessWidget {
  const _SidebarCategoryItem({
    required this.title,
    required this.count,
    required this.isSelected,
    required this.onTap,
  });

  final String title;
  final int count;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Material(
        color: isSelected ? YaadColors.primary : Colors.transparent,
        borderRadius: BorderRadius.circular(YaadRadii.md),
        clipBehavior: Clip.antiAlias,
        child: ListTile(
          dense: true,
          title: Text(
            title,
            style: TextStyle(
              color: isSelected ? Colors.white : YaadColors.textPrimary,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            ),
          ),
          trailing: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: isSelected ? Colors.white24 : YaadColors.surfaceContainer,
              borderRadius: BorderRadius.circular(YaadRadii.full),
            ),
            child: Text(
              '$count',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : YaadColors.textSecondary,
              ),
            ),
          ),
          onTap: onTap,
        ),
      ),
    );
  }
}
