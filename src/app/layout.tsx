import type { Metadata, Viewport } from 'next';
import {
  Inter,
  Noto_Sans_JP,
  Newsreader,
  Shippori_Mincho,
  JetBrains_Mono,
} from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-noto-sans-jp',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

const shipporiMincho = Shippori_Mincho({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-shippori-mincho',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#111111',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: 'md2pdf — 思考の断片を、美しい紙面へ。',
    template: '%s | md2pdf Typeset Studio',
  },
  description:
    'AIが出力したMarkdownテキストを、プロフェッショナルな印刷品質のPDFへと瞬時に組版・コンパイルするクライアント完結型スタジオ。',
  applicationName: 'md2pdf Typeset Studio',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'md2pdf',
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    'Markdown to PDF',
    'CSS組版',
    'タイポグラフィ',
    'AI Markdown',
    'A4 PDF変換',
    'md2pdf',
  ],
  openGraph: {
    title: 'md2pdf — 思考の断片を、美しい紙面へ。',
    description:
      'デザイナーが丹念に組版したような極上の美しさで、MarkdownをA4ベクターPDFへ瞬時にコンパイル。完全ローカル・プライバシーファースト。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'md2pdf Typeset Studio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'md2pdf — 思考の断片を、美しい紙面へ。',
    description:
      'AIが出力したMarkdownを、プロフェッショナルな印刷品質のA4ベクターPDFへ瞬時にコンパイル。',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSansJP.variable} ${newsreader.variable} ${shipporiMincho.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-dvh bg-[#FAFAFA] text-[#111111] antialiased selection:bg-[#E6FF00] selection:text-[#111111] overscroll-y-none">
        {children}
      </body>
    </html>
  );
}
