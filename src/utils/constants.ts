export interface PreviewTheme {
  id: string;
  name: string;
  className: string;
}

export const PREVIEW_THEMES: PreviewTheme[] = [
  { id: 'github', name: 'GitHub Classic', className: 'theme-github' },
  { id: 'minimal', name: 'Sleek Minimal', className: 'theme-minimal' },
  { id: 'journal', name: 'Modern Journal', className: 'theme-journal' },
  { id: 'neon', name: 'Dark Neon', className: 'theme-neon' },
];

export interface BackgroundPreset {
  id: string;
  name: string;
  value: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  { id: 'none', name: 'なし (透明)', value: 'transparent' },
  { id: 'white', name: 'ホワイト', value: '#ffffff' },
  { id: 'dark', name: 'ダーク', value: '#0f172a' },
  { id: 'aurora', name: 'Aurora', value: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' },
  { id: 'sunset', name: 'Sunset', value: 'linear-gradient(135deg, #f97316 0%, #e11d48 100%)' },
  { id: 'ocean', name: 'Ocean', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
  { id: 'cyber', name: 'Cyberpunk', value: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #0d0630 100%)' },
  { id: 'emerald', name: 'Forest', value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
];

export const INITIAL_MARKDOWN = `# 📝 Markdown Studio へようこそ！

ここに入力したマークダウンコードが、右側（モバイルではタブ切り替え）にリアルタイムでプレビューされます。
プレビューされた内容は、**美しいカード画像**や**PDF**として保存できます。

---

## 🎨 特徴

- **リッチなプレビューテーマ**: GitHubスタイル、ミニマル、ジャーナル、ダークネオン
- **画像エクスポート**: SNSシェアに最適なグラデーション背景や角丸の調整機能
- **PDF保存**: 印刷や配布に最適なフォーマット
- **数式（LaTeX）対応**: $E = mc^2$ や以下のブロック数式も美しく描画されます。

$$
f(x) = \\int_{-\\infty}^{\\infty} \\hat{f}(\\xi)\\,e^{2 \\pi i x \\xi}\\,d\\xi
$$

- **シンタックスハイライト**:
\`\`\`javascript
// コードも自動的にハイライトされます
function greet(user) {
  console.log(\`Hello, \${user}! Ready to design?\`);
}
greet('Developer');
\`\`\`

---

## 📊 テーブル表示

| 機能 | 画像保存 | PDF保存 |
| :--- | :---: | :---: |
| 背景グラデーション | ✅ あり | ❌ なし (自動A4) |
| 角丸 & 影 | ✅ あり | ❌ なし |
| 複数ページ出力 | ❌ 1画像化 | ✅ 対応 |

---

> [!TIP]
`;

export interface PageSizePreset {
  id: string;
  name: string;
  width: string;
  height: string;
}

export const PAGE_SIZE_PRESETS: PageSizePreset[] = [
  { id: 'a4', name: 'A4', width: '210mm', height: '297mm' },
  { id: 'a5', name: 'A5', width: '148mm', height: '210mm' },
  { id: 'b5', name: 'B5', width: '176mm', height: '250mm' },
  { id: 'letter', name: 'Letter', width: '216mm', height: '279mm' },
];
