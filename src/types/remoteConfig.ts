/**
 * YAAD Remote Control System — Authoritative Types & Default Values
 *
 * Every control defaults to "show / allowed" (today's behavior),
 * ensuring the app fails-open when config cannot be fetched.
 */

export interface RemoteConfigHeader {
  showSettingsGear: boolean;
  showNotificationBell: boolean;
  showBellBadgeCount: boolean;
  showAvatarButton: boolean;
  showMiloCompanion: boolean;
}

export interface RemoteConfigHome {
  showGreeting: boolean;
  showHeroCard: boolean;
  showCreateListButton: boolean;
  showTileRecentLists: boolean;
  showTileFavorites: boolean;
  showTileCategories: boolean;
  showTileStatistics: boolean;
  showFrequentEssentials: boolean;
  essentialsCount: number;
  showEssentialsViewAll: boolean;
  showYourLists: boolean;
  showListMenuDetails: boolean;
  showListMenuShare: boolean;
  showListMenuReuse: boolean;
  showListMenuDelete: boolean;
}

export interface RemoteConfigBottomNav {
  showHomeTab: boolean;
  showCreateTab: boolean;
  showHistoryTab: boolean;
  showSettingsTab?: boolean;
}

export interface RemoteConfigScreens {
  historyScreenEnabled: boolean;
  statisticsScreenEnabled: boolean;
}

export interface RemoteConfigSettings {
  showEditProfile: boolean;
  showPhotoUpload: boolean;
  showChangePassword: boolean;
  showLanguageRow: boolean;
  showSoundEffects: boolean;
  showThemeRow: boolean;
  showMiloRow: boolean;
  showSupportDesk: boolean;
  showAboutRow: boolean;
  showSignOut: boolean;
  showDeleteAccount: boolean; // default false for safety

  // Direct convenience aliases matching settings keys
  editProfile?: boolean;
  photoUpload?: boolean;
  changePassword?: boolean;
  languageSelect?: boolean;
  soundEffects?: boolean;
  themeColor?: boolean;
  miloCompanion?: boolean;
  customerSupport?: boolean;
  aboutYaad?: boolean;
  signOut?: boolean;
  deleteAccount?: boolean;
}

export interface RemoteConfigFeatures {
  barcodeScanner: boolean;
  itemPhotoUpload: boolean;
  smartSuggestions: boolean;
  shareList: boolean;
  actionReuseList: boolean;
  actionMarkComplete: boolean;
  actionDeleteSession: boolean;
  actionDeleteList: boolean;
  actionHistoryManage: boolean;
  enableAiCategorizer: boolean;
  enableOfflineSync: boolean;
  enableSoundEffects: boolean;
  enablePushNotifications: boolean;
  enableRashanGuide: boolean;
}

export interface FixedEssentialItem {
  canonicalName: string;
  displayName: string;
  nameUrdu?: string;
  nameRomanUrdu?: string;
  category: string;
  quantity: string;
  unit: string;
  isPersonalized?: boolean;
}

export interface RemoteConfigEssentials {
  fixedList: FixedEssentialItem[];
}

export interface RemoteConfigSystem {
  maintenanceMode: {
    enabled: boolean;
    message?: string;
    messageUr?: string;
  };
  minAppVersion: string;
  announcementBanner: {
    enabled: boolean;
    text?: string;
    textUr?: string;
    startDate?: string;
    endDate?: string;
    type?: 'info' | 'warning' | 'deal';
  };
  limits: {
    maxListsPerUser: number;
    maxItemsPerList: number;
    maxPhotoSizeMb: number;
  };
  hiddenCatalogCategories: string[];
  hiddenCatalogItemIds: string[];
  stagedRollouts: Record<string, number>;
  supportControls: {
    cannedRepliesEnabled: boolean;
    disabledCategories: string[];
    autoReplyText?: string;
  };
}

export interface AbuseRuleDefinition {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold: number;
  windowMinutes: number;
  action: 'queue' | 'throttle' | 'warn' | 'suspend';
}

export interface RemoteConfigAbuse {
  rules: AbuseRuleDefinition[];
}

export interface RemoteConfigDocument {
  version: number;
  updatedAt: number;
  updatedBy?: string;
  header: RemoteConfigHeader;
  home: RemoteConfigHome;
  bottomNav: RemoteConfigBottomNav;
  screens: RemoteConfigScreens;
  settings: RemoteConfigSettings;
  features: RemoteConfigFeatures;
  essentials: RemoteConfigEssentials;
  system: RemoteConfigSystem;
  abuse: RemoteConfigAbuse;
}

