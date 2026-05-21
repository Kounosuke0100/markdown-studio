import React from 'react';
import { Download } from 'lucide-react';
import { 
  PREVIEW_THEMES, 
  BACKGROUND_PRESETS
} from '../utils/constants';
import type { PreviewTheme, BackgroundPreset } from '../utils/constants';

interface ControlPanelProps {
  theme: string;
  setTheme: (theme: string) => void;
  padding: number;
  setPadding: (padding: number) => void;
  borderRadius: number;
  setBorderRadius: (radius: number) => void;
  background: string;
  setBackground: (bg: string) => void;
  onOpenExport: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  theme,
  setTheme,
  padding,
  setPadding,
  borderRadius,
  setBorderRadius,
  background,
  setBackground,
  onOpenExport,
}) => {
  // Calculate percentage fill for input sliders
  const paddingPercent = (padding / 80) * 100;
  const radiusPercent = (borderRadius / 40) * 100;

  return (
    <div className="control-panel glass">
      {/* 1. Theme Selector */}
      <div className="control-group">
        <label className="control-label">レンダリングテーマ</label>
        <div className="theme-selector">
          {PREVIEW_THEMES.map((t: PreviewTheme) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`theme-chip ${theme === t.id ? 'active' : ''}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Background Selector */}
      <div className="control-group">
        <label className="control-label">カード背景</label>
        <div className="bg-selector">
          {BACKGROUND_PRESETS.map((bg: BackgroundPreset) => (
            <button
              key={bg.id}
              onClick={() => setBackground(bg.value)}
              className={`bg-option ${bg.id === 'none' ? 'bg-option-none' : ''} ${background === bg.value ? 'active' : ''}`}
              style={{ 
                background: bg.value === 'transparent' ? 'transparent' : bg.value 
              }}
              title={bg.name}
              aria-label={bg.name}
            >
              {bg.id === 'none' && <span className="none-slash" />}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Padding and Radius Sliders */}
      <div className="control-group">
        <div className="slider-controls">
          <div className="slider-item">
            <div className="slider-header">
              <span className="slider-title">余白 (Padding)</span>
              <span className="slider-value">{padding}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="4"
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
              className="slider-input"
              style={{
                background: `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${paddingPercent}%, var(--slider-track-bg) ${paddingPercent}%, var(--slider-track-bg) 100%)`
              }}
            />
          </div>

          <div className="slider-item">
            <div className="slider-header">
              <span className="slider-title">角丸 (Radius)</span>
              <span className="slider-value">{borderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="2"
              value={borderRadius}
              disabled={background === 'transparent'}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="slider-input"
              style={{
                background: background === 'transparent' 
                  ? 'var(--slider-track-bg)' 
                  : `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${radiusPercent}%, var(--slider-track-bg) ${radiusPercent}%, var(--slider-track-bg) 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Export Trigger Button */}
      <button 
        onClick={onOpenExport}
        className="floating-export-btn"
        style={{ position: 'relative', right: 0, bottom: 0, width: '100%', marginTop: '12px', justifyContent: 'center' }}
      >
        <Download size={18} />
        エクスポート (画像/PDF)
      </button>
    </div>
  );
};
export default ControlPanel;
