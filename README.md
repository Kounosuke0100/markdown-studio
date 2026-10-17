# md2pdf — Typeset Studio

> **思考の断片を、デザイナーが組版したような美しい紙面へ。**

`md2pdf` は、AI（ChatGPT / Claude / Gemini 等）が出力したMarkdownテキストを、**プロフェッショナルな印刷品質のA4ベクターPDF**へとクライアントサイドのみで瞬時に組版・コンパイルするWebアプリケーションです。

---

## 1. デザインフィロソフィー（4原則）

1. **Straight（迷いのないストレートな操作導線）**
   - 「01 ペースト → 02 組版確認 → 03 PDF書き出し」が視線の迷いなく1画面・1直線で完結する2ペイン・スプリット構造。
2. **Minimal（無駄を極限まで削ぎ落としたミニマリズム）**
   - 過剰な装飾を排し、A4用紙（`210mm × 297mm`）の白銀比余白と計算されたタイポグラフィのジャンプ率・文字詰め（`font-feature-settings: "palt" 1, "kern" 1`）のみで知性と信頼感を表現。
3. **Contrast（白黒を基調としたソリッドなコントラスト）**
   - ピュアホワイト（`#FFFFFF`）、オフホワイト（`#FAFAFA`）、ジェットブラック（`#111111`）のモノトーンに、極細ソリッド枠線（`1.5px〜2px solid #111111`）とオフセットシャドウ（`shadow-[4px_4px_0px_0px_#111111]`）を採用。
   - インタラクティブな強調箇所にのみアシッドイエロー（`#E6FF00`）を1色だけ効果的に配置。
4. **Playful（知的でユーモアのある「あそび心」）**
   - 均一な太線で描かれたオリジナルモノライン線画SVGイラスト4種（Empty State、コンパイル中、完了、FINE PRESS検印スタンプ）と、組版の豆知識を語る「Small Talk」バーを内蔵。

---

## 2. 主な機能とアーキテクチャ

- **完全クライアントサイド完結（プライバシーファースト）**：入力されたMarkdownは一切サーバーへ送信されず、ブラウザのメモリ空間と印刷パイプラインのみで処理されます。
- **2つの組版テーマ切り替え**
  - `Monochrome Sans`：`Inter` + `Noto Sans JP` による現代的でソリッドなゴシック組版
  - `Minimal Editorial`：`Newsreader` + `Shippori Mincho（しっぽり明朝）` による知的で情緒的な明朝組版
- **高度なMarkdown ASTコンパイラ**
  - 見出し（`h1`〜`h6`）、段落、最大3階層のネストされた箇条書き・番号付きリスト、GFMタスクリスト（`- [ ]` / `- [x]`）、引用（`blockquote`）、表組み（`table` の列アライメント対応）、図版（`![alt](src)`）、および多言語対応のモノクローム構文ハイライト（`JetBrains Mono`）。
- **プロフェッショナル印刷・PDF出力制御（`@page` / `@media print`）**
  - 見出し直後の改ページ防止（`break-after: avoid-page`）、表・コード・引用・図版の分断防止（`break-inside: avoid`）、孤行・端数行制御（`orphans: 3`, `widows: 3`）、背景色・スタンプの厳密出力（`print-color-adjust: exact`）。
  - 先頭 `# H1` 見出しから推奨PDFファイル名を自動抽出し、`document.title` にリアルタイム同期。
- **快適なエディタUX**
  - `localStorage` による原稿・テーマ設定の自動保存と復元
  - `.md` / `.txt` ファイルのドラッグ＆ドロップ読み込み・ファイル選択
  - `Cmd/Ctrl + Enter` ショートカットによる即時PDFコンパイル

---

## 3. ディレクトリ構成

```text
.
├── src/
│   ├── app/
│   │   ├── globals.css                 # デザイントークン・組版スケール・@media print / @page
│   │   ├── icon.svg                    # モノライン＋アシッドイエローのベクターファビコン
│   │   ├── layout.tsx                  # Next.js App Router ルートレイアウト (next/font/google)
│   │   └── page.tsx                    # 2ペインUI・ファイルD&D・自動保存・印刷モーダル制御
│   ├── components/
│   │   └── MonolineIllustrations.tsx   # オリジナルモノライン線画SVGイラスト全4種
│   └── lib/
│       ├── markdownParser.ts           # 純粋TypeScriptによるMarkdownブロックASTパーサー
│       ├── markdownCompiler.tsx        # インライントークン・多言語コード強調・階層リスト描画
│       └── __tests__/
│           └── markdownParser.test.ts  # ASTパーサー＆タイトル抽出の単体テストスイート
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

---

## 4. セットアップとコマンド

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動 (http://localhost:3000)
npm run dev

# 単体テストの実行 (Node.js native test runner)
npm test

# 本番用ビルドの生成・型検証
npm run build

# 本番サーバーの起動
npm start
```
