import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const CTA_VARIANTS = [
  'Never forget a household staple again — make and organize your grocery list with YAAD.',
  'Heading out to the bazaar? Open YAAD to check off items in real-time, fully offline.',
  'Save time and eliminate duplicate buying — keep your weekly kiryana and monthly rashan lists in YAAD.',
  'Add items in English, Roman Urdu or Urdu script — YAAD categorizes your Pakistani groceries automatically.',
  'Keep shopping simple, fast, and organized for your family with YAAD. 100% free with no ads.',
];

interface ArticleBodyRendererProps {
  body: string;
  isStandalonePage?: boolean;
  onOpenAppAction?: () => void;
}

/**
 * Parses inline markdown: **bold**, *italic*, [anchor](url)
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  // Regex to match links [text](url) and bold **text** and italic *text*
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // 1. Link: [text](url)
    const linkMatch = remaining.match(/^([\s\S]*?)\[([^\]]+)\]\(([^)]+)\)/);
    // 2. Bold: **text**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*([^*]+)\*\*/);
    // 3. Italic: *text*
    const italicMatch = remaining.match(/^([\s\S]*?)\*([^*]+)\*/);

    let earliestType: 'link' | 'bold' | 'italic' | null = null;
    let earliestPrefixLen = Infinity;

    if (linkMatch && linkMatch[1].length < earliestPrefixLen) {
      earliestType = 'link';
      earliestPrefixLen = linkMatch[1].length;
    }
    if (boldMatch && boldMatch[1].length < earliestPrefixLen) {
      earliestType = 'bold';
      earliestPrefixLen = boldMatch[1].length;
    }
    if (italicMatch && italicMatch[1].length < earliestPrefixLen) {
      earliestType = 'italic';
      earliestPrefixLen = italicMatch[1].length;
    }

    if (!earliestType) {
      tokens.push(remaining);
      break;
    }

    if (earliestType === 'link' && linkMatch) {
      if (linkMatch[1]) tokens.push(linkMatch[1]);
      tokens.push(
        <a
          key={`link-${keyIdx++}`}
          href={linkMatch[3]}
          className="text-[#005039] font-semibold underline underline-offset-3 hover:text-[#0a4d38] transition-colors"
        >
          {linkMatch[2]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
    } else if (earliestType === 'bold' && boldMatch) {
      if (boldMatch[1]) tokens.push(boldMatch[1]);
      tokens.push(
        <strong key={`bold-${keyIdx++}`} className="font-bold text-[#1c2826]">
          {boldMatch[2]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
    } else if (earliestType === 'italic' && italicMatch) {
      if (italicMatch[1]) tokens.push(italicMatch[1]);
      tokens.push(
        <em key={`italic-${keyIdx++}`} className="italic">
          {italicMatch[2]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
    }
  }

  return <>{tokens}</>;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const ArticleBodyRenderer: React.FC<ArticleBodyRendererProps> = ({
  body,
  isStandalonePage = false,
  onOpenAppAction,
}) => {
  if (!body) return null;

  // Split by double newline or table blocks
  const rawBlocks = body.split(/\n\s*\n/);
  let ctaIndex = 0;

  return (
    <div className={`space-y-5 text-[#374740] ${isStandalonePage ? 'text-base sm:text-lg leading-relaxed' : 'text-xs sm:text-sm leading-relaxed'}`}>
      {rawBlocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Explicit CTA marker [CTA]
        if (trimmed === '[CTA]' || trimmed === '## CTA' || trimmed.startsWith('[CTA:')) {
          const ctaText = CTA_VARIANTS[ctaIndex % CTA_VARIANTS.length];
          ctaIndex++;
          return (
            <div
              key={`cta-${bIdx}`}
              className="my-7 p-5 sm:p-6 rounded-2xl bg-[#003527] text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#0a4d38]"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[#FCBC1F] text-[#003527] flex items-center justify-center shrink-0 font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase font-extrabold tracking-wider text-[#FCBC1F] mb-1">
                    Jo zaroori hai, YAAD rahe
                  </p>
                  <p className="text-sm sm:text-base font-medium text-emerald-50">
                    {ctaText}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenAppAction || (() => { window.location.href = '/'; })}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-[#FCBC1F] text-[#003527] hover:bg-[#ebd056] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <span>Open in YAAD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        }

        // 2. Table Block (Lines starting with |)
        if (trimmed.startsWith('|') && trimmed.includes('\n|')) {
          const rows = trimmed
            .split('\n')
            .map((r) => r.trim())
            .filter((r) => r.startsWith('|'));

          if (rows.length >= 2) {
            const parseRow = (rowStr: string) =>
              rowStr
                .replace(/^\|/, '')
                .replace(/\|$/, '')
                .split('|')
                .map((cell) => cell.trim());

            const headerRow = parseRow(rows[0]);
            // check if row 1 is separator |---|---|
            const isSeparator = /^\|?\s*:?-+:?\s*\|/.test(rows[1]);
            const bodyRows = rows.slice(isSeparator ? 2 : 1).map(parseRow);

            return (
              <div key={`table-${bIdx}`} className="my-5 overflow-x-auto rounded-xl border border-[#e5e1d8] bg-white shadow-xs">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead className="bg-[#f6f4ec] border-b border-[#e5e1d8] text-[#003527] uppercase tracking-wider font-bold">
                    <tr>
                      {headerRow.map((cell, cIdx) => (
                        <th key={cIdx} className="p-3 sm:p-3.5">
                          {renderInlineMarkdown(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2efe9]">
                    {bodyRows.map((rCols, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#fbfaf6] transition-colors">
                        {rCols.map((cVal, cIdx) => (
                          <td key={cIdx} className="p-3 sm:p-3.5 text-[#4a5c53]">
                            {renderInlineMarkdown(cVal)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // 3. Headings
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^###\s+/, '');
          const id = slugifyHeading(headingText);
          return (
            <h3
              key={`h3-${bIdx}`}
              id={id}
              className={`${isStandalonePage ? 'text-xl sm:text-2xl font-bold mt-8 mb-3' : 'text-sm font-bold mt-3 mb-1.5'} text-[#1c2826] scroll-mt-20`}
            >
              {renderInlineMarkdown(headingText)}
            </h3>
          );
        }

        if (trimmed.startsWith('## ')) {
          const headingText = trimmed.replace(/^##\s+/, '');
          const id = slugifyHeading(headingText);
          return (
            <h2
              key={`h2-${bIdx}`}
              id={id}
              className={`${isStandalonePage ? 'text-2xl sm:text-3xl font-extrabold mt-10 mb-4 pb-2 border-b border-[#e5e1d8]' : 'text-base font-bold mt-4 mb-2 pb-1 border-b border-[#f2efe9]'} text-[#003527] scroll-mt-20 flex items-center justify-between`}
            >
              <span>{renderInlineMarkdown(headingText)}</span>
            </h2>
          );
        }

        if (trimmed.startsWith('# ')) {
          const headingText = trimmed.replace(/^#\s+/, '');
          return (
            <h2
              key={`h1-alt-${bIdx}`}
              className="text-2xl font-extrabold text-[#003527] mt-8 mb-3"
            >
              {renderInlineMarkdown(headingText)}
            </h2>
          );
        }

        // 4. Numbered Lists (1. Item, 2. Item)
        if (/^\d+\.\s+/.test(trimmed)) {
          const lines = trimmed.split('\n');
          return (
            <ol key={`ol-${bIdx}`} className="space-y-2 pl-5 list-decimal marker:text-[#005039] marker:font-bold">
              {lines.map((l, lIdx) => (
                <li key={lIdx} className="pl-1">
                  {renderInlineMarkdown(l.replace(/^\d+\.\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // 5. Bullet Lists (- Item, * Item)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const lines = trimmed.split('\n');
          return (
            <ul key={`ul-${bIdx}`} className="space-y-2 pl-2">
              {lines.map((l, lIdx) => (
                <li key={lIdx} className="flex items-start gap-2.5">
                  <span className="text-[#005039] font-bold text-base leading-none mt-1 shrink-0">•</span>
                  <span>{renderInlineMarkdown(l.replace(/^[-*]\s+/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }

        // 6. Regular Paragraph
        return (
          <p key={`p-${bIdx}`} className="leading-relaxed">
            {renderInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
