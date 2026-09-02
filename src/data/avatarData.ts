export interface AvatarColorOption {
  id: string;
  name: string;
  nameUrdu?: string;
  nameRomanUrdu?: string;
  bgClass: string;
  borderClass: string;
  previewHex: string;
}

export const AVATAR_COLOR_PALETTES: AvatarColorOption[] = [
  {
    id: 'forest',
    name: 'YAAD Green',
    nameUrdu: 'یاد سبز',
    nameRomanUrdu: 'YAAD Sabz',
    bgClass: 'bg-[#005039] text-[#e1f5ec]',
    borderClass: 'border-[#003d2b]',
    previewHex: '#005039',
  },
  {
    id: 'mint',
    name: 'Soft Mint',
    nameUrdu: 'ہلکا پودینہ',
    nameRomanUrdu: 'Halka Mint',
    bgClass: 'bg-[#e1f5ec] text-[#005039]',
    borderClass: 'border-[#a2e6cb]',
    previewHex: '#a2e6cb',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    nameUrdu: 'زمرد',
    nameRomanUrdu: 'Emerald',
    bgClass: 'bg-emerald-100 text-emerald-900',
    borderClass: 'border-emerald-300',
    previewHex: '#10b981',
  },
  {
    id: 'teal',
    name: 'Ocean Teal',
    nameUrdu: 'نیلا سبز',
    nameRomanUrdu: 'Ocean Teal',
    bgClass: 'bg-teal-100 text-teal-900',
    borderClass: 'border-teal-300',
    previewHex: '#14b8a6',
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    nameUrdu: 'گرم امبر',
    nameRomanUrdu: 'Warm Amber',
    bgClass: 'bg-amber-100 text-amber-950',
    borderClass: 'border-amber-300',
    previewHex: '#f59e0b',
  },
  {
    id: 'orange',
    name: 'Tangerine',
    nameUrdu: 'نارنجی',
    nameRomanUrdu: 'Narangi',
    bgClass: 'bg-orange-100 text-orange-950',
    borderClass: 'border-orange-300',
    previewHex: '#f97316',
  },
  {
    id: 'rose',
    name: 'Soft Rose',
    nameUrdu: 'گلابی',
    nameRomanUrdu: 'Gulabi',
    bgClass: 'bg-rose-100 text-rose-950',
    borderClass: 'border-rose-300',
    previewHex: '#f43f5e',
  },
  {
    id: 'purple',
    name: 'Lavender',
    nameUrdu: 'جامنی',
    nameRomanUrdu: 'Jamni',
    bgClass: 'bg-purple-100 text-purple-950',
    borderClass: 'border-purple-300',
    previewHex: '#a855f7',
  },
  {
    id: 'indigo',
    name: 'Indigo',
    nameUrdu: 'گہرا نیلا',
    nameRomanUrdu: 'Indigo',
    bgClass: 'bg-indigo-100 text-indigo-950',
    borderClass: 'border-indigo-300',
    previewHex: '#6366f1',
  },
  {
    id: 'sky',
    name: 'Sky Blue',
    nameUrdu: 'آسمانی',
    nameRomanUrdu: 'Aasmani',
    bgClass: 'bg-sky-100 text-sky-950',
    borderClass: 'border-sky-300',
    previewHex: '#0ea5e9',
  },
  {
    id: 'warm',
    name: 'Warm Cream',
    nameUrdu: 'کریم',
    nameRomanUrdu: 'Cream',
    bgClass: 'bg-[#f5ede2] text-[#4a3525]',
    borderClass: 'border-[#dfceb9]',
    previewHex: '#d8c2aa',
  },
  {
    id: 'slate',
    name: 'Slate Grey',
    nameUrdu: 'سرمئی',
    nameRomanUrdu: 'Surmayi',
    bgClass: 'bg-slate-100 text-slate-900',
    borderClass: 'border-slate-300',
    previewHex: '#64748b',
  },
];

