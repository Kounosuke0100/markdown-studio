import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // Default highlight styles
import katex from 'katex';

// Setup marked renderer with highlight.js integration
marked.use({
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const validLanguage = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language: validLanguage }).value;
      return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`;
    }
  }
});

// Configure DOMPurify to allow MathML and SVG elements which KaTeX uses for rendering math
const purifyConfig = {
  USE_PROFILES: { html: true },
  ADD_TAGS: [
    'math', 'mrow', 'mi', 'mn', 'mo', 'mtext', 'mspace', 'ms', 'mglpyh', 
    'mpadded', 'mphantom', 'msqrt', 'mroot', 'mstyle', 'merror', 
    'msub', 'msup', 'msubsup', 'munder', 'mover', 'munderover', 
    'mmultiscripts', 'mscarries', 'mscarry', 'msline', 'msgroup', 
    'msrow', 'mstack', 'maction', 'semantics', 'annotation', 'annotation-xml',
    'svg', 'path', 'line', 'rect', 'circle', 'text', 'g', 'use'
  ],
  ADD_ATTR: [
    'display', 'class', 'style', 'id', 'width', 'height', 'viewBox', 
    'd', 'x', 'y', 'r', 'cx', 'cy', 'fill', 'stroke', 'stroke-width',
    'xlink:href', 'points', 'transform'
  ]
};

/**
 * Extracts and replaces LaTeX math formulas with placeholders
 * so that marked parser doesn't break formulas containing underscores, asterisks, etc.
 */
export function parseMarkdown(text: string): string {
  const mathBlocks: string[] = [];
  const mathInlines: string[] = [];

  // 1. Extract block math $$ ... $$
  let processedText = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, mathContent) => {
    const placeholder = `<!--MATH_BLOCK_${mathBlocks.length}-->`;
    try {
      const rendered = katex.renderToString(mathContent.trim(), {
        displayMode: true,
        throwOnError: false
      });
      mathBlocks.push(rendered);
    } catch (e) {
      mathBlocks.push(`<span class="katex-error">${mathContent}</span>`);
    }
    return placeholder;
  });

  // 2. Extract inline math $ ... $ (avoid matching dates like 10$ or expressions with spaces)
  processedText = processedText.replace(/\$([^$\n]+?)\$/g, (_, mathContent) => {
    const placeholder = `<!--MATH_INLINE_${mathInlines.length}-->`;
    try {
      const rendered = katex.renderToString(mathContent.trim(), {
        displayMode: false,
        throwOnError: false
      });
      mathInlines.push(rendered);
    } catch (e) {
      mathInlines.push(`<span class="katex-error">${mathContent}</span>`);
    }
    return placeholder;
  });

  // 3. Render markdown to HTML
  let rawHtml = '';
  try {
    rawHtml = marked.parse(processedText) as string;
  } catch (err) {
    console.error('Failed to parse markdown:', err);
    rawHtml = `<p class="error">Parsing error</p>`;
  }

  // 4. Restore math blocks and inlines
  let finalHtml = rawHtml;
  mathBlocks.forEach((rendered, index) => {
    finalHtml = finalHtml.replace(`&lt;!--MATH_BLOCK_${index}--&gt;`, rendered);
    finalHtml = finalHtml.replace(`<!--MATH_BLOCK_${index}-->`, rendered);
  });

  mathInlines.forEach((rendered, index) => {
    finalHtml = finalHtml.replace(`&lt;!--MATH_INLINE_${index}--&gt;`, rendered);
    finalHtml = finalHtml.replace(`<!--MATH_INLINE_${index}-->`, rendered);
  });

  // 5. Sanitize HTML to prevent XSS
  return DOMPurify.sanitize(finalHtml, purifyConfig);
}
