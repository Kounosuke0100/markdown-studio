import React, { useState } from 'react';
import { X, Loader2, Image, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasRef,
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportType, setExportType] = useState<'image' | 'pdf' | null>(null);

  if (!isOpen) return null;

  // 1. Export as PNG Image
  const handleExportImage = async () => {
    const element = canvasRef.current;
    if (!element) return;

    try {
      setIsExporting(true);
      setExportType('image');

      // Create high-res screenshot
      const canvas = await html2canvas(element, {
        scale: 2, // Double resolution for Retina-like crisp text
        useCORS: true, // Allow external resources if nested
        backgroundColor: null, // Keep transparency if target is transparent
        logging: false,
      });

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `markdown-export-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      // Fun Confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        onClose();
      }, 500);

    } catch (error) {
      console.error('Failed to export image:', error);
      alert('画像の生成に失敗しました。');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // 2. Export as PDF via Print Dialog (highly optimized for all mobile platforms)
  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      setExportType('pdf');
      
      // Delay slightly to allow UI state to update before printing
      setTimeout(() => {
        window.print();
        setIsExporting(false);
        setExportType(null);
        
        // Trigger success confetti
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.6 }
        });
        
        onClose();
      }, 500);
    } catch (error) {
      console.error('Failed to print/export PDF:', error);
      alert('PDFの出力に失敗しました。');
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">エクスポート設定</h2>
          <button className="btn-icon" onClick={onClose} aria-label="閉じる">
            <X size={20} />
          </button>
        </div>

        {isExporting ? (
          <div className="export-loading-container">
            <div className="premium-spinner-wrapper">
              <Loader2 className="premium-spinner animate-spin" size={36} />
              <div className="spinner-glow"></div>
            </div>
            <p className="export-loading-text">
              {exportType === 'image' ? '高精細な画像を生成しています...' : 'PDF印刷の準備をしています...'}
            </p>
          </div>
        ) : (
          <div className="export-grid">
            {/* Image Card */}
            <button className="export-card" onClick={handleExportImage}>
              <div className="export-card-icon-wrapper img-gradient">
                <Image size={24} />
              </div>
              <h3 className="export-card-title">画像として保存</h3>
              <p className="export-card-desc">SNS等への投稿・共有に適した背景付き高画質PNGとして書き出します。</p>
            </button>

            {/* PDF Card */}
            <button className="export-card" onClick={handleExportPDF}>
              <div className="export-card-icon-wrapper pdf-gradient">
                <FileText size={24} />
              </div>
              <h3 className="export-card-title">PDFで保存 / 印刷</h3>
              <p className="export-card-desc">文書印刷に適したA4比率の縦型レイアウトでPDF出力します。</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ExportModal;
