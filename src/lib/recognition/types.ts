import { CategoryId } from '../../types';

export interface CanonicalItemRecord {
  id: string;
  canonical_name: string;
  english_name: string;
  urdu_name: string;
  roman_urdu_names: string[];
  aliases: string[];
  category: CategoryId;
  subcategory?: string;
  common_spellings: string[];
  confidence: number;
  active: boolean;
  emoji?: string;
  defaultUnit?: string;

  // CamelCase accessors for seamless backward compatibility
  canonicalName: string;
  nameUrdu: string;
  nameRomanUrdu: string;
  categoryId: CategoryId;
}

export type RecognitionSource =
  | 'exact_item'
  | 'exact_alias'
  | 'prefix_match'
  | 'phonetic_match'
  | 'common_spelling'
  | 'fuzzy_match'
  | 'token_match'
  | 'user_override'
  | 'ai'
  | 'fallback';

export interface RecognitionResult {
  canonicalName: string;
  englishName: string;
  nameUrdu?: string;
  nameRomanUrdu?: string;
  quantity?: string;
  unit?: string;
  categoryId: CategoryId;
  confidence: number;
  isRecognized: boolean;
  unresolved: boolean;
  emoji?: string;
  rawInput: string;
  matchedVia: RecognitionSource;
}

export interface ExtractedQuantityResult {
  cleanName: string;
  quantity?: string;
  unit?: string;
  rawInput: string;
}

export interface ItemCatalogProvider {
  getItem(id: string): CanonicalItemRecord | undefined;
  getAllItems(): CanonicalItemRecord[];
  findExact(term: string): CanonicalItemRecord | undefined;
  findPrefix?(term: string): CanonicalItemRecord | undefined;
  findById?(id: string): CanonicalItemRecord | undefined;
  findPhonetic(phoneticTerm: string): CanonicalItemRecord | undefined;
  findCommonSpelling(spelling: string): CanonicalItemRecord | undefined;
  findFuzzy(
    term: string,
    minScore: number
  ): { item: CanonicalItemRecord; score: number } | null;
  registerItems(items: CanonicalItemRecord[]): void;
}

export interface AIClassificationResult {
  categoryId: CategoryId;
  canonicalName?: string;
  nameUrdu?: string;
  confidence: number;
  source: string;
}

export interface AIClassifierProvider {
  classifyUnknownItem(input: string): Promise<AIClassificationResult>;
}