export interface AvatarCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: AvatarCategory[] = [
  {
    id: 'faces',
    name: 'Faces',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘',
      '😋', '😛', '😜', '🤪', '😎', '🤓', '🧐', '🥳',
      '🤠', '🤗', '🤔', '🤫', '😌', '😴', '🤖', '👻',
      '👽', '😺', '😸', '😻', '😼', '😽', '🙀', '🦁'
    ],
  },
  {
    id: 'people',
    name: 'People',
    icon: '🧑‍🍳',
    emojis: [
      '🧑‍🍳', '👩‍🍳', '👨‍🍳', '👩‍🌾', '👨‍🌾', '👨‍💻', '👩‍💻', '🧕',
      '👳‍♂️', '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🏃‍♀️', '🏃‍♂️', '🧘‍♀️',
      '🧘‍♂️', '🚴‍♀️', '🚴‍♂️', '🧑‍🎨', '👩‍🔬', '👨‍🚀', '👸', '🤴',
      '👶', '👵', '👴', '🧑‍🤝‍🧑', '🕵️‍♀️', '🕵️‍♂️', '🧑‍🚀', '💃'
    ],
  },
  {
    id: 'food',
    name: 'Food',
    icon: '🥑',
    emojis: [
      '🍎', '🍏', '🥑', '🥦', '🥕', '🍅', '🥔', '🧅',
      '🌽', '🥒', '🥬', '🍌', '🍇', '🍓', '🫐', '🍉',
      '🍋', '🥭', '🍍', '🥥', '🥐', '🍞', '🥖', '🧀',
      '🥚', '🍳', '🥞', '🍕', '🍔', '🌮', '🥗', '🍜',
      '🍣', '🍰', '🧁', '🍩', '🍫', '🍿', '☕', '🧃',
      '🥤', '🍵', '🫖', '🍯', '🥜', '🫒', '🌶️', '🥩'
    ],
  },
  {
    id: 'animals',
    name: 'Animals',
    icon: '🦁',
    emojis: [
      '🦁', '🐯', '🐻', '🐼', '🐨', '🦊', '🐱', '🐶',
      '🐰', '🐹', '🐭', '🦄', '🐴', '🐮', '🐷', '🐸',
      '🐒', '🐔', '🐧', '🦆', '🦉', '🦅', '🐺', '🐬',
      '🐳', '🦈', '🐙', '🦋', '🐝', '🐞', '🐢', '🐘',
      '🦒', '🦘', '🦔', '🦚', '🦜', '🦩', '🦥', '🦦'
    ],
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: '🌸',
    emojis: [
      '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🍀', '🌿',
      '🌱', '🌴', '🌲', '🌳', '🌵', '🌾', '🍁', '🍂',
      '🍄', '🌈', '⚡', '☀️', '🌤️', '🌙', '⭐', '🌟',
      '✨', '💫', '🌊', '❄️', '🔥', '💧', '🌍', '🪐'
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: '🛒',
    emojis: [
      '🛒', '🛍️', '🎒', '📚', '💡', '🎧', '📱', '💻',
      '⌚', '📷', '🎨', '🖌️', '🔑', '🗝️', '📦', '🎁',
      '🎈', '🚲', '🚗', '🛵', '✈️', '🚀', '⚽', '🏀',
      '🎾', '🏸', '🛹', '🎸', '🎹', '🔔', '🧭', '🧳'
    ],
  },
  {
    id: 'fun',
    name: 'Fun',
    icon: '🎉',
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🎮', '🕹️', '🎯', '🎲',
      '🎳', '🏆', '🥇', '🎪', '🪄', '🧩', '🎨', '🍿',
      '🎟️', '🎡', '🎢', '🕶️', '🪅', '🎆', '🔮', '🧸',
      '🪁', '🪀', '🪄', '🎤', '🎧', '🥁', '🎺', '🎷'
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: '💚',
    emojis: [
      '💚', '💖', '❤️', '💙', '💜', '💛', '🤍', '🧡',
      '⭐', '✨', '🌟', '💫', '💎', '🔥', '⚡', '🕊️',
      '🌿', '🎯', '🍀', '💡', '👑', '💯', '✔️', '🧿',
      '☀️', '🌙', '🪄', '🔮', '🛡️', '⚡', '🗝️', '🔔'
    ],
  },
];

/**
 * Parses any avatar string (emoji string, encoded avatar, or photo URL).
 */
export function parseAvatarValue(raw?: string | null): {
  isEmoji: boolean;
  emoji: string | null;
  bgId: string;
  isImageUrl: boolean;
  imageUrl: string | null;
} {
  if (!raw || !raw.trim()) {
    return {
      isEmoji: false,
      emoji: null,
      bgId: 'mint',
      isImageUrl: false,
      imageUrl: null,
    };
  }

  const trimmed = raw.trim();

  // 1. Encoded emoji format: "emoji:🥑:emerald" or "emoji:🥑"
  if (trimmed.startsWith('emoji:')) {
    const parts = trimmed.split(':');
    const emoji = parts[1] || '🥑';
    const bgId = parts[2] || 'mint';
    return {
      isEmoji: true,
      emoji,
      bgId,
      isImageUrl: false,
      imageUrl: null,
    };
  }

  // 2. JSON format: {"emoji":"🥑","bg":"mint"}
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.emoji) {
        return {
          isEmoji: true,
          emoji: parsed.emoji,
          bgId: parsed.bg || 'mint',
          isImageUrl: false,
          imageUrl: null,
        };
      }
    } catch {
      // Ignore JSON parse error and continue
    }
  }

  // 3. Image URLs (http, https, data URI)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return {
      isEmoji: false,
      emoji: null,
      bgId: 'mint',
      isImageUrl: true,
      imageUrl: trimmed,
    };
  }

  // 4. Standalone emoji character (or short string that isn't a URL)
  // Check if string is 1-4 chars (emoji representation)
  if (trimmed.length <= 8 && !trimmed.includes('/') && !trimmed.includes('.')) {
    return {
      isEmoji: true,
      emoji: trimmed,
      bgId: 'mint',
      isImageUrl: false,
      imageUrl: null,
    };
  }

  return {
    isEmoji: false,
    emoji: null,
    bgId: 'mint',
    isImageUrl: true,
    imageUrl: trimmed,
  };
}

/**
 * Creates the encoded avatar string to store in Supabase profile table.
 */
export function encodeEmojiAvatar(emoji: string, bgId: string = 'forest'): string {
  return `emoji:${emoji}:${bgId}`;
}

/**
 * Retrieves color style definition by ID with robust fallback.
 */
export function getAvatarColorOption(bgId?: string): AvatarColorOption {
  const match = AVATAR_COLOR_PALETTES.find((c) => c.id === bgId);
  return match || AVATAR_COLOR_PALETTES[1]; // default 'mint'
}
