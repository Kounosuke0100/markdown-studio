import React, { useRef } from 'react';
import { 
  Bold, Italic, Heading, Link, Image, Code, Quote, List, Table, Trash2, Clipboard
} from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to insert markdown tags at cursor position
  const insertMarkdown = (syntaxType: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let replacement = '';
    let cursorOffset = 0;

    switch (syntaxType) {
      case 'bold':
        replacement = `**${selectedText || '太字'}**`;
        cursorOffset = selectedText ? replacement.length : 2;
        break;
      case 'italic':
        replacement = `*${selectedText || '斜体'}*`;
        cursorOffset = selectedText ? replacement.length : 1;
        break;
      case 'heading':
        replacement = `\n## ${selectedText || '見出し'}\n`;
        cursorOffset = selectedText ? replacement.length : 4;
        break;
      case 'link':
        replacement = `[${selectedText || 'リンクテキスト'}](https://)`;
        cursorOffset = selectedText ? replacement.length - 1 : 9;
        break;
      case 'image':
        replacement = `![${selectedText || '代替テキスト'}](https://)`;
        cursorOffset = selectedText ? replacement.length - 1 : 10;
        break;
      case 'code':
        replacement = `\n\`\`\`javascript\n${selectedText || '// コードをここに記述'}\n\`\`\`\n`;
        cursorOffset = selectedText ? replacement.length : 16;
        break;
      case 'quote':
        replacement = `\n> ${selectedText || '引用テキスト'}\n`;
        cursorOffset = selectedText ? replacement.length : 4;
        break;
      case 'list':
        replacement = `\n- ${selectedText || 'リスト項目'}\n`;
        cursorOffset = selectedText ? replacement.length : 4;
        break;
      case 'table':
        replacement = `\n| 見出し 1 | 見出し 2 |\n| :--- | :--- |\n| セル 1 | セル 2 |\n`;
        cursorOffset = replacement.length;
        break;
      default:
        break;
    }

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    // Refocus textarea and place cursor inside the tag
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset + (selectedText ? 0 : 0));
    }, 0);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        const textarea = textareaRef.current;
        if (!textarea) {
          onChange(value + text);
          return;
        }
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        const newValue = val.substring(0, start) + text + val.substring(end);
        onChange(newValue);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + text.length, start + text.length);
        }, 0);
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
      alert('クリップボードの読み取り許可がないか、ブラウザが対応していません。手動でペースト（Ctrl+V / Cmd+V）してください。');
    }
  };

  const clearEditor = () => {
    if (window.confirm('エディタの内容をすべてクリアしますか？')) {
      onChange('');
    }
  };

  // Calculate statistics
  const charCount = value.length;
  const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;
  const readingTime = Math.ceil(charCount / 500); // 500 chars per min average

  return (
    <div className="editor-wrapper">
      {/* Markdown Quick Toolbar */}
      <div className="editor-toolbar">
        <button className="editor-toolbar-btn" onClick={() => insertMarkdown('bold')} title="太字">
          <Bold size={16} />
        </button>
        <button className="editor-toolbar-btn" onClick={() => insertMarkdown('italic')} title="斜体">
          <Italic size={16} />
        </button>
        <button className="editor-toolbar-btn" onClick={() => insertMarkdown('heading')} title="見出し2">
          <Heading size={16} />
        </button>
        <div className="editor-toolbar-divider" />
        <button className="editor-toolbar-btn" onClick={() => insertMarkdown('link')} title="リンク">
          <Link size={16} />
        </button>
        <button className="editor-toolbar-btn" onClick={() => insertMarkdown('image')} title="画像">
          <Image size={16} />
        </button>
        <button className="editor-toolbar-btn" onClick={() => insertMarkdown('code')} title="コードブロック">
          <Code size={16} />
        </button>
        <div className="editor-toolbar-divider" />
        <button className="editor-toolbar-btn" onClick={() => insertMarkdown('quote')} title="引用">
          <Quote size={16} />
        </button>
        <button className="editor-toolbar-btn" onClick={() => insertMarkdown('list')} title="リスト">
          <List size={16} />
        </button>
        <button className="editor-toolbar-btn" onClick={() => insertMarkdown('table')} title="テーブル">
          <Table size={16} />
        </button>
        <div className="editor-toolbar-divider" style={{ marginLeft: 'auto' }} />
        <button className="editor-toolbar-btn" onClick={handlePaste} title="ペースト" style={{ color: 'var(--accent-color)', marginRight: '8px' }}>
          <Clipboard size={16} />
        </button>
        <button className="editor-toolbar-btn" onClick={clearEditor} title="クリア" style={{ color: '#ef4444' }}>
          <Trash2 size={16} />
        </button>
      </div>

      {/* Main Textarea */}
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="マークダウンコードをここに入力するか、ペーストしてください..."
        spellCheck={false}
      />

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-label">文字数:</span>
          <span className="status-value">{charCount}</span>
          <span className="status-divider">/</span>
          <span className="status-label">単語数:</span>
          <span className="status-value">{wordCount}</span>
        </div>
        <div className="status-item">
          <span className="status-label">読了予測:</span>
          <span className="status-value highlight-text">約 {readingTime} 分</span>
        </div>
      </div>
    </div>
  );
};
export default Editor;
