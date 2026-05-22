import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // Default highlight styles
import katex from 'katex';

// Setup marked renderer with highlight.js integration
marked.use({
  breaks: true,
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const validLanguage = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language: validLanguage }).value;
      return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`;
    }
  }
});



/**
 * Extracts and replaces LaTeX math formulas with placeholders
 * so that marked parser doesn't break formulas containing underscores, asterisks, etc.
 * The placeholders are restored with KaTeX-rendered output AFTER HTML sanitization
 * to prevent DOMPurify from stripping out CSS styles and MathML tags.
 */
export function parseMarkdown(text: string): string {
  const mathBlocks: string[] = [];
  const mathInlines: string[] = [];

  // Protect escaped dollar signs \$ from being treated as math delimiters
  let processedText = text.replace(/\\\$/g, '___ESCAPED_DOLLAR___');

  // 1. Extract block math $$ ... $$
  processedText = processedText.replace(/\$\$([\s\S]+?)\$\$/g, (_, mathContent) => {
    const placeholder = `___MATH_BLOCK_${mathBlocks.length}___`;
    mathBlocks.push(mathContent.replace(/___ESCAPED_DOLLAR___/g, '$'));
    return placeholder;
  });

  // 2. Extract inline math $ ... $ (ensures non-empty and handles standard $ delimiters)
  processedText = processedText.replace(/\$([^\s$][^$\n]*?[^\s$])\$/g, (_, mathContent) => {
    const placeholder = `___MATH_INLINE_${mathInlines.length}___`;
    mathInlines.push(mathContent.replace(/___ESCAPED_DOLLAR___/g, '$'));
    return placeholder;
  });

  // Restore remaining escaped dollars back to standard dollars for marked
  processedText = processedText.replace(/___ESCAPED_DOLLAR___/g, '$');

  // 3. Render markdown to HTML
  let rawHtml = '';
  try {
    rawHtml = marked.parse(processedText) as string;
  } catch (err) {
    console.error('Failed to parse markdown:', err);
    rawHtml = `<p class="error">Parsing error</p>`;
  }

  // 4. Sanitize HTML first (placeholders are plain alphanumeric texts, so they are 100% safe and retained)
  const sanitizedHtml = DOMPurify.sanitize(rawHtml);

  // 5. Restore placeholders with actual KaTeX rendered outputs (this prevents DOMPurify from corrupting math styling/MathML)
  let finalHtml = sanitizedHtml;

  mathBlocks.forEach((mathContent, index) => {
    let rendered = '';
    try {
      rendered = katex.renderToString(mathContent.trim(), {
        displayMode: true,
        throwOnError: false
      });
    } catch (e) {
      rendered = `<span class="katex-error">${mathContent}</span>`;
    }
    // Try replacing both normal placeholder and any paragraph-wrapped placeholders marked might have created
    const placeholder = `___MATH_BLOCK_${index}___`;
    const wrappedPlaceholder = `<p>${placeholder}</p>`;
    
    if (finalHtml.includes(wrappedPlaceholder)) {
      finalHtml = finalHtml.replace(wrappedPlaceholder, rendered);
    } else {
      finalHtml = finalHtml.replace(placeholder, rendered);
    }
  });

  mathInlines.forEach((mathContent, index) => {
    let rendered = '';
    try {
      rendered = katex.renderToString(mathContent.trim(), {
        displayMode: false,
        throwOnError: false
      });
    } catch (e) {
      rendered = `<span class="katex-error">${mathContent}</span>`;
    }
    finalHtml = finalHtml.replace(`___MATH_INLINE_${index}___`, rendered);
  });

  return finalHtml;
}