export interface TargetedUserMessage {
  id: string;
  title: string;
  titleUr?: string;
  body: string;
  bodyUr?: string;
  sentAt: number;
  read?: boolean;
}

export interface UserOverrideRecord {
  userId: string;
  status: 'active' | 'suspended' | 'blocked';
  isReadOnly: boolean;
  notes?: string;
  targetedMessages: TargetedUserMessage[];
  overrides: Record<string, any>; // Flattened keys e.g. "header.showSettingsGear": false
  updatedAt: number;
  updatedBy?: string;
}

export interface AbuseEventRecord {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  ruleId: string;
  ruleName: string;
  details: string;
  actionTaken: string;
  status: 'pending' | 'warned' | 'suspended' | 'dismissed' | 'resolved';
  createdAt: number;
  resolvedAt?: number;
  resolvedBy?: string;
}

export const DEFAULT_FIXED_ESSENTIALS: FixedEssentialItem[] = [
  {
    canonicalName: 'milk',
    displayName: 'Milk',
    nameUrdu: 'دودھ',
    nameRomanUrdu: 'Doodh',
    category: 'dairy',
    quantity: '1',
    unit: 'Litre',
    isPersonalized: false,
  },
  {
    canonicalName: 'eggs',
    displayName: 'Eggs',
    nameUrdu: 'انڈے',
    nameRomanUrdu: 'Anday',
    category: 'poultry',
    quantity: '1',
    unit: 'Dozen',
    isPersonalized: false,
  },
  {
    canonicalName: 'potatoes',
    displayName: 'Potatoes',
    nameUrdu: 'آلو',
    nameRomanUrdu: 'Aloo',
    category: 'vegetables',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'tomatoes',
    displayName: 'Tomatoes',
    nameUrdu: 'ٹماٹر',
    nameRomanUrdu: 'Tamatar',
    category: 'vegetables',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'rice',
    displayName: 'Rice',
    nameUrdu: 'چاول',
    nameRomanUrdu: 'Chawal',
    category: 'rice',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'sugar',
    displayName: 'Sugar',
    nameUrdu: 'چینی',
    nameRomanUrdu: 'Cheeni',
    category: 'cooking_essentials',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'onions',
    displayName: 'Onions',
    nameUrdu: 'پیاز',
    nameRomanUrdu: 'Pyaz',
    category: 'vegetables',
    quantity: '1',
    unit: 'kg',
    isPersonalized: false,
  },
  {
    canonicalName: 'cooking_oil',
    displayName: 'Cooking Oil',
    nameUrdu: 'کوکنگ آئل',
    nameRomanUrdu: 'Cooking Oil',
    category: 'cooking_essentials',
    quantity: '1',
    unit: 'Litre',
    isPersonalized: false,
  },
];

export const DEFAULT_ABUSE_RULES: AbuseRuleDefinition[] = [
  {
    id: 'lists_per_hour',
    name: 'Lists created per hour',
    description: 'Detects bots or users rapidly creating empty or spam lists',
    enabled: true,
    threshold: 10,
    windowMinutes: 60,
    action: 'queue',
  },
  {
    id: 'items_per_minute',
    name: 'Items added/deleted per minute',
    description: 'High-frequency item mutations indicating automated scraping',
    enabled: true,
    threshold: 60,
    windowMinutes: 1,
    action: 'throttle',
  },
  {
    id: 'duplicate_lists',
    name: 'Repeated duplicate list names',
    description: 'Creating the exact same list title repeatedly in a short window',
    enabled: true,
    threshold: 5,
    windowMinutes: 30,
    action: 'queue',
  },
  {
    id: 'support_tickets_daily',
    name: 'Support tickets per day',
    description: 'Flooding customer support desk with excessive tickets',
    enabled: true,
    threshold: 5,
    windowMinutes: 1440,
    action: 'warn',
  },
  {
    id: 'rapid_signin_failures',
    name: 'Rapid sign-in failures',
    description: 'Potential credential stuffing or brute-force pattern',
    enabled: true,
    threshold: 5,
    windowMinutes: 15,
    action: 'queue',
  },
];

