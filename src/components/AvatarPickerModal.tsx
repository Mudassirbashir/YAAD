import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Search, Sparkles, User, RefreshCw, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  EMOJI_CATEGORIES,
  AVATAR_COLOR_PALETTES,
  parseAvatarValue,
  encodeEmojiAvatar,
  getAvatarColorOption,
} from '../data/avatarData';
import { Avatar } from './Avatar';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  onSave: (newAvatarValue: string | null) => Promise<void> | void;
  userName?: string | null;
  userEmail?: string | null;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSave,
  userName,
  userEmail,
}) => {
  const { t, language } = useLanguage();

  // Parse existing avatar
  const initialParsed = useMemo(() => parseAvatarValue(currentAvatarUrl), [currentAvatarUrl]);

  const [selectedEmoji, setSelectedEmoji] = useState<string>(initialParsed.emoji || '🥑');
  const [selectedBgId, setSelectedBgId] = useState<string>(initialParsed.bgId || 'mint');
  const [selectedCategory, setSelectedCategory] = useState<string>('faces');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUseInitials, setIsUseInitials] = useState<boolean>(!initialParsed.isEmoji && !initialParsed.isImageUrl);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync state whenever modal opens or currentAvatarUrl changes
  useEffect(() => {
    if (isOpen) {
      const parsed = parseAvatarValue(currentAvatarUrl);
      if (parsed.isEmoji && parsed.emoji) {
        setSelectedEmoji(parsed.emoji);
        setSelectedBgId(parsed.bgId || 'mint');
        setIsUseInitials(false);
      } else if (!parsed.isImageUrl && !parsed.isEmoji) {
        setIsUseInitials(true);
      } else {
        setSelectedEmoji('🥑');
        setSelectedBgId('mint');
        setIsUseInitials(false);
      }
      setSearchQuery('');
    }
  }, [isOpen, currentAvatarUrl]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Category translation mapping
  const getCategoryLabel = (catId: string, defaultName: string) => {
    switch (catId) {
      case 'faces':
        return t('settings.avatarFaces') || 'Faces';
      case 'people':
        return t('settings.avatarPeople') || 'People';
      case 'food':
        return t('settings.avatarFood') || 'Food';
      case 'animals':
        return t('settings.avatarAnimals') || 'Animals';
      case 'nature':
        return t('settings.avatarNature') || 'Nature';
      case 'objects':
        return t('settings.avatarObjects') || 'Objects';
      case 'fun':
        return t('settings.avatarFun') || 'Fun';
      case 'symbols':
        return t('settings.avatarSymbols') || 'Symbols';
      default:
        return defaultName;
    }
  };

  // Filtered emojis based on active category and optional search
  const currentCategoryObj = EMOJI_CATEGORIES.find((c) => c.id === selectedCategory) || EMOJI_CATEGORIES[0];

  const displayedEmojis = searchQuery.trim()
    ? EMOJI_CATEGORIES.flatMap((cat) => cat.emojis).filter((emoji) => emoji.includes(searchQuery.trim()))
    : currentCategoryObj.emojis;

  const handleSelectEmoji = (emoji: string) => {
    setSelectedEmoji(emoji);
    setIsUseInitials(false);
  };

  const handleSelectColor = (colorId: string) => {
    setSelectedBgId(colorId);
    setIsUseInitials(false);
  };

  const handleSetInitials = () => {
    setIsUseInitials(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isUseInitials) {
        await onSave(null);
      } else {
        const encoded = encodeEmojiAvatar(selectedEmoji, selectedBgId);
        await onSave(encoded);
      }
      onClose();
    } catch (err) {
      console.error('Error saving avatar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Preview string for Avatar component
  const previewAvatarUrl = isUseInitials ? null : encodeEmojiAvatar(selectedEmoji, selectedBgId);
  const activeColorOption = getAvatarColorOption(selectedBgId);

  return (
    <div
      id="avatar_picker_backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar_picker_modal_title"
    >
      <div
        id="avatar_picker_container"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest rounded-3xl w-full max-w-lg shadow-2xl border border-surface-dim overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-surface-dim/60 flex items-center justify-between bg-surface-container-low/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2
                id="avatar_picker_modal_title"
                className="text-base sm:text-lg font-bold text-on-surface font-['Plus_Jakarta_Sans'] leading-tight"
              >
                {t('settings.avatarPickerTitle') || 'Choose Avatar'}
              </h2>
              <p className="text-xs text-outline font-['Manrope']">
                {t('settings.avatarPickerSubtitle') || 'Select a custom emoji and background style'}
              </p>
            </div>
          </div>
          <button
            id="avatar_picker_close_btn"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto flex-1">
          {/* 1. Live Interactive Preview */}
          <div className="bg-surface-container-low/60 rounded-2xl p-4 border border-surface-dim/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar
                  name={userName}
                  email={userEmail}
                  avatarUrl={previewAvatarUrl}
                  size="xl"
                  className="shadow-md ring-4 ring-surface"
                />
                {!isUseInitials && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px]">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold tracking-wider uppercase text-outline">
                  {t('profile.title') || 'Preview'}
                </span>
                <div className="text-sm font-bold text-on-surface flex items-center gap-2">
                  {isUseInitials ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <User className="w-3 h-3" />
                      {t('settings.avatarUseInitials') || 'Using Initials'}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold">
                      {selectedEmoji} • {language === 'ur' ? activeColorOption.nameUrdu : language === 'roman-urdu' ? activeColorOption.nameRomanUrdu : activeColorOption.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant/80">
                  {userName || userEmail || 'YAAD User'}
                </p>
              </div>
            </div>

            {/* Use Initials Switcher */}
            <button
              id="avatar_toggle_initials_btn"
              type="button"
              onClick={handleSetInitials}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                isUseInitials
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('settings.avatarUseInitials') || 'Use Initials'}</span>
            </button>
          </div>

          {/* 2. Background Color Palettes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <label className="text-xs font-bold uppercase tracking-wider text-outline font-['Manrope']">
                {t('settings.avatarBgColorTitle') || 'Background Color'}
              </label>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {AVATAR_COLOR_PALETTES.map((palette) => {
                const isSelected = !isUseInitials && selectedBgId === palette.id;
                return (
                  <button
                    key={palette.id}
                    id={`avatar_color_${palette.id}`}
                    type="button"
                    onClick={() => handleSelectColor(palette.id)}
                    title={language === 'ur' ? palette.nameUrdu : palette.name}
                    aria-label={`Select background color ${palette.name}`}
                    className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-150 relative ${
                      palette.bgClass
                    } ${palette.borderClass} border ${
                      isSelected
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface scale-110 shadow-sm'
                        : 'hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 stroke-[3] text-current" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Category Selector & Search */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <label className="text-xs font-bold uppercase tracking-wider text-outline font-['Manrope']">
                {t('settings.avatarCategoriesTitle') || 'Emoji Category'}
              </label>
            </div>

            {/* Category horizontal scrolling bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
              {EMOJI_CATEGORIES.map((cat) => {
                const isActive = !searchQuery && selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`avatar_cat_tab_${cat.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSearchQuery('');
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-xs font-bold'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="text-sm leading-none">{cat.icon}</span>
                    <span>{getCategoryLabel(cat.id, cat.name)}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline rtl:left-auto rtl:right-3.5" />
              <input
                id="avatar_emoji_search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('settings.avatarSearchPlaceholder') || 'Search emojis...'}
                className="w-full h-9 bg-surface-container rounded-xl pl-9 pr-8 rtl:pl-8 rtl:pr-9 text-xs font-['Manrope'] text-on-surface placeholder:text-outline border border-surface-dim focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface w-4 h-4 rounded-full flex items-center justify-center rtl:right-auto rtl:left-2.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 4. Emoji Grid */}
            <div
              id="avatar_emoji_grid"
              className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-surface-container-lowest rounded-2xl border border-surface-dim/60 max-h-56 overflow-y-auto"
            >
              {displayedEmojis.length > 0 ? (
                displayedEmojis.map((emoji, index) => {
                  const isSelected = !isUseInitials && selectedEmoji === emoji;
                  return (
                    <button
                      key={`${emoji}-${index}`}
                      type="button"
                      id={`avatar_emoji_btn_${index}`}
                      onClick={() => handleSelectEmoji(emoji)}
                      aria-label={`Select ${emoji}`}
                      className={`h-11 rounded-xl flex items-center justify-center text-2xl transition-all duration-150 select-none ${
                        isSelected
                          ? `${activeColorOption.bgClass} ring-2 ring-primary scale-110 shadow-sm font-bold`
                          : 'hover:bg-surface-container-high hover:scale-105 active:scale-95'
                      }`}
                    >
                      <span className="leading-none">{emoji}</span>
                    </button>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center text-xs text-outline">
                  No emojis found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-surface-dim/60 bg-surface-container-low/30 flex items-center justify-between gap-3 shrink-0">
          <button
            id="avatar_picker_cancel_btn"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 text-xs font-semibold text-outline hover:text-on-surface hover:bg-surface-container rounded-2xl transition-colors active:scale-95"
          >
            {t('settings.cancel') || 'Cancel'}
          </button>

          <button
            id="avatar_picker_save_btn"
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs font-bold text-on-primary bg-primary hover:bg-primary/90 rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('settings.saving') || 'Saving...'}</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('settings.avatarSaveBtn') || 'Save Avatar'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
