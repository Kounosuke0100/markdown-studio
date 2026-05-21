import React from 'react';
import { Sun, Moon, Edit3, Eye } from 'lucide-react';

interface HeaderProps {
  appTheme: 'light' | 'dark';
  setAppTheme: (theme: 'light' | 'dark') => void;
  activeTab: 'editor' | 'preview';
  setActiveTab: (tab: 'editor' | 'preview') => void;
}

export const Header: React.FC<HeaderProps> = ({
  appTheme,
  setAppTheme,
  activeTab,
  setActiveTab,
}) => {
  const toggleAppTheme = () => {
    setAppTheme(appTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="app-header">
      <div className="logo-section">
        <span className="logo-icon">📝</span>
        <h1 className="logo-text">Markdown Studio</h1>
      </div>

      {/* View Toggle tabs - only visible on smaller screens via CSS, but rendered universally */}
      <div className="view-toggle">
        <button
          onClick={() => setActiveTab('editor')}
          className={`toggle-option ${activeTab === 'editor' ? 'active' : ''}`}
          aria-label="エディタを開く"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Edit3 size={14} />
            エディタ
          </span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`toggle-option ${activeTab === 'preview' ? 'active' : ''}`}
          aria-label="プレビューを開く"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={14} />
            プレビュー
          </span>
        </button>
      </div>

      <div className="header-actions">
        <button
          onClick={toggleAppTheme}
          className="btn-icon"
          title={appTheme === 'light' ? 'ダークモードへ' : 'ライトモードへ'}
          aria-label="テーマ切り替え"
        >
          {appTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
};
export default Header;