export const DEFAULT_REMOTE_CONFIG: RemoteConfigDocument = {
  version: 1,
  updatedAt: Date.now(),
  header: {
    showSettingsGear: true,
    showNotificationBell: true,
    showBellBadgeCount: true,
    showAvatarButton: true,
    showMiloCompanion: true,
  },
  home: {
    showGreeting: true,
    showHeroCard: true,
    showCreateListButton: true,
    showTileRecentLists: true,
    showTileFavorites: true,
    showTileCategories: true,
    showTileStatistics: true,
    showFrequentEssentials: true,
    essentialsCount: 8,
    showEssentialsViewAll: true,
    showYourLists: true,
    showListMenuDetails: true,
    showListMenuShare: true,
    showListMenuReuse: true,
    showListMenuDelete: true,
  },
  bottomNav: {
    showHomeTab: true,
    showCreateTab: true,
    showHistoryTab: true,
  },
  screens: {
    historyScreenEnabled: true,
    statisticsScreenEnabled: true,
  },
  settings: {
    showEditProfile: true,
    showPhotoUpload: true,
    showChangePassword: true,
    showLanguageRow: true,
    showSoundEffects: true,
    showThemeRow: true,
    showMiloRow: true,
    showSupportDesk: true,
    showAboutRow: true,
    showSignOut: true,
    showDeleteAccount: false, // hidden by default for user safety
  },
  features: {
    barcodeScanner: true,
    itemPhotoUpload: true,
    smartSuggestions: true,
    shareList: true,
    actionReuseList: true,
    actionMarkComplete: true,
    actionDeleteSession: true,
    actionDeleteList: true,
    actionHistoryManage: true,
    enableAiCategorizer: true,
    enableOfflineSync: true,
    enableSoundEffects: true,
    enablePushNotifications: true,
    enableRashanGuide: true,
  },
  essentials: {
    fixedList: DEFAULT_FIXED_ESSENTIALS,
  },
  system: {
    maintenanceMode: {
      enabled: false,
      message: 'YAAD is currently undergoing scheduled maintenance. Please check back shortly.',
      messageUr: 'یاد ایپ میں فی الحال سسٹم مینٹیننس جاری ہے۔ براہ کرم تھوڑی دیر بعد دوبارہ کوشش کریں۔',
    },
    minAppVersion: '1.0.0',
    announcementBanner: {
      enabled: false,
      text: '',
      textUr: '',
      type: 'info',
    },
    limits: {
      maxListsPerUser: 50,
      maxItemsPerList: 100,
      maxPhotoSizeMb: 5,
    },
    hiddenCatalogCategories: [],
    hiddenCatalogItemIds: [],
    stagedRollouts: {},
    supportControls: {
      cannedRepliesEnabled: true,
      disabledCategories: [],
    },
  },
  abuse: {
    rules: DEFAULT_ABUSE_RULES,
  },
};

/**
 * Merges global config with per-user override patch.
 * Nested structure with support for flattened dotted keys ("header.showSettingsGear").
 */
export function mergeRemoteConfig(
  globalConfig: RemoteConfigDocument,
  userOverride?: UserOverrideRecord | null
): {
  config: RemoteConfigDocument;
  userStatus: 'active' | 'suspended' | 'blocked';
  isReadOnly: boolean;
  targetedMessages: TargetedUserMessage[];
} {
  const result: RemoteConfigDocument = JSON.parse(JSON.stringify(globalConfig || DEFAULT_REMOTE_CONFIG));

  let userStatus: 'active' | 'suspended' | 'blocked' = 'active';
  let isReadOnly = false;
  let targetedMessages: TargetedUserMessage[] = [];

  if (userOverride) {
    if (userOverride.status) userStatus = userOverride.status;
    if (typeof userOverride.isReadOnly === 'boolean') isReadOnly = userOverride.isReadOnly;
    if (Array.isArray(userOverride.targetedMessages)) targetedMessages = userOverride.targetedMessages;

    const overrides = userOverride.overrides || {};
    for (const [key, val] of Object.entries(overrides)) {
      if (key.includes('.')) {
        const parts = key.split('.');
        let current: any = result;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = val;
      } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        (result as any)[key] = { ...((result as any)[key] || {}), ...val };
      } else {
        (result as any)[key] = val;
      }
    }
  }

  return {
    config: result,
    userStatus,
    isReadOnly,
    targetedMessages,
  };
}
