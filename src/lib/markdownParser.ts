/* ==========================================================================
   1. AST TYPES FOR EDITORIAL MARKDOWN COMPILER
   ========================================================================== */
export interface ListItemNode {
  text: string;
  checked?: boolean; // undefined = normal bullet, true = [x], false = [ ]
  children: ListItemNode[];
  orderedChildren?: boolean;
}

export type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'blockquote'; lines: string[] }
  | { type: 'list'; ordered: boolean; items: ListItemNode[] }
  | { type: 'code'; language: string; code: string }
  | {
      type: 'table';
      headers: string[];
      alignments: Array<'left' | 'center' | 'right'>;
      rows: string[][];
    }
  | { type: 'image'; alt: string; src: string }
  | { type: 'hr' };

/* ==========================================================================
   2. TABLE & LIST PARSING HELPERS
   ========================================================================== */
function parseTableCells(rowLine: string): string[] {
  const trimmed = rowLine.trim();
  const withoutOuterPipes = trimmed.replace(/^\|/, '').replace(/\|$/, '');
  return withoutOuterPipes.split('|').map((cell) => cell.trim());
}

function isTableSeparatorLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) return false;
  const cells = parseTableCells(trimmed);
  if (cells.length === 0) return false;
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseAlignments(
  separatorLine: string
): Array<'left' | 'center' | 'right'> {
  return parseTableCells(separatorLine).map((cell) => {
    if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
    if (cell.endsWith(':')) return 'right';
    return 'left';
  });
}

function getIndentWidth(rawLine: string): number {
  let count = 0;
  for (let i = 0; i < rawLine.length; i += 1) {
    if (rawLine[i] === ' ') count += 1;
    else if (rawLine[i] === '\t') count += 2;
    else break;
  }
  return count;
}

function isListLine(trimmed: string): boolean {
  return /^[-*+]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed);
}

function parseListMarker(trimmed: string): {
  ordered: boolean;
  checked?: boolean;
  content: string;
} {
  const isOrdered = /^\d+\.\s+/.test(trimmed);
  const withoutMarker = isOrdered
    ? trimmed.replace(/^\d+\.\s+/, '')
    : trimmed.replace(/^[-*+]\s+/, '');

  const taskMatch = withoutMarker.match(/^\[([ xX])\]\s+(.*)$/);
  if (taskMatch) {
    const isChecked = taskMatch[1].toLowerCase() === 'x';
    return {
      ordered: isOrdered,
      checked: isChecked,
      content: taskMatch[2],
    };
  }

  return {
    ordered: isOrdered,
    content: withoutMarker,
  };
}

/**
 * Parses consecutive list lines into a hierarchical tree (up to 3 levels)
 */
function parseListBlock(
  lines: string[],
  startIndex: number
): { block: MarkdownBlock; nextIndex: number } {
  const rootItems: ListItemNode[] = [];
  let i = startIndex;
  const firstTrimmed = lines[i].trim();
  const rootOrdered = /^\d+\.\s+/.test(firstTrimmed);
  const baseIndent = getIndentWidth(lines[i]);

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (trimmed === '' || !isListLine(trimmed)) {
      break;
    }

    const indent = Math.max(0, getIndentWidth(rawLine) - baseIndent);
    const parsed = parseListMarker(trimmed);
    const newNode: ListItemNode = {
      text: parsed.content,
      checked: parsed.checked,
      children: [],
    };

    if (indent < 2 || rootItems.length === 0) {
      rootItems.push(newNode);
    } else {
      const parentLevel1 = rootItems[rootItems.length - 1];
      if (indent < 4 || parentLevel1.children.length === 0) {
        if (parentLevel1.orderedChildren === undefined) {
          parentLevel1.orderedChildren = parsed.ordered;
        }
        parentLevel1.children.push(newNode);
      } else {
        const parentLevel2 =
          parentLevel1.children[parentLevel1.children.length - 1];
        if (parentLevel2.orderedChildren === undefined) {
          parentLevel2.orderedChildren = parsed.ordered;
        }
        parentLevel2.children.push(newNode);
      }
    }

    i += 1;
  }

  return {
    block: {
      type: 'list',
      ordered: rootOrdered,
      items: rootItems,
    },
    nextIndex: i,
  };
}

