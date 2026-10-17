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

export type MobileWorkspaceTab = 'editor' | 'preview' | 'studio';

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

interface QuickFormatAction {
  id: string;
  label: string;
  badge: string;
  snippet: string;
  cursorOffset?: number;
}

const QUICK_FORMAT_ACTIONS: QuickFormatAction[] = [
  { id: 'h1', label: '大見出し', badge: 'H1', snippet: '\n# 見出しタイトル\n' },
  { id: 'h2', label: '中見出し', badge: 'H2', snippet: '\n## セクション見出し\n' },
  { id: 'h3', label: '小見出し', badge: 'H3', snippet: '\n### サブセクション\n' },
  { id: 'bold', label: '太字', badge: 'B', snippet: '**強調テキスト**' },
  { id: 'list', label: '箇条書き', badge: '•', snippet: '\n- リスト項目\n' },
  { id: 'task', label: 'チェック', badge: '✓', snippet: '\n- [ ] 確認項目\n' },
  { id: 'quote', label: '引用', badge: '“', snippet: '\n> 印象的な一節をここに引用します。\n' },
  {
    id: 'code',
    label: 'コード',
    badge: '</>',
    snippet: '\n```typescript\nconst status = "ready";\n```\n',
  },
  {
    id: 'table',
    label: '表組み',
    badge: '田',
    snippet:
      '\n| 項目 | 内容 | 備考 |\n| :--- | :--- | :--- |\n| 要素A | 仕様テキスト | 完了 |\n',
  },
  { id: 'hr', label: '区切り線', badge: '―', snippet: '\n---\n' },
];

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
  - スマートフォンでは親指ひとつで「原稿・紙面・組版室」を行き来できるネイティブドック構造
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

