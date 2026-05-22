import React, { useMemo } from 'react';
import { parseMarkdown } from '../utils/markdown';
import '../styles/themes.css'; // Preview themes

interface PreviewProps {
  markdown: string;
  theme: string;
  padding: number;
  borderRadius: number;
  background: string;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  fontSize: number;
  pageSize: string;
}

export const Preview: React.FC<PreviewProps> = ({
  markdown,
  theme,
  padding,
  borderRadius,
  background,
  canvasRef,
  fontSize,
  pageSize,
}) => {
  // Memoize markdown rendering to optimize performance
  const renderedHtml = useMemo(() => {
    return parseMarkdown(markdown);
  }, [markdown]);

  // Determine actual style mapping for gradient vs solid/none background
  const wrapperStyle: React.CSSProperties = {
    background: background,
    padding: `${padding}px`,
    borderRadius: `${borderRadius}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
    width: '100%',
    boxSizing: 'border-box',
  };

  const paperStyle: React.CSSProperties = {
    borderRadius: background === 'transparent' ? 0 : '8px', // minor inner rounding if nested
    width: '100%',
    padding: '32px 24px',
    boxShadow: background === 'transparent' ? 'none' : '0 4px 20px rgba(0,0,0,0.15)',
    fontSize: `${fontSize}px`,
  };

  return (
    <div className="preview-container">
      <div className="preview-scroll-wrapper">
        {/* The exportable canvas target */}
        <div 
          ref={canvasRef} 
          className="preview-canvas-wrapper" 
          style={wrapperStyle}
        >
          {/* Inner Paper where Markdown theme is applied */}
          <div 
            className={`preview-paper theme-${theme} size-${pageSize}`}
            style={paperStyle}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </div>
      </div>
    </div>
  );
};
export default Preview;