/* ==========================================================================
   3. BLOCK-LEVEL MARKDOWN AST COMPILER
   ========================================================================== */
export function parseMarkdownToBlocks(markdown: string): MarkdownBlock[] {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Blank line
    if (trimmed === '') {
      i += 1;
      continue;
    }

    // 2. Fenced Code Block (```)
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim() || 'plaintext';
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i += 1;
      }
      blocks.push({
        type: 'code',
        language,
        code: codeLines.join('\n'),
      });
      continue;
    }

    // 3. Horizontal Rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    // 4. Headings (H1 - H6)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      blocks.push({
        type: 'heading',
        level,
        text: headingMatch[2].trim(),
      });
      i += 1;
      continue;
    }

    // 5. Standalone Image Figure ![alt](src)
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      blocks.push({
        type: 'image',
        alt: imageMatch[1].trim(),
        src: imageMatch[2].trim(),
      });
      i += 1;
      continue;
    }

    // 6. Table Block
    if (
      trimmed.includes('|') &&
      i + 1 < lines.length &&
      isTableSeparatorLine(lines[i + 1])
    ) {
      const headers = parseTableCells(trimmed);
      const alignments = parseAlignments(lines[i + 1]);
      i += 2;
      const rows: string[][] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== '' &&
        lines[i].trim().includes('|')
      ) {
        rows.push(parseTableCells(lines[i]));
        i += 1;
      }
      blocks.push({
        type: 'table',
        headers,
        alignments,
        rows,
      });
      continue;
    }

    // 7. Blockquote (>)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push({ type: 'blockquote', lines: quoteLines });
      continue;
    }

    // 8. Lists (Unordered, Ordered, Nested, and Task Lists)
    if (isListLine(trimmed)) {
      const { block, nextIndex } = parseListBlock(lines, i);
      blocks.push(block);
      i = nextIndex;
      continue;
    }

    // 9. Standard Paragraph (merge consecutive plain lines)
    const paraLines: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const nextTrimmed = lines[i].trim();
      if (
        nextTrimmed === '' ||
        /^#{1,6}\s+/.test(nextTrimmed) ||
        nextTrimmed.startsWith('```') ||
        nextTrimmed.startsWith('>') ||
        isListLine(nextTrimmed) ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(nextTrimmed) ||
        /^!\[([^\]]*)\]\(([^)]+)\)$/.test(nextTrimmed) ||
        (nextTrimmed.includes('|') &&
          i + 1 < lines.length &&
          isTableSeparatorLine(lines[i + 1]))
      ) {
        break;
      }
      paraLines.push(nextTrimmed);
      i += 1;
    }
    blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
  }

  return blocks;
}

/**
 * Extracts the primary document title from the parsed blocks for PDF filename optimization
 */
export function extractDocumentTitle(
  blocks: MarkdownBlock[],
  fallbackCode: string
): string {
  const h1 = blocks.find(
    (b): b is Extract<MarkdownBlock, { type: 'heading' }> =>
      b.type === 'heading' && b.level === 1
  );
  if (h1 && h1.text.trim()) {
    return h1.text.replace(/[*`~]/g, '').trim();
  }
  const anyHeading = blocks.find(
    (b): b is Extract<MarkdownBlock, { type: 'heading' }> =>
      b.type === 'heading'
  );
  if (anyHeading && anyHeading.text.trim()) {
    return anyHeading.text.replace(/[*`~]/g, '').trim();
  }
  return fallbackCode.trim() || 'md2pdf-document';
}
