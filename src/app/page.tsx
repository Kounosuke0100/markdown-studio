'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  EmptyCanvasIllustration,
  CompilingTypesetterIllustration,
  CompletedPressIllustration,
  PlayfulEditorialStamp,
} from '../components/MonolineIllustrations';
import {
  parseMarkdownToBlocks,
  extractDocumentTitle,
  renderInlineTokens,
  highlightMonochromeCode,
  renderListNodes,
} from '../lib/markdownCompiler';

/* ==========================================================================
   1. TYPES & EDITORIAL CONSTANTS
   ========================================================================== */
export type TypographyTheme = 'monochrome-sans' | 'minimal-editorial';

export type CompileStage = 'idle' | 'compiling' | 'completed';

const STORAGE_KEY = 'md2pdf:studio:draft:v1';

interface PersistedDraft {
  markdown: string;
  theme: TypographyTheme;
  showStamp: boolean;
  documentCode: string;
  savedAt: string;
}

interface SmallTalkItem {
  id: string;
  category: string;
  text: string;
}

const SMALL_TALK_ITEMS: SmallTalkItem[] = [
  {
    id: 'a4-silver-ratio',
    category: 'PAPER & RATIO',
    text: 'A4用紙の縦横比（1 : √2）は「白銀比」と呼ばれ、半分に何度折っても美しい相似形が保たれるよう設計されています。',
  },
  {
    id: 'widows-orphans',
    category: 'TYPESETTING',
    text: 'ページの先頭や末尾に1行だけ取り残される行を、欧文組版では「Widow（未亡人）」「Orphan（孤児）」と呼び、丁寧な組版では自動で回避します。',
  },
  {
    id: 'margins-breathing',
    category: 'WHITESPACE',
    text: '紙面の余白（マージン）は単なる「空き地」ではなく、読者の視線がひと休みし、文字の輪郭を際立たせるための呼吸空間です。',
  },
  {
    id: 'privacy-first',
    category: 'PRIVACY FIRST',
    text: 'ここに貼り付けたテキストはどこにも送信されません。あなたのブラウザの中だけで、静かにインクが乗せられます。',
  },
  {
    id: 'optical-kerning',
    category: 'TYPOGRAPHY',
    text: '見出しの文字間をほんの少し（-0.02em）引き締めると、黒いインクの塊としての凝集感が生まれ、紙面全体が凛と引き締まります。',
  },
];

const INITIAL_SAMPLE_MARKDOWN = `# 思考の断片を、美しい紙面へ。
## プロダクトデザインおよび組版設計リファレンス

AIが紡ぎ出した構造化テキストを、そのまま共有できる**プロフェッショナルな印刷品質のPDF**へと昇華するための組版ドキュメントです。余白の呼吸とソリッドなコントラストが、読み手の集中力を静かに導きます。

> 「デザインとは、単にどう見えるか、どう感じるかということではない。どう機能するかだ。そして組版とは、思考が迷わず届くための静かな建築である。」

### 1. 組版エンジンの4つの基本原則

- **Straight（一直線の導線）**: ペーストして、佇まいを確かめ、そのまま紙面へ書き出すだけの明快な体験。
  - 視線移動を最小化する2ペイン・スプリット構造
  - ショートカット（\`Cmd/Ctrl + Enter\`）による即時コンパイル
- **Minimal（余白の贅沢）**: 装飾を削ぎ落とし、文字のジャンプ率と行間のリズムだけで知性を表現する。
- **Contrast（白と黒の規律）**: 曖昧なグラデーションを排し、\`#111111\` のインクと \`#FFFFFF\` の紙面で輪郭を際立たせる。
- **Playful（知的なあそび心）**: 張り詰めた紙面に、ひとさじのユーモアと手仕事の温もりを添える。

#### 出稿前組版チェックリスト

- [x] 見出し直後の孤立改ページ防止（\`break-after: avoid-page\`）
- [x] 表組み・コードブロックの途中分断防止（\`break-inside: avoid\`）
- [ ] 最終ページの検印スタンプ（FINE PRESS）の刻印有無を確認

### 2. タイポグラフィとレイアウト仕様の比較

| 要素区分 | Monochrome Sans（モダンゴシック） | Minimal Editorial（知的明朝） | 改ページ保護 |
| :--- | :--- | :--- | :--- |
| 見出し（H1〜H6） | Inter / Noto Sans JP（強コントラスト） | Newsreader / しっぽり明朝 | \`break-after: avoid\` |
| 本文パラグラフ | 10pt / 行送り 1.75 / 両端揃え | 10pt / 行送り 1.85 / 両端揃え | \`orphans: 3 / widows: 3\` |
| コード・表組み | JetBrains Mono / モノクロ構文強調 | JetBrains Mono / 極細罫線 | \`break-inside: avoid\` |

### 3. モノクローム・コードハイライト検証

\`\`\`typescript
interface PrintSpec {
  paperSize: 'A4';
  orientation: 'portrait';
  colorAdjust: 'exact';
  privacyMode: 'client-only';
}

export function compileToPaper(title: string, spec: PrintSpec): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  // ブラウザの印刷パイプラインを通じてベクターPDFを生成
  return \`[\${timestamp}] Ready to press: \${title} (\${spec.paperSize})\`;
}
\`\`\`

1. 左ペインに任意のMarkdownテキストを貼り付けるか、\`.md\` ファイルをドロップします。
2. 上部バーから原稿のトーンに合わせて組版テーマを切り替えます。
3. **「PDFにコンパイルする」**を押し、印刷ダイアログで「PDFに保存」を選ぶだけで完成です。`;