1. 原稿タブに任意のMarkdownテキストを貼り付けるか、クイックチップで記法を挿入します。
2. 紙面タブまたは上部ピルから、原稿のトーンに合わせて組版テーマを切り替えます。
3. **「PDF出力」**を押し、印刷・共有メニューで「PDFに保存」を選ぶだけで完成です。`;

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

  // Smartphone-native navigation & view states
  const [activeMobileTab, setActiveMobileTab] =
    useState<MobileWorkspaceTab>('editor');
  const [mobileCompactScale, setMobileCompactScale] = useState<boolean>(false);

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerHaptic = useCallback((ms = 8) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch {
        // Ignore on unsupported devices
      }
    }
  }, []);

  const showGentleToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2600);
  }, []);

  // Restore draft from localStorage on client mount
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

  // Auto-save draft changes to localStorage
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

  // Automatically synchronize document.title with H1 for clean PDF filenames
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
      return { chars: 0, lines: 0, headings: 0, blocksCount: 0 };
    }
    const chars = trimmed.length;
    const lines = trimmed.split(/\r\n|\r|\n/).length;
    const headings = blocks.filter((b) => b.type === 'heading').length;
    return { chars, lines, headings, blocksCount: blocks.length };
  }, [markdown, blocks]);

  // Trigger PDF Compilation Flow
  const handleCompilePdf = useCallback(() => {
    triggerHaptic(15);
    if (!markdown.trim()) {
      showGentleToast(
        'まだキャンバスが白紙です。まずは原稿をひとこと書いてみませんか？'
      );
      setActiveMobileTab('editor');
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
  }, [markdown, showGentleToast, triggerHaptic]);

  // Keyboard Shortcut (Cmd/Ctrl + Enter) to trigger PDF compile
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
    triggerHaptic();
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
        '入力欄を長押しして「ペースト」を選ぶか、Cmd+V で貼り付けられます。'
      );
    }
  };

  // Insert Markdown snippet at current cursor position (Mobile Quick Format Chip Bar)
  const handleInsertQuickSnippet = (action: QuickFormatAction) => {
    triggerHaptic();
    const textarea = textareaRef.current;
    if (!textarea) {
      setMarkdown((prev) => `${prev}${action.snippet}`);
      return;
    }

    const start = textarea.selectionStart ?? markdown.length;
    const end = textarea.selectionEnd ?? markdown.length;
    const selected = markdown.slice(start, end);

    let replacement = action.snippet;
    if (selected.length > 0 && action.id === 'bold') {
      replacement = `**${selected}**`;
    } else if (selected.length > 0 && action.id === 'quote') {
      replacement = `\n> ${selected}\n`;
    }

    const nextText =
      markdown.slice(0, start) + replacement + markdown.slice(end);
    setMarkdown(nextText);

    window.requestAnimationFrame(() => {
      textarea.focus();
      const nextCursor = start + replacement.length;
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  };

  // Read local .md / .txt file helper
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
    triggerHaptic();
    setMarkdown('');
    showGentleToast('紙面をまっさらな白紙に戻しました。');
  };

  // Handle loading sample AI markdown
  const handleLoadSample = () => {
    triggerHaptic();
    setMarkdown(INITIAL_SAMPLE_MARKDOWN);
    setDocumentCode('DOC-A4-01');
    showGentleToast('サンプルの組版原稿をセットしました。');
  };

  // Handle rotating Small Talk
  const handleNextSmallTalk = () => {
    triggerHaptic();
    setSmallTalkIndex((prev) => (prev + 1) % SMALL_TALK_ITEMS.length);
  };

  const currentSmallTalk = SMALL_TALK_ITEMS[smallTalkIndex];
  const isEmpty = markdown.trim().length === 0;

  return (
    <div className="print-root min-h-dvh flex flex-col bg-[#FAFAFA] text-[#111111] pb-24 lg:pb-0">
      {/* ====================================================================
          TOP NAVIGATION BAR (Compact Native App Bar on Mobile / Full Studio Bar on Desktop)
          ==================================================================== */}
      <header className="no-print sticky top-0 z-30 bg-[#FFFFFF] border-b-2 border-[#111111] px-3.5 sm:px-6 lg:px-8 py-2.5 lg:py-3.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 bg-[#111111] text-[#FFFFFF] border-2 border-[#111111] flex items-center justify-center font-mono font-bold text-xs sm:text-sm tracking-tighter shadow-[2px_2px_0px_0px_#E6FF00]">
              M↓
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight leading-none">
                  md2pdf
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#E6FF00] border border-[#111111] shrink-0">
                  Studio
                </span>
              </div>
              <p className="hidden sm:block text-xs text-[#555555] mt-0.5 truncate">
                思考の断片を、デザイナーが組版したような美しい紙面へ。
              </p>
              <p className="sm:hidden text-[10px] font-mono text-[#555555] truncate max-w-[140px]">
                {isEmpty ? '白紙キャンバス' : `${extractedTitle}.pdf`}
              </p>
            </div>
          </div>

          {/* Straight 3-Step Flow Indicator (Desktop XL) */}
          <div className="hidden xl:flex items-center gap-2 text-xs font-mono border-[1.5px] border-[#111111] bg-[#FAFAFA] px-3.5 py-1.5">
            <span className="font-bold">01 ペースト</span>
            <span aria-hidden="true">→</span>
            <span className="font-bold">02 組版確認</span>
            <span aria-hidden="true">→</span>
            <span className="font-bold bg-[#E6FF00] px-1.5 py-0.5 border border-[#111111]">
              03 PDF書き出し
            </span>
          </div>

          {/* Mobile Quick Pill Controls (Visible < 1024px) */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setTheme((prev) =>
                  prev === 'monochrome-sans'
                    ? 'minimal-editorial'
                    : 'monochrome-sans'
                );
              }}
              aria-label="組版書体テーマを切り替え"
              className="px-2.5 py-1.5 text-[11px] font-extrabold border-[1.5px] border-[#111111] bg-[#FAFAFA] shadow-[2px_2px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 bg-[#111111] inline-block" />
              <span>{theme === 'monochrome-sans' ? 'ゴシック' : '明朝体'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setShowStamp((prev) => !prev);
              }}
              aria-pressed={showStamp}
              aria-label="検印スタンプのON/OFF"
              className={`px-2 py-1.5 text-[11px] font-mono font-bold border-[1.5px] border-[#111111] transition-colors ${
                showStamp
                  ? 'bg-[#111111] text-[#E6FF00] shadow-[2px_2px_0px_0px_#E6FF00]'
                  : 'bg-[#FFFFFF] text-[#555555]'
              }`}
            >
              {showStamp ? '★印' : '☆印'}
            </button>
          </div>

          {/* Desktop Controls (Visible >= 1024px) */}
          <div className="hidden lg:flex items-center gap-3">
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
              className="px-4 py-2 text-sm font-extrabold bg-[#E6FF00] text-[#111111] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#111111] transition-all flex items-center gap-2"
            >
              <span>PDFにコンパイルする</span>
              <span className="font-mono text-[11px] border border-[#111111] bg-[#FFFFFF] px-1.5 py-0.5">
                ⌘↵
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Gentle Floating Microcopy Toast (.no-print) - Positioned above mobile dock on phones */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-24 lg:bottom-6 inset-x-4 sm:inset-x-auto sm:right-6 z-40 bg-[#111111] text-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#E6FF00] px-4 py-3 text-xs font-medium flex items-center gap-2.5"
        >
          <span className="inline-block w-2 h-2 shrink-0 bg-[#E6FF00]" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for .md / .txt Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt,text/markdown,text/plain"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* ====================================================================
          MAIN WORKSPACE (Native Tab Views on Smartphone / 2-Pane Split on Desktop)
          ==================================================================== */}
      <main className="print-workspace flex-1 max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 p-3 sm:p-6 lg:p-8">
        {/* ------------------------------------------------------------------
            LEFT PANE: MARKDOWN EDITOR, QUICK FORMAT CHIPS, EMPTY STATE
            Visible on Desktop OR when activeMobileTab === 'editor'
            ------------------------------------------------------------------ */}
        <section
          aria-label="Markdown原稿エディタ"
          className={`no-print lg:col-span-5 flex-col gap-4 ${
            activeMobileTab === 'editor' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Editor Frame */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative flex-1 flex flex-col bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] min-h-[calc(100dvh-13.5rem)] lg:min-h-[540px]"
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
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b-2 border-[#111111] bg-[#FAFAFA]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#111111] inline-block" />
                <h2 className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider">
                  01 / Manuscript
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-2.5 py-1.5 text-xs font-bold bg-[#E6FF00] sm:bg-[#FFFFFF] border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:bg-[#E6FF00] active:translate-x-[1px] active:translate-y-[1px] transition-colors"
                >
                  ペースト
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 text-xs font-bold bg-[#FFFFFF] border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:bg-[#E6FF00] active:translate-x-[1px] active:translate-y-[1px] transition-colors"
                >
                  .md読込
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-2.5 py-1.5 text-xs font-bold bg-[#FFFFFF] border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:bg-[#FAFAFA] active:translate-x-[1px] active:translate-y-[1px] transition-colors"
                >
                  サンプル
                </button>
                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="px-2 py-1.5 text-xs font-bold bg-[#FFFFFF] text-[#555555] border-[1.5px] border-[#111111] hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors"
                >
                  白紙へ
                </button>
              </div>
            </div>

            {/* 1-Tap Quick Markdown Format Chip Bar (Smartphone & Tablet friendly) */}
            <div
              aria-label="Markdownクイック挿入バー"
              className="px-3 py-2 border-b-[1.5px] border-[#111111] bg-[#FFFFFF] flex items-center gap-1.5 overflow-x-auto no-scrollbar"
            >
              <span className="text-[10px] font-mono font-bold text-[#555555] shrink-0 mr-1">
                挿入:
              </span>
              {QUICK_FORMAT_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleInsertQuickSnippet(action)}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#FAFAFA] border-[1.5px] border-[#111111] hover:bg-[#E6FF00] active:bg-[#E6FF00] active:translate-y-[1px] transition-colors"
                >
                  <span className="font-mono text-[10px] font-extrabold px-1 bg-[#FFFFFF] border border-[#111111]">
                    {action.badge}
                  </span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>

            {/* Desktop Header Code Input Bar */}
            <div className="hidden sm:flex px-4 py-2 border-b-[1.5px] border-[#111111] bg-[#FFFFFF] flex-wrap items-center justify-between gap-2 text-xs">
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
                出力名:{' '}
                <strong className="text-[#111111]">{extractedTitle}.pdf</strong>
              </div>
            </div>

            {/* Textarea + Interactive Empty State Overlay */}
            <div className="relative flex-1 flex flex-col">
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="ここにAIが出力したMarkdownテキストを貼り付けるか、上のボタンから記法を挿入してください..."
                aria-label="Markdown入力エリア"
                className="w-full flex-1 p-4 sm:p-5 font-mono text-[15px] sm:text-sm leading-relaxed bg-transparent text-[#111111] placeholder:text-[#555555]/50 resize-none focus:outline-none min-h-[340px]"
              />

              {isEmpty && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-[#FFFFFF]/95">
                  <EmptyCanvasIllustration className="w-32 h-32 sm:w-40 sm:h-40 mb-2" />
                  <p className="text-sm font-bold text-[#111111]">
                    まっさらなキャンバスです。
                  </p>
                  <p className="text-xs text-[#555555] max-w-xs mt-1 leading-relaxed">
                    AIが紡いだMarkdownテキストをここにそっと置いてみてください。見出しも表組みも、美しいA4紙面に生まれ変わります。
                  </p>
                  <div className="pointer-events-auto mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="px-4 py-2 text-xs font-extrabold bg-[#E6FF00] border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      クリップボードから貼付
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 text-xs font-bold bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111]"
                    >
                      .md ファイル選択
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="px-3.5 py-2 text-xs font-bold bg-[#FFFFFF] border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111]"
                    >
                      サンプル原稿を試す
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Footer inside Editor */}
            <div className="px-3.5 sm:px-4 py-2.5 border-t-2 border-[#111111] bg-[#FAFAFA] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#555555]">
              <div className="flex items-center gap-3">
                <span>{metrics.chars.toLocaleString()} 文字</span>
                <span>{metrics.lines.toLocaleString()} 行</span>
                <span>見出し {metrics.headings}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#111111] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#111111] inline-block" />
                <span>
                  自動保存済{lastSavedTime ? ` ${lastSavedTime}` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Built-in "Small Talk" (組版の豆知識) Bar on Desktop */}
          <aside
            aria-label="Small Talk 組版の豆知識"
            className="hidden lg:flex bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] p-4 items-start justify-between gap-4"
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
            MOBILE TAB 03: TYPESETTING STUDIO & SMALL TALK LOUNGE (.no-print)
            Visible only on Smartphone when activeMobileTab === 'studio'
            ------------------------------------------------------------------ */}
        {activeMobileTab === 'studio' && (
          <section
            aria-label="組版設定と豆知識"
            className="no-print lg:hidden flex flex-col gap-4"
          >
            {/* Typography Theme Card */}
            <div className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-extrabold uppercase px-2 py-0.5 bg-[#E6FF00] border border-[#111111]">
                  TYPOGRAPHY THEME
                </span>
                <span className="text-[11px] font-mono text-[#555555]">
                  書体と行送りの設計
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setTheme('monochrome-sans');
                  }}
                  className={`p-3.5 text-left border-2 border-[#111111] transition-all flex items-start justify-between gap-3 ${
                    theme === 'monochrome-sans'
                      ? 'bg-[#E6FF00] shadow-[3px_3px_0px_0px_#111111]'
                      : 'bg-[#FAFAFA]'
                  }`}
                >
                  <div>
                    <p className="text-sm font-extrabold text-[#111111]">
                      Monochrome Sans（モダンゴシック）
                    </p>
                    <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                      Inter + Noto Sans JP。企画書・技術仕様書・AI要約レポートに最適な、ソリッドで現代的な組版。
                    </p>
                  </div>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 bg-[#FFFFFF] border border-[#111111] shrink-0">
                    {theme === 'monochrome-sans' ? '選択中' : '選択'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setTheme('minimal-editorial');
                  }}
                  className={`p-3.5 text-left border-2 border-[#111111] transition-all flex items-start justify-between gap-3 ${
                    theme === 'minimal-editorial'
                      ? 'bg-[#E6FF00] shadow-[3px_3px_0px_0px_#111111]'
                      : 'bg-[#FAFAFA]'
                  }`}
                >
                  <div>
                    <p className="text-sm font-extrabold text-[#111111]">
                      Minimal Editorial（知的明朝）
                    </p>
                    <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                      Newsreader + しっぽり明朝。エッセイ・論文・長文記事を、書籍のように静かに読ませる組版。
                    </p>
                  </div>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 bg-[#FFFFFF] border border-[#111111] shrink-0">
                    {theme === 'minimal-editorial' ? '選択中' : '選択'}
                  </span>
                </button>
              </div>
            </div>

            {/* Stamp & Header Metadata Card */}
            <div className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-extrabold uppercase px-2 py-0.5 bg-[#111111] text-[#FFFFFF]">
                  PAPER DETAILS
                </span>
                <span className="text-[11px] font-mono text-[#555555]">
                  刻印とファイル名
                </span>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="mobile-doc-code-input"
                  className="block text-xs font-bold text-[#111111]"
                >
                  紙面ヘッダー刻印コード
                </label>
                <input
                  id="mobile-doc-code-input"
                  type="text"
                  value={documentCode}
                  onChange={(e) => setDocumentCode(e.target.value)}
                  maxLength={28}
                  placeholder="DOC-A4-01"
                  className="w-full font-mono text-sm font-bold bg-[#FAFAFA] px-3 py-2 border-2 border-[#111111] focus:outline-none focus:bg-[#FFFFFF]"
                />
                <p className="text-[11px] font-mono text-[#555555]">
                  PDF保存時の推奨ファイル名:{' '}
                  <strong className="text-[#111111]">{extractedTitle}.pdf</strong>
                </p>
              </div>

              <div className="pt-2 border-t border-[#111111] flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold">
                    FINE PRESS エディトリアル検印スタンプ
                  </p>
                  <p className="text-[11px] text-[#555555]">
                    A4紙面の右上にオリジナルモノライン検印を刻印します
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setShowStamp((prev) => !prev);
                  }}
                  className={`px-3.5 py-2 text-xs font-mono font-extrabold border-2 border-[#111111] shrink-0 ${
                    showStamp
                      ? 'bg-[#E6FF00] text-[#111111] shadow-[2px_2px_0px_0px_#111111]'
                      : 'bg-[#FAFAFA] text-[#555555]'
                  }`}
                >
                  {showStamp ? '★ ON' : '☆ OFF'}
                </button>
              </div>
            </div>

            {/* Small Talk Card on Mobile */}
            <aside
              aria-label="Small Talk 組版の豆知識"
              className="bg-[#FFFFFF] border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-extrabold bg-[#E6FF00] border border-[#111111]">
                    SMALL TALK
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#555555]">
                    {currentSmallTalk.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleNextSmallTalk}
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-[#FAFAFA] border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:bg-[#E6FF00]"
                >
                  別の豆知識へ →
                </button>
              </div>
              <p className="text-xs text-[#111111] leading-relaxed">
                {currentSmallTalk.text}
              </p>
            </aside>
          </section>
        )}

        {/* ------------------------------------------------------------------
            RIGHT PANE: REAL-TIME A4 TYPESETTING PREVIEW
            Always mounted in DOM so @media print works from ANY mobile tab!
            ------------------------------------------------------------------ */}
        <section
          aria-label="A4紙面リアルタイムプレビュー"
          className={`print-pane-right lg:col-span-7 flex-col ${
            activeMobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Preview Bar Header (.no-print) */}
          <div className="no-print mb-2.5 flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#111111] inline-block" />
              <h2 className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider">
                02 / Live A4 Paper (210 × 297mm)
              </h2>
            </div>

            {/* Mobile Paper Scale Toggle & Desktop Theme Label */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setMobileCompactScale((prev) => !prev);
                }}
                className="lg:hidden px-2.5 py-1 text-[11px] font-mono font-bold bg-[#FFFFFF] border-[1.5px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] active:bg-[#E6FF00]"
              >
                {mobileCompactScale ? '標準文字サイズに戻す' : '紙面全体を俯瞰縮小'}
              </button>
              <div className="hidden sm:block text-xs font-mono text-[#555555]">
                Theme:{' '}
                <strong className="text-[#111111]">
                  {theme === 'monochrome-sans'
                    ? 'Monochrome Sans'
                    : 'Minimal Editorial'}
                </strong>
              </div>
            </div>
          </div>

          {/* Scrollable A4 Desk Viewport (Container Query Root) */}
          <div className="print-canvas-scroller flex-1 bg-[#FFFFFF]/60 border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] p-2.5 sm:p-6 lg:p-8 overflow-x-auto flex justify-center items-start">
            {/* THE A4 SHEET */}
            <article
              className={`a4-preview-sheet md2pdf-prose ${
                theme === 'monochrome-sans'
                  ? 'theme-monochrome-sans'
                  : 'theme-minimal-editorial'
              } ${mobileCompactScale ? 'mobile-compact-scale' : ''}`}
            >
              {/* Optional Playful Stamp on Top Right of Sheet */}
              {showStamp && !isEmpty && (
                <div className="float-right ml-3 sm:ml-4 mb-2 -mt-1 sm:-mt-2 select-none">
                  <PlayfulEditorialStamp
                    className="w-14 h-14 sm:w-20 sm:h-20"
                    editionLabel="FINE PRESS"
                  />
                </div>
              )}

              {/* Subtle Editorial Running Header */}
              <div className="flex items-center justify-between border-b border-[#111111] pb-2 mb-5 sm:mb-6 text-[7.5pt] sm:text-[8pt] font-mono tracking-widest uppercase text-[#555555] gap-2">
                <span className="truncate">{documentCode || 'MD2PDF STUDIO'}</span>
                <span className="shrink-0">
                  {theme === 'monochrome-sans'
                    ? 'SPEC // SANS'
                    : 'SPEC // EDITORIAL'}
                </span>
              </div>

              {/* Rendered Content or Blank Sheet Hint */}
              {isEmpty ? (
                <div className="py-20 text-center text-[#555555]">
                  <p className="font-mono text-xs uppercase tracking-widest mb-2">
                    [ BLANK A4 SHEET ]
                  </p>
                  <p className="text-xs">
                    原稿タブでテキストを入力すると、ここにリアルタイムで組版されます。
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
                          <div key={idx} className="table-scroll-wrapper">
                            <table>
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
                          </div>
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
              <footer className="mt-10 sm:mt-12 pt-3 border-t border-[#111111] flex items-center justify-between text-[7pt] sm:text-[7.5pt] font-mono text-[#555555]">
                <span>TYPESET BY MD2PDF — CLIENT-SIDE VECTOR ENGINE</span>
                <span>A4 STANDARD</span>
              </footer>
            </article>
          </div>
        </section>
      </main>

      {/* ====================================================================
          SMARTPHONE-NATIVE BOTTOM NAVIGATION DOCK (< 1024px, .no-print)
          Thumb-friendly segmented tabs + Acid Yellow primary PDF Compile CTA
          ==================================================================== */}
      <nav
        aria-label="スマートフォン用ワークスペース切り替えドック"
        className="no-print lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFFFFF] border-t-2 border-[#111111] px-3 pt-2 pb-safe-dock shadow-[0px_-4px_0px_0px_#111111]"
      >
        <div className="max-w-lg mx-auto flex items-stretch gap-2">
          {/* Segmented Mode Switcher */}
          <div className="flex-1 grid grid-cols-3 border-2 border-[#111111] bg-[#FAFAFA] shadow-[2px_2px_0px_0px_#111111]">
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setActiveMobileTab('editor');
              }}
              aria-current={activeMobileTab === 'editor' ? 'page' : undefined}
              className={`py-2 px-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                activeMobileTab === 'editor'
                  ? 'bg-[#111111] text-[#FFFFFF]'
                  : 'bg-[#FFFFFF] text-[#111111]'
              }`}
            >
              <span className="font-mono text-[9px] font-bold opacity-80">
                01 EDIT
              </span>
              <span className="text-xs font-extrabold leading-none">
                原稿を書く
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setActiveMobileTab('preview');
              }}
              aria-current={activeMobileTab === 'preview' ? 'page' : undefined}
              className={`py-2 px-1 border-x-2 border-[#111111] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                activeMobileTab === 'preview'
                  ? 'bg-[#111111] text-[#FFFFFF]'
                  : 'bg-[#FFFFFF] text-[#111111]'
              }`}
            >
              <span className="font-mono text-[9px] font-bold opacity-80">
                02 PAPER
              </span>
              <span className="text-xs font-extrabold leading-none flex items-center gap-1">
                <span>紙面を見る</span>
                {!isEmpty && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeMobileTab === 'preview'
                        ? 'bg-[#E6FF00]'
                        : 'bg-[#111111]'
                    }`}
                  />
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setActiveMobileTab('studio');
              }}
              aria-current={activeMobileTab === 'studio' ? 'page' : undefined}
              className={`py-2 px-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                activeMobileTab === 'studio'
                  ? 'bg-[#111111] text-[#FFFFFF]'
                  : 'bg-[#FFFFFF] text-[#111111]'
              }`}
            >
              <span className="font-mono text-[9px] font-bold opacity-80">
                03 STUDIO
              </span>
              <span className="text-xs font-extrabold leading-none">
                組版・豆知識
              </span>
            </button>
          </div>

          {/* One-Thumb Primary PDF Compile CTA */}
          <button
            type="button"
            onClick={handleCompilePdf}
            className="shrink-0 px-4 py-2 bg-[#E6FF00] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#111111] flex flex-col items-center justify-center"
          >
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-tighter leading-none">
              COMPILE A4
            </span>
            <span className="text-xs font-extrabold leading-tight mt-0.5">
              PDF出力
            </span>
          </button>
        </div>
      </nav>

      {/* ====================================================================
          COMPILATION & COMPLETION MODAL DIALOG (.no-print)
          Native Bottom Sheet on Smartphone / Centered Modal on Desktop
          ==================================================================== */}
      <dialog
        ref={dialogRef}
        closedby="any"
        aria-labelledby="compile-dialog-title"
        className="md2pdf-dialog no-print"
      >
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Mobile Bottom Sheet Pill Handle */}
          <div
            aria-hidden="true"
            className="sm:hidden w-10 h-1 bg-[#111111] mb-4"
          />

          {compileStage === 'compiling' ? (
            <>
              <CompilingTypesetterIllustration className="w-32 h-32 sm:w-36 sm:h-36 mb-3" />
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
              <CompletedPressIllustration className="w-36 h-36 sm:w-40 sm:h-40 mb-2" />
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
                印刷プレビューまたは共有メニューから「PDFに保存」を選ぶと、『
                {extractedTitle}』としてベクター品質のまま保存できます。
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 sm:py-2.5 px-4 text-xs font-extrabold bg-[#E6FF00] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  もう一度印刷画面を開く
                </button>
                <form method="dialog" className="flex-1">
                  <button
                    type="submit"
                    className="w-full py-3 sm:py-2.5 px-4 text-xs font-bold bg-[#FFFFFF] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_0px_#111111] hover:bg-[#FAFAFA]"
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
