import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import ControlPanel from './components/ControlPanel';
import ExportModal from './components/ExportModal';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  // 1. Persisted States via local storage
  const [markdown, setMarkdown] = useLocalStorage<string>('markdown_content', '');
  const [theme, setTheme] = useLocalStorage<string>('preview_theme', 'github');
  const [padding, setPadding] = useLocalStorage<number>('preview_padding', 24);
  const [borderRadius, setBorderRadius] = useLocalStorage<number>('preview_border_radius', 12);
  const [background, setBackground] = useLocalStorage<string>('preview_background', 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)');
  const [appTheme, setAppTheme] = useLocalStorage<'light' | 'dark'>('app_theme', 'light');

  // 2. Local UI States
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // 3. Canvas ref to capture screenshot
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync App UI Theme to document root HTML node
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [appTheme]);

  return (
    <div className="app-container">
      {/* Background ambient glow circles */}
      <div className="ambient-glow ambient-1"></div>
      <div className="ambient-glow ambient-2"></div>
      <div className="ambient-glow ambient-3"></div>

      {/* Top Header Navigation */}
      <Header 
        appTheme={appTheme} 
        setAppTheme={setAppTheme} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main workspace */}
      <div className={`workspace ${activeTab === 'preview' ? 'show-preview' : ''}`}>
        {/* Left/Main Pane: Editor */}
        <div className="pane pane-editor">
          <Editor value={markdown} onChange={setMarkdown} />
        </div>

        {/* Right/Second Pane: Preview & Layout Controller */}
        <div className="pane pane-preview">
          <Preview 
            markdown={markdown}
            theme={theme}
            padding={padding}
            borderRadius={borderRadius}
            background={background}
            canvasRef={canvasRef}
          />
          
          <ControlPanel 
            theme={theme}
            setTheme={setTheme}
            padding={padding}
            setPadding={setPadding}
            borderRadius={borderRadius}
            setBorderRadius={setBorderRadius}
            background={background}
            setBackground={setBackground}
            onOpenExport={() => setIsExportOpen(true)}
          />
        </div>
      </div>

      {/* Export overlay bottom sheet */}
      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
        canvasRef={canvasRef} 
      />
    </div>
  );
}

export default App;
