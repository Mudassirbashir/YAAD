import React from 'react';

/**
 * Regular expression to detect Urdu / Arabic script Unicode ranges:
 * - Arabic (0600-06FF)
 * - Arabic Supplement (0750-077F)
 * - Arabic Extended-A (08A0-08FF)
 * - Arabic Presentation Forms-A (FB50-FDFF)
 * - Arabic Presentation Forms-B (FE70-FEFF)
 */
export const URDU_SCRIPT_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Checks if a string contains any Urdu/Arabic script characters.
 */
export const containsUrdu = (text: string | null | undefined): boolean => {
  if (!text) return false;
  return URDU_SCRIPT_REGEX.test(text);
};

interface BidiTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: 'span' | 'bdi' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  forceUrduFont?: boolean;
}

/**
 * BidiText Component
 * Wraps dynamic user or mixed-language text inside a Bidirectional Isolation (<bdi>) tag.
 * Automatically detects whether the text contains Urdu glyphs and applies the high-readability
 * Urdu typography stack without breaking LTR numbers, Latin words, or colon/hyphen punctuation.
 */
export const BidiText: React.FC<BidiTextProps> = ({
  children,
  as: Component = 'bdi',
  className = '',
  forceUrduFont = false,
  ...props
}) => {
  const isUrdu = forceUrduFont || (typeof children === 'string' && containsUrdu(children));
  const fontClass = isUrdu ? 'font-urdu' : '';

  return (
    <Component
      dir="auto"
      className={`bidi-isolate ${fontClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
};

interface MixedItemBadgeProps {
  quantity?: string | number | null;
  unit?: string | null;
  className?: string;
}

/**
 * Formats quantity and unit (e.g. "1 KG", "2 Dozen", "500 g") safely isolated
 * so it never gets reversed when placed adjacent to Urdu or mixed names.
 */
export const MixedQuantityBadge: React.FC<MixedItemBadgeProps> = ({
  quantity,
  unit,
  className = '',
}) => {
  if (!quantity) return null;

  const rawQty = String(quantity);
  const rawUnit = unit ? ` ${unit}` : '';
  const text = `${rawQty}${rawUnit}`;

  return (
    <bdi dir="ltr" className={`bidi-isolate font-['Manrope'] tabular-nums ${className}`}>
      {text}
    </bdi>
  );
};

/**
 * Helper to safely format mixed strings like "1 KG آلو" or "Shopping List: آلو"
 * by wrapping the directional components in isolation marks (Unicode RLI/LRI/PDI).
 */
export const formatMixedString = (prefix: string, body: string, separator: string = ' '): string => {
  // \u2066 is Left-to-Right Isolate (LRI)
  // \u2067 is Right-to-Left Isolate (RLI)
  // \u2069 is Pop Directional Isolate (PDI)
  const isPrefixUrdu = containsUrdu(prefix);
  const isBodyUrdu = containsUrdu(body);

  const isolatedPrefix = isPrefixUrdu ? `\u2067${prefix}\u2069` : `\u2066${prefix}\u2069`;
  const isolatedBody = isBodyUrdu ? `\u2067${body}\u2069` : `\u2066${body}\u2069`;

  return `${isolatedPrefix}${separator}${isolatedBody}`;
};
