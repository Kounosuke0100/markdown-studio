import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseMarkdownToBlocks,
  extractDocumentTitle,
} from '../markdownParser.ts';

describe('md2pdf Markdown AST Compiler (markdownParser)', () => {
  it('parses headings h1 through h6 accurately', () => {
    const md = [
      '# 見出し1',
      '## 見出し2',
      '### 見出し3',
      '#### 見出し4',
      '##### 見出し5',
      '###### 見出し6',
    ].join('\n');

    const blocks = parseMarkdownToBlocks(md);
    assert.equal(blocks.length, 6);
    blocks.forEach((b, idx) => {
      assert.equal(b.type, 'heading');
      if (b.type === 'heading') {
        assert.equal(b.level, idx + 1);
        assert.equal(b.text, `見出し${idx + 1}`);
      }
    });
  });

  it('parses nested lists (up to 3 levels) and GFM task list checkboxes', () => {
    const md = [
      '- [x] 完了したタスク',
      '  - ネストされた第2階層アイテム',
      '    1. ネストされた第3階層番号リスト',
      '- [ ] 未完了のタスク',
    ].join('\n');

    const blocks = parseMarkdownToBlocks(md);
    assert.equal(blocks.length, 1);
    const listBlock = blocks[0];
    assert.equal(listBlock.type, 'list');

    if (listBlock.type === 'list') {
      assert.equal(listBlock.ordered, false);
      assert.equal(listBlock.items.length, 2);

      const firstItem = listBlock.items[0];
      assert.equal(firstItem.text, '完了したタスク');
      assert.equal(firstItem.checked, true);
      assert.equal(firstItem.children.length, 1);

      const secondLevel = firstItem.children[0];
      assert.equal(secondLevel.text, 'ネストされた第2階層アイテム');
      assert.equal(secondLevel.orderedChildren, true);
      assert.equal(secondLevel.children.length, 1);

      const thirdLevel = secondLevel.children[0];
      assert.equal(thirdLevel.text, 'ネストされた第3階層番号リスト');

      const secondRootItem = listBlock.items[1];
      assert.equal(secondRootItem.text, '未完了のタスク');
      assert.equal(secondRootItem.checked, false);
    }
  });

  it('parses GFM tables with column alignments (left, center, right)', () => {
    const md = [
      '| 左揃え | 中央揃え | 右揃え |',
      '| :--- | :---: | ---: |',
      '| A1 | B1 | 1,200 |',
      '| A2 | B2 | 3,400 |',
    ].join('\n');

    const blocks = parseMarkdownToBlocks(md);
    assert.equal(blocks.length, 1);
    const table = blocks[0];
    assert.equal(table.type, 'table');

    if (table.type === 'table') {
      assert.deepEqual(table.headers, ['左揃え', '中央揃え', '右揃え']);
      assert.deepEqual(table.alignments, ['left', 'center', 'right']);
      assert.equal(table.rows.length, 2);
      assert.deepEqual(table.rows[0], ['A1', 'B1', '1,200']);
      assert.deepEqual(table.rows[1], ['A2', 'B2', '3,400']);
    }
  });

  it('handles fenced code blocks including unclosed code fences gracefully', () => {
    const md = [
      '```typescript',
      'const paper = "A4";',
      'export default paper;',
    ].join('\n');

    const blocks = parseMarkdownToBlocks(md);
    assert.equal(blocks.length, 1);
    const codeBlock = blocks[0];
    assert.equal(codeBlock.type, 'code');
    if (codeBlock.type === 'code') {
      assert.equal(codeBlock.language, 'typescript');
      assert.equal(codeBlock.code, 'const paper = "A4";\nexport default paper;');
    }
  });

  it('parses blockquotes, standalone image figures, and horizontal rules', () => {
    const md = [
      '> 引用の1行目',
      '> 引用の2行目',
      '',
      '---',
      '',
      '![組版ダイアグラム](https://example.com/diagram.svg)',
    ].join('\n');

    const blocks = parseMarkdownToBlocks(md);
    assert.equal(blocks.length, 3);
    assert.equal(blocks[0].type, 'blockquote');
    assert.equal(blocks[1].type, 'hr');
    assert.equal(blocks[2].type, 'image');
    if (blocks[2].type === 'image') {
      assert.equal(blocks[2].alt, '組版ダイアグラム');
      assert.equal(blocks[2].src, 'https://example.com/diagram.svg');
    }
  });

  it('extracts document title prioritizing H1 over H2 and fallback code', () => {
    const mdWithH1 = '## サブタイトル\n# メイン原稿タイトル\n本文テキスト';
    const blocksWithH1 = parseMarkdownToBlocks(mdWithH1);
    assert.equal(
      extractDocumentTitle(blocksWithH1, 'DOC-01'),
      'メイン原稿タイトル'
    );

    const mdWithoutH1 = '### セクション見出しのみ\n本文テキスト';
    const blocksWithoutH1 = parseMarkdownToBlocks(mdWithoutH1);
    assert.equal(
      extractDocumentTitle(blocksWithoutH1, 'DOC-01'),
      'セクション見出しのみ'
    );

    const mdPlain = '見出しのないプレーンな段落テキスト';
    const blocksPlain = parseMarkdownToBlocks(mdPlain);
    assert.equal(extractDocumentTitle(blocksPlain, 'DOC-A4-99'), 'DOC-A4-99');
  });
});