/* ==========================================================================
   2. MAIN APPLICATION COMPONENT (md2pdf)
   ========================================================================== */
export default function Md2PdfStudioPage() {
  const [markdown, setMarkdown] = useState<string>(INITIAL_SAMPLE_MARKDOWN);
  const [theme, setTheme] = useState<TypographyTheme>('monochrome-sans');
  const [showStamp, setShowStamp] = useState<boolean>(true);
  const [documentCode, setDocumentCode] = useState<string>('DOC-A4-01');
  const [smallTalkIndex, setSmallTalkIndex] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [compileStage, setCompileStage] = useState<CompileStage>('idle');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showGentleToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Phase 3-1: Restore draft from localStorage on client mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedDraft>;
        if (typeof parsed.markdown === 'string') {
          setMarkdown(parsed.markdown);
        }
        if (
          parsed.theme === 'monochrome-sans' ||
          parsed.theme === 'minimal-editorial'
        ) {
          setTheme(parsed.theme);
        }
        if (typeof parsed.showStamp === 'boolean') {
          setShowStamp(parsed.showStamp);
        }
        if (typeof parsed.documentCode === 'string') {
          setDocumentCode(parsed.documentCode);
        }
        if (typeof parsed.savedAt === 'string') {
          setLastSavedTime(parsed.savedAt);
        }
      }
    } catch {
      // Ignore storage access errors in private browsing
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Phase 3-1: Auto-save draft changes to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 8);
      const payload: PersistedDraft = {
        markdown,
        theme,
        showStamp,
        documentCode,
        savedAt: timeStr,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastSavedTime(timeStr);
    } catch {
      // Ignore quota or private browsing errors
    }
  }, [markdown, theme, showStamp, documentCode, isHydrated]);

  // Fallback light-dismiss for browsers without native <dialog closedby="any"> support
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (event: MouseEvent) => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;

        if (!isDialogContent) {
          dialog.close();
        }
      }
    };

    const handleDialogClose = () => {
      setCompileStage('idle');
    };

    dialog.addEventListener('click', handleBackdropClick);
    dialog.addEventListener('close', handleDialogClose);
    return () => {
      dialog.removeEventListener('click', handleBackdropClick);
      dialog.removeEventListener('close', handleDialogClose);
    };
  }, []);

  // Parse Markdown blocks in real time
  const blocks = useMemo(() => parseMarkdownToBlocks(markdown), [markdown]);

  // Phase 2-2: Automatically synchronize document.title with H1 for clean PDF filenames
  const extractedTitle = useMemo(
    () => extractDocumentTitle(blocks, documentCode),
    [blocks, documentCode]
  );

  useEffect(() => {
    if (markdown.trim().length > 0) {
      const codeSuffix = documentCode.trim() ? ` [${documentCode.trim()}]` : '';
      document.title = `${extractedTitle}${codeSuffix}`;
    } else {
      document.title = 'md2pdf — 思考の断片を、美しい紙面へ。';
    }
  }, [extractedTitle, documentCode, markdown]);

  // Extract document metrics
  const metrics = useMemo(() => {
    const trimmed = markdown.trim();
    if (!trimmed) {
      return { chars: 0, lines: 0, headings: 0 };
    }
    const chars = trimmed.length;
    const lines = trimmed.split(/\r\n|\r|\n/).length;
    const headings = blocks.filter((b) => b.type === 'heading').length;
    return { chars, lines, headings };
  }, [markdown, blocks]);

  // Trigger PDF Compilation Flow
  const handleCompilePdf = useCallback(() => {
    if (!markdown.trim()) {
      showGentleToast(
        'まだキャンバスが白紙です。まずは原稿をひとこと書いてみませんか？'
      );
      return;
    }

    const dialog = dialogRef.current;
    setCompileStage('compiling');
    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    window.setTimeout(() => {
      window.print();
      setCompileStage('completed');
    }, 650);
  }, [markdown, showGentleToast]);

  // Phase 3-3: Keyboard Shortcut (Cmd/Ctrl + Enter) to trigger PDF compile
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        handleCompilePdf();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCompilePdf]);

  // Handle clipboard one-click paste
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().length > 0) {
        setMarkdown(text);
        showGentleToast('クリップボードから原稿をそっと流し込みました。');
      } else {
        showGentleToast(
          'クリップボードが空のようです。テキストをコピーしてお試しください。'
        );
      }
    } catch {
      textareaRef.current?.focus();
      showGentleToast(
        'エディタにフォーカスしました。Cmd+V / Ctrl+V でそのまま貼り付けられます。'
      );
    }
  };

  // Phase 3-2: Read local .md / .txt file helper
  const loadManuscriptFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setMarkdown(content);
          const cleanName = file.name.replace(/\.(md|markdown|txt)$/i, '');
          if (cleanName) {
            setDocumentCode(cleanName.slice(0, 28).toUpperCase());
          }
          showGentleToast(`「${file.name}」を紙面へ読み込みました。`);
        }
      };
      reader.onerror = () => {
        showGentleToast(
          'ファイルの読み込みに失敗しました。テキスト形式のファイルでお試しください。'
        );
      };
      reader.readAsText(file, 'utf-8');
    },
    [showGentleToast]
  );

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      loadManuscriptFile(file);
      event.target.value = '';
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDraggingFile) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFile(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      loadManuscriptFile(file);
    }
  };

  // Handle clearing canvas
  const handleClearCanvas = () => {
    setMarkdown('');
    showGentleToast('紙面をまっさらな白紙に戻しました。');
  };

  // Handle loading sample AI markdown
  const handleLoadSample = () => {
    setMarkdown(INITIAL_SAMPLE_MARKDOWN);
    setDocumentCode('DOC-A4-01');
    showGentleToast('サンプルの組版原稿をセットしました。');
  };

  // Handle rotating Small Talk
  const handleNextSmallTalk = () => {
    setSmallTalkIndex((prev) => (prev + 1) % SMALL_TALK_ITEMS.length);
  };

  const currentSmallTalk = SMALL_TALK_ITEMS[smallTalkIndex];
  const isEmpty = markdown.trim().length === 0;

  return (
    <div className="print-root min-h-screen flex flex-col bg-[#FAFAFA] text-[#111111]">
      {/* ====================================================================
          TOP NAVIGATION & STRAIGHT ACTION BAR (.no-print)
          ==================================================================== */}
      <header className="no-print sticky top-0 z-30 bg-[#FFFFFF] border-b-2 border-[#111111] px-4 sm:px-8 py-3.5">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#111111] text-[#FFFFFF] border-2 border-[#111111] flex items-center justify-center font-mono font-bold text-sm tracking-tighter shadow-[2px_2px_0px_0px_#E6FF00]">
              M↓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight leading-none">
                  md2pdf
                </span>
                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#E6FF00] border border-[#111111]">
                  Typeset Studio
                </span>
              </div>
              <p className="text-xs text-[#555555] mt-0.5">
                思考の断片を、デザイナーが組版したような美しい紙面へ。
              </p>
            </div>
          </div>

          {/* Straight 3-Step Flow Indicator (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono border-[1.5px] border-[#111111] bg-[#FAFAFA] px-3.5 py-1.5">
            <span className="font-bold">01 ペースト</span>
            <span aria-hidden="true">→</span>
            <span className="font-bold">02 組版確認</span>
            <span aria-hidden="true">→</span>
            <span className="font-bold bg-[#E6FF00] px-1.5 py-0.5 border border-[#111111]">
              03 PDF書き出し
            </span>
          </div>

          {/* Right Controls: Theme Switcher + Stamp Toggle + Primary Compile Button */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Switcher */}
            <div
              role="group"
              aria-label="組版テーマの切り替え"
              className="inline-flex border-2 border-[#111111] bg-[#FFFFFF] shadow-[3px_3px_0px_0px_#111111]"
            >
              <button
                type="button"
                onClick={() => setTheme('monochrome-sans')}
                className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                  theme === 'monochrome-sans'
                    ? 'bg-[#E6FF00] text-[#111111]'
                    : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#FAFAFA]'
                }`}
              >
                Monochrome Sans
              </button>
              <button
                type="button"
                onClick={() => setTheme('minimal-editorial')}
                className={`px-3 py-1.5 text-xs font-bold border-l-2 border-[#111111] transition-colors ${
                  theme === 'minimal-editorial'
                    ? 'bg-[#E6FF00] text-[#111111]'
                    : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#FAFAFA]'
                }`}
              >
                Minimal Editorial
              </button>
            </div>

            {/* Playful Stamp Toggle */}
            <button
              type="button"
              onClick={() => setShowStamp((prev) => !prev)}
              aria-pressed={showStamp}
              className={`px-3 py-1.5 text-xs font-bold border-2 border-[#111111] transition-transform active:translate-x-[1px] active:translate-y-[1px] ${
                showStamp
                  ? 'bg-[#111111] text-[#FFFFFF] shadow-[3px_3px_0px_0px_#E6FF00]'
                  : 'bg-[#FFFFFF] text-[#111111] shadow-[3px_3px_0px_0px_#111111]'
              }`}
            >
              {showStamp ? '★ 検印スタンプ ON' : '☆ 検印スタンプ OFF'}
            </button>

            {/* Primary Compile Action Button */}
            <button
              type="button"
              onClick={handleCompilePdf}
              title="ショートカット: Cmd/Ctrl + Enter"
              className="px-4 py-2 text-xs sm:text-sm font-extrabold bg-[#E6FF00] text-[#111111] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#111111] transition-all flex items-center gap-2"
            >
              <span>PDFにコンパイルする</span>
              <span className="font-mono text-[11px] border border-[#111111] bg-[#FFFFFF] px-1.5 py-0.5">
                ⌘↵
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Gentle Floating Microcopy Toast (.no-print) */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-6 right-6 z-40 bg-[#111111] text-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#E6FF00] px-4 py-2.5 text-xs font-medium flex items-center gap-2.5"
        >
          <span className="inline-block w-2 h-2 bg-[#E6FF00]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================
          MAIN 2-PANE DESIGNER WORKSPACE
          ==================================================================== */}
      <main className="print-workspace flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8">
        {/* ------------------------------------------------------------------
            LEFT PANE: MARKDOWN EDITOR, DRAG&DROP, EMPTY STATE & SMALL TALK
            ------------------------------------------------------------------ */}
        <section
          aria-label="Markdown原稿エディタ"
          className="no-print lg:col-span-5 flex flex-col gap-4"
        >
          {/* Hidden File Input for .md / .txt Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Editor Frame */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative flex-1 flex flex-col bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] min-h-[540px]"
          >
            {/* Drag & Drop Active Overlay */}
            {isDraggingFile && (
              <div className="pointer-events-none absolute inset-0 z-20 bg-[#E6FF00]/90 border-2 border-dashed border-[#111111] flex flex-col items-center justify-center p-6 text-center">
                <p className="font-mono text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 bg-[#FFFFFF] border border-[#111111] mb-2">
                  DROP MANUSCRIPT HERE
                </p>
                <p className="text-base font-extrabold text-[#111111]">
                  原稿ファイル（.md / .txt）をここにドロップして流し込む
                </p>
              </div>
            )}

            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b-2 border-[#111111] bg-[#FAFAFA]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#111111] inline-block" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider">
                  01 / Markdown Manuscript
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-2.5 py-1 text-xs font-bold bg-[#FFFFFF] border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:bg-[#E6FF00] active:translate-x-[1px] active:translate-y-[1px] transition-colors"
                >
                  クリップボード貼付
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-bold bg-[#FFFFFF] border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:bg-[#E6FF00] active:translate-x-[1px] active:translate-y-[1px] transition-colors"
                >
                  ファイル読込
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-2.5 py-1 text-xs font-bold bg-[#FFFFFF] border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:bg-[#FAFAFA] active:translate-x-[1px] active:translate-y-[1px] transition-colors"
                >
                  サンプル原稿
                </button>
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="px-2.5 py-1 text-xs font-bold bg-[#FFFFFF] text-[#555555] border-[1.5px] border-[#111111] hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors"
                >
                  白紙に戻す
                </button>
              </div>
            </div>

            {/* Document Code / Header Meta Input & PDF Filename Preview */}
            <div className="px-4 py-2 border-b-[1.5px] border-[#111111] bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="doc-code-input"
                  className="font-mono text-[#555555] shrink-0"
                >
                  紙面ヘッダー刻印:
                </label>
                <input
                  id="doc-code-input"
                  type="text"
                  value={documentCode}
                  onChange={(e) => setDocumentCode(e.target.value)}
                  maxLength={28}
                  placeholder="DOC-A4-01"
                  className="w-36 font-mono font-bold bg-[#FAFAFA] focus:outline-none px-2 py-0.5 border border-[#111111]"
                />
              </div>
              <div
                className="font-mono text-[11px] text-[#555555] truncate max-w-[240px]"
                title={`保存時の推奨PDF名: ${extractedTitle}.pdf`}
              >
                出力名: <strong className="text-[#111111]">{extractedTitle}.pdf</strong>
              </div>
            </div>

            {/* Textarea + Interactive Empty State Overlay */}
            <div className="relative flex-1 flex flex-col">
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="ここにAIが出力したMarkdownテキストを貼り付けるか、.mdファイルをドロップしてください..."
                aria-label="Markdown入力エリア"
                className="w-full flex-1 p-5 font-mono text-sm leading-relaxed bg-transparent text-[#111111] placeholder:text-[#555555]/50 resize-none focus:outline-none min-h-[420px]"
              />

              {isEmpty && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#FFFFFF]/95">
                  <EmptyCanvasIllustration className="w-40 h-40 mb-2" />
                  <p className="text-sm font-bold text-[#111111]">
                    まっさらなキャンバスです。
                  </p>
                  <p className="text-xs text-[#555555] max-w-xs mt-1 leading-relaxed">
                    AIが紡いだMarkdownテキストをここにそっと置くか、.mdファイルをドロップしてみてください。すぐ隣で美しい紙面に生まれ変わります。
                  </p>
                  <div className="pointer-events-auto mt-4 flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="px-3.5 py-1.5 text-xs font-extrabold bg-[#E6FF00] border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
                    >
                      クリップボードから貼り付ける
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 text-xs font-bold bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] hover:bg-[#FAFAFA]"
                    >
                      .md ファイルを選ぶ
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="px-3.5 py-1.5 text-xs font-bold bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] hover:bg-[#FAFAFA]"
                    >
                      サンプル原稿を試す
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Footer inside Editor */}
            <div className="px-4 py-2.5 border-t-2 border-[#111111] bg-[#FAFAFA] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#555555]">
              <div className="flex items-center gap-3">
                <span>文字数: {metrics.chars.toLocaleString()}</span>
                <span>行数: {metrics.lines.toLocaleString()}</span>
                <span>見出し数: {metrics.headings}</span>
              </div>
              <div className="flex items-center gap-2 text-[#111111] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#111111] inline-block" />
                <span>
                  ローカル自動保存済{lastSavedTime ? ` (${lastSavedTime})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Built-in "Small Talk" (組版の豆知識) Bar */}
          <aside
            aria-label="Small Talk 組版の豆知識"
            className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] p-4 flex items-start justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-extrabold bg-[#E6FF00] border border-[#111111]">
                  SMALL TALK
                </span>
                <span className="text-[11px] font-mono font-bold text-[#555555]">
                  {currentSmallTalk.category}
                </span>
              </div>
              <p className="text-xs text-[#111111] leading-relaxed pt-0.5">
                {currentSmallTalk.text}
              </p>
            </div>
            <button
              type="button"
              onClick={handleNextSmallTalk}
              title="別の豆知識を読む"
              className="shrink-0 px-2.5 py-1.5 text-xs font-mono font-bold bg-[#FAFAFA] border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:bg-[#E6FF00] active:translate-x-[1px] active:translate-y-[1px] transition-colors"
            >
              次へ →
            </button>
          </aside>
        </section>

        {/* ------------------------------------------------------------------
            RIGHT PANE: REAL-TIME A4 TYPESETTING PREVIEW
            ------------------------------------------------------------------ */}
        <section
          aria-label="A4紙面リアルタイムプレビュー"
          className="print-pane-right lg:col-span-7 flex flex-col"
        >
          {/* Preview Bar Header (.no-print) */}
          <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#111111] inline-block" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider">
                02 / Live A4 Sheet Preview (210mm × 297mm)
              </h2>
            </div>
            <div className="text-xs font-mono text-[#555555]">
              Theme:{' '}
              <strong className="text-[#111111]">
                {theme === 'monochrome-sans'
                  ? 'Monochrome Sans (モダンゴシック)'
                  : 'Minimal Editorial (知的明朝)'}
              </strong>
            </div>
          </div>

          {/* Scrollable A4 Desk Viewport */}
          <div className="print-canvas-scroller flex-1 bg-[#FFFFFF]/60 border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] p-4 sm:p-8 overflow-x-auto flex justify-center items-start">
            {/* THE A4 SHEET */}
            <article
              className={`a4-preview-sheet md2pdf-prose ${
                theme === 'monochrome-sans'
                  ? 'theme-monochrome-sans'
                  : 'theme-minimal-editorial'
              }`}
            >
              {/* Optional Playful Stamp on Top Right of Sheet */}
              {showStamp && !isEmpty && (
                <div className="float-right ml-4 mb-2 -mt-2 select-none">
                  <PlayfulEditorialStamp
                    className="w-20 h-20"
                    editionLabel="FINE PRESS"
                  />
                </div>
              )}

              {/* Subtle Editorial Running Header */}
              <div className="flex items-center justify-between border-b border-[#111111] pb-2 mb-6 text-[8pt] font-mono tracking-widest uppercase text-[#555555]">
                <span>{documentCode || 'MD2PDF STUDIO'}</span>
                <span>
                  {theme === 'monochrome-sans'
                    ? 'SPEC // MONOCHROME SANS'
                    : 'SPEC // MINIMAL EDITORIAL'}
                </span>
              </div>

              {/* Rendered Content or Blank Sheet Hint */}
              {isEmpty ? (
                <div className="py-24 text-center text-[#555555]">
                  <p className="font-mono text-xs uppercase tracking-widest mb-2">
                    [ BLANK A4 SHEET ]
                  </p>
                  <p className="text-xs">
                    左側のキャンバスに原稿を入力すると、ここにリアルタイムで組版されます。
                  </p>
                </div>
              ) : (
                <div>
                  {blocks.map((block, idx) => {
                    switch (block.type) {
                      case 'heading': {
                        const content = renderInlineTokens(block.text);
                        if (block.level === 1) return <h1 key={idx}>{content}</h1>;
                        if (block.level === 2) return <h2 key={idx}>{content}</h2>;
                        if (block.level === 3) return <h3 key={idx}>{content}</h3>;
                        if (block.level === 4) return <h4 key={idx}>{content}</h4>;
                        if (block.level === 5) return <h5 key={idx}>{content}</h5>;
                        return <h6 key={idx}>{content}</h6>;
                      }
                      case 'paragraph':
                        return <p key={idx}>{renderInlineTokens(block.text)}</p>;
                      case 'blockquote':
                        return (
                          <blockquote key={idx}>
                            {block.lines.map((qLine, qIdx) => (
                              <p key={qIdx} className="mb-1 last:mb-0">
                                {renderInlineTokens(qLine)}
                              </p>
                            ))}
                          </blockquote>
                        );
                      case 'list':
                        return (
                          <React.Fragment key={idx}>
                            {renderListNodes(block.items, block.ordered)}
                          </React.Fragment>
                        );
                      case 'image':
                        return (
                          <figure key={idx} className="print-avoid-break">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={block.src}
                              alt={block.alt}
                              className="max-w-full h-auto mx-auto border border-[#111111]"
                            />
                            {block.alt && (
                              <figcaption>FIG // {block.alt}</figcaption>
                            )}
                          </figure>
                        );
                      case 'code':
                        return (
                          <div key={idx} className="print-avoid-break my-3">
                            <div className="flex items-center justify-between px-3 py-1 bg-[#111111] text-[#FFFFFF] text-[7.5pt] font-mono uppercase tracking-wider">
                              <span>CODE // {block.language}</span>
                              <span>MONOCHROME SYNTAX</span>
                            </div>
                            <pre className="!mt-0 !border-t-0">
                              <code>{highlightMonochromeCode(block.code)}</code>
                            </pre>
                          </div>
                        );
                      case 'table':
                        return (
                          <table key={idx}>
                            <thead>
                              <tr>
                                {block.headers.map((header, hIdx) => (
                                  <th
                                    key={hIdx}
                                    style={{
                                      textAlign:
                                        block.alignments[hIdx] || 'left',
                                    }}
                                  >
                                    {renderInlineTokens(header)}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {block.rows.map((row, rIdx) => (
                                <tr key={rIdx}>
                                  {block.headers.map((_, cIdx) => (
                                    <td
                                      key={cIdx}
                                      style={{
                                        textAlign:
                                          block.alignments[cIdx] || 'left',
                                      }}
                                    >
                                      {renderInlineTokens(row[cIdx] ?? '')}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        );
                      case 'hr':
                        return <hr key={idx} />;
                      default:
                        return null;
                    }
                  })}
                </div>
              )}

              {/* Subtle Editorial Running Footer */}
              <footer className="mt-12 pt-3 border-t border-[#111111] flex items-center justify-between text-[7.5pt] font-mono text-[#555555]">
                <span>TYPESET BY MD2PDF — CLIENT-SIDE VECTOR ENGINE</span>
                <span>A4 STANDARD (210 × 297 MM)</span>
              </footer>
            </article>
          </div>
        </section>
      </main>

      {/* ====================================================================
          COMPILATION & COMPLETION MODAL DIALOG (.no-print)
          Uses modern <dialog closedby="any"> + scroll containment
          ==================================================================== */}
      <dialog
        ref={dialogRef}
        closedby="any"
        aria-labelledby="compile-dialog-title"
        className="md2pdf-dialog no-print"
      >
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {compileStage === 'compiling' ? (
            <>
              <CompilingTypesetterIllustration className="w-36 h-36 mb-3" />
              <span className="px-2 py-0.5 text-[10px] font-mono font-extrabold bg-[#E6FF00] border border-[#111111] uppercase">
                TYPESETTING IN PROGRESS
              </span>
              <h3
                id="compile-dialog-title"
                className="text-lg font-extrabold mt-2"
              >
                きれいな余白を整えています。
              </h3>
              <p className="text-xs text-[#555555] mt-1.5 leading-relaxed max-w-xs">
                見出しの改ページ位置と文字詰めを点検しています。数秒お待ちください…
              </p>
            </>
          ) : (
            <>
              <CompletedPressIllustration className="w-40 h-40 mb-2" />
              <span className="px-2 py-0.5 text-[10px] font-mono font-extrabold bg-[#E6FF00] border border-[#111111] uppercase">
                COMPLETED!
              </span>
              <h3
                id="compile-dialog-title"
                className="text-lg font-extrabold mt-2"
              >
                紙面の支度が整いました。
              </h3>
              <p className="text-xs text-[#555555] mt-1.5 leading-relaxed max-w-xs">
                ブラウザの印刷ダイアログで「PDFに保存」を選ぶと、『{extractedTitle}
                』としてベクター品質のまま保存できます。
              </p>
              <div className="mt-6 flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-4 text-xs font-extrabold bg-[#E6FF00] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-transform"
                >
                  もう一度印刷ダイアログを開く
                </button>
                <form method="dialog" className="flex-1">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-bold bg-[#FFFFFF] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] hover:bg-[#FAFAFA]"
                  >
                    ワークスペースに戻る
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
