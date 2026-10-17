import React from 'react';
import {
  type ListItemNode,
  type MarkdownBlock,
  parseMarkdownToBlocks,
  extractDocumentTitle,
} from './markdownParser';

export {
  type ListItemNode,
  type MarkdownBlock,
  parseMarkdownToBlocks,
  extractDocumentTitle,
};

/* ==========================================================================
   1. INLINE TOKEN RENDERER
   ========================================================================== */
export function renderInlineTokens(text: string): React.ReactNode[] {
  const tokenRegex =
    /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 text-[0.88em] font-mono border border-[#111111] bg-[#FAFAFA] rounded-none"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      return (
        <strong key={index} className="font-bold italic text-[#111111]">
          {part.slice(3, -3)}
        </strong>
      );
    }

    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-[#111111]">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
      return (
        <del key={index} className="line-through text-[#555555]">
          {part.slice(2, -2)}
        </del>
      );
    }

    const inlineImgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (inlineImgMatch) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          src={inlineImgMatch[2]}
          alt={inlineImgMatch[1]}
          className="inline-block max-h-48 border border-[#111111] my-1"
        />
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-[#111111] decoration-1 underline-offset-2 font-medium"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/* ==========================================================================
   2. MULTI-LANGUAGE MONOCHROME SYNTAX HIGHLIGHTER
   Supports TypeScript/JS, Python, Rust, Go, SQL, Shell/Bash, JSON
   ========================================================================== */
export function highlightMonochromeCode(code: string): React.ReactNode[] {
  const lines = code.split('\n');
  const keywordRegex =
    /\b(import|export|from|const|let|var|function|return|interface|type|if|else|elif|for|while|new|class|extends|implements|true|false|null|undefined|async|await|def|except|try|finally|with|as|lambda|yield|pass|None|True|False|self|fn|pub|mut|impl|struct|enum|match|use|crate|func|package|defer|go|chan|SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|GROUP|BY|ORDER|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|LIMIT|AS|AND|OR|NOT|NULL)\b/g;

  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    // Full-line comments (//, #, --, /*, *)
    if (
      trimmed.startsWith('//') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('--') ||
      trimmed.startsWith('/*') ||
      trimmed.startsWith('*')
    ) {
      return (
        <div key={lineIdx} className="italic text-[#555555]">
          {line || ' '}
        </div>
      );
    }

    // Decorators (@...)
    if (trimmed.startsWith('@')) {
      return (
        <div key={lineIdx} className="font-semibold italic text-[#111111]">
          {line}
        </div>
      );
    }

    const segments = line.split(/('[^']*'|`[^`]*`|"[^"]*")/g);

    return (
      <div key={lineIdx}>
        {segments.map((segment, segIdx) => {
          if (
            (segment.startsWith("'") && segment.endsWith("'")) ||
            (segment.startsWith('"') && segment.endsWith('"')) ||
            (segment.startsWith('`') && segment.endsWith('`'))
          ) {
            return (
              <span
                key={segIdx}
                className="underline decoration-dotted decoration-[#555555] underline-offset-2"
              >
                {segment}
              </span>
            );
          }

          const subParts = segment.split(keywordRegex);
          return (
            <React.Fragment key={segIdx}>
              {subParts.map((sub, subIdx) => {
                if (keywordRegex.test(sub)) {
                  keywordRegex.lastIndex = 0;
                  return (
                    <strong key={subIdx} className="font-bold text-[#111111]">
                      {sub}
                    </strong>
                  );
                }
                keywordRegex.lastIndex = 0;
                return <React.Fragment key={subIdx}>{sub}</React.Fragment>;
              })}
            </React.Fragment>
          );
        })}
      </div>
    );
  });
}

/* ==========================================================================
   3. RECURSIVE LIST NODE RENDERER (SUPPORTS NESTING + TASK CHECKBOXES)
   ========================================================================== */
export function renderListNodes(
  items: ListItemNode[],
  ordered: boolean
): React.ReactNode {
  const ListTag = ordered ? 'ol' : 'ul';
  const listStyleClass = ordered ? 'list-decimal' : 'list-disc';

  return (
    <ListTag className={listStyleClass}>
      {items.map((item, idx) => {
        const isTask = item.checked !== undefined;
        return (
          <li
            key={idx}
            className={isTask ? 'list-none -ml-4 flex flex-col gap-1' : ''}
          >
            <div className={isTask ? 'flex items-start gap-2' : ''}>
              {isTask && (
                <span
                  aria-hidden="true"
                  className={`inline-flex items-center justify-center w-3.5 h-3.5 mt-1 shrink-0 border-[1.5px] border-[#111111] font-mono text-[8pt] font-bold leading-none ${
                    item.checked
                      ? 'bg-[#E6FF00] text-[#111111]'
                      : 'bg-[#FFFFFF] text-transparent'
                  }`}
                >
                  {item.checked ? '✓' : '.'}
                </span>
              )}
              <span
                className={
                  item.checked ? 'line-through text-[#555555]' : 'text-[#111111]'
                }
              >
                {renderInlineTokens(item.text)}
              </span>
            </div>
            {item.children.length > 0 &&
              renderListNodes(item.children, Boolean(item.orderedChildren))}
          </li>
        );
      })}
    </ListTag>
  );
}
