import React from 'react';

export interface IllustrationProps {
  className?: string;
}

/**
 * 1. Empty State 用モノライン線画イラスト
 * 「まっさらな原稿用紙と、インクを待つ万年筆・コーヒーカップ」
 */
export const EmptyCanvasIllustration: React.FC<IllustrationProps> = ({
  className = 'w-44 h-44',
}) => {
  return (
    <svg
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="まっさらなキャンバスと万年筆のイラスト"
    >
      {/* Offset Shadow Paper */}
      <rect
        x="48"
        y="30"
        width="88"
        height="116"
        rx="4"
        fill="#111111"
      />
      {/* Main Blank A4 Sheet */}
      <rect
        x="42"
        y="24"
        width="88"
        height="116"
        rx="4"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2"
      />
      {/* Acid Yellow Corner Bookmark */}
      <path
        d="M108 24H126C128.209 24 130 25.7909 130 28V46L108 24Z"
        fill="#E6FF00"
        stroke="#111111"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Subtle Crop Marks on Sheet */}
      <path
        d="M52 38H60M52 38V46"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M120 126H112M120 126V118"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Calm Waiting Face / Minimal Typography Lines */}
      <line
        x1="60"
        y1="64"
        x2="96"
        y2="64"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 5"
      />
      <line
        x1="60"
        y1="78"
        x2="110"
        y2="78"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 5"
      />
      <line
        x1="60"
        y1="92"
        x2="84"
        y2="92"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 5"
      />
      {/* Floating Fountain Pen */}
      <g transform="translate(118, 68) rotate(28)">
        <rect
          x="10"
          y="0"
          width="14"
          height="58"
          rx="3"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="2"
        />
        <rect
          x="10"
          y="10"
          width="14"
          height="10"
          fill="#E6FF00"
          stroke="#111111"
          strokeWidth="2"
        />
        {/* Pen Clip */}
        <path
          d="M24 8H29V32"
          stroke="#111111"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Pen Nib */}
        <path
          d="M10 58L17 76L24 58H10Z"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <line
          x1="17"
          y1="65"
          x2="17"
          y2="75"
          stroke="#111111"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="17" cy="64" r="2" fill="#111111" />
      </g>
      {/* Sparkles of Inspiration */}
      <path
        d="M26 52L29 44L32 52L40 55L32 58L29 66L26 58L18 55L26 52Z"
        fill="#E6FF00"
        stroke="#111111"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle
        cx="162"
        cy="42"
        r="4"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2"
      />
    </svg>
  );
};

/**
 * 2. コンパイル中演出用モノライン線画イラスト
 * 「活字ルーペと組版ローラーが余白と文字詰めを整えている様子」
 */
export const CompilingTypesetterIllustration: React.FC<IllustrationProps> = ({
  className = 'w-36 h-36',
}) => {
  return (
    <svg
      viewBox="0 0 180 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="組版を整えているイラスト"
    >
      {/* Base Grid Card */}
      <rect
        x="34"
        y="28"
        width="112"
        height="104"
        rx="6"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2"
      />
      {/* Typesetting Baseline Grid */}
      <line
        x1="48"
        y1="52"
        x2="132"
        y2="52"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect
        x="48"
        y="64"
        width="44"
        height="14"
        fill="#E6FF00"
        stroke="#111111"
        strokeWidth="2"
      />
      <line
        x1="48"
        y1="92"
        x2="122"
        y2="92"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="106"
        x2="104"
        y2="106"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Loupe / Magnifying Glass Inspecting Kerning */}
      <circle
        cx="110"
        cy="74"
        r="24"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2"
      />
      <circle
        cx="110"
        cy="74"
        r="18"
        fill="#E6FF00"
        stroke="#111111"
        strokeWidth="1.5"
      />
      {/* "Aa" glyph inside Loupe */}
      <path
        d="M101 80L106 66L111 80M102.5 76H109.5"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M119 72V80M119 74C117.5 72.5 114 73 114 76.5C114 80 117.5 80.5 119 79"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Loupe Handle */}
      <path
        d="M127 91L146 110"
        stroke="#111111"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M127 91L146 110"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * 3. 完了（COMPLETED!）演出用モノライン線画イラスト
 * 「刷り上がったばかりの美しいA4ドキュメントと承認リボン」
 */
export const CompletedPressIllustration: React.FC<IllustrationProps> = ({
  className = 'w-40 h-40',
}) => {
  return (
    <svg
      viewBox="0 0 200 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="組版と出力準備が完了したイラスト"
    >
      {/* Back Sheet */}
      <rect
        x="62"
        y="22"
        width="84"
        height="112"
        rx="4"
        transform="rotate(6 62 22)"
        fill="#FAFAFA"
        stroke="#111111"
        strokeWidth="2"
      />
      {/* Front Crisp Printed Sheet */}
      <rect
        x="52"
        y="26"
        width="84"
        height="112"
        rx="4"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2"
      />
      {/* Editorial Layout Inside Sheet */}
      <rect
        x="64"
        y="40"
        width="42"
        height="8"
        fill="#111111"
      />
      <line
        x1="64"
        y1="58"
        x2="124"
        y2="58"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="64"
        y1="68"
        x2="124"
        y2="68"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="64"
        y1="78"
        x2="106"
        y2="78"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Neat Mini Table Box */}
      <rect
        x="64"
        y="90"
        width="60"
        height="26"
        fill="#FAFAFA"
        stroke="#111111"
        strokeWidth="1.75"
      />
      <line
        x1="64"
        y1="99"
        x2="124"
        y2="99"
        stroke="#111111"
        strokeWidth="1.75"
      />
      <line
        x1="94"
        y1="90"
        x2="94"
        y2="116"
        stroke="#111111"
        strokeWidth="1.75"
      />
      {/* Acid Yellow Approval Seal Badge */}
      <circle
        cx="134"
        cy="118"
        r="24"
        fill="#E6FF00"
        stroke="#111111"
        strokeWidth="2"
      />
      <circle
        cx="134"
        cy="118"
        r="18"
        fill="none"
        stroke="#111111"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <path
        d="M125 118.5L131.5 125L144 111.5"
        stroke="#111111"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Celebration Monoline Sparkles */}
      <path
        d="M32 48L35 40L38 48L46 51L38 54L35 62L32 54L24 51L32 48Z"
        fill="#E6FF00"
        stroke="#111111"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M164 42L166 36L168 42L174 44L168 46L166 52L164 46L158 44L164 42Z"
        fill="#FFFFFF"
        stroke="#111111"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * 4. Playful スタンプ（PDF用紙右上に刻印できるエディトリアル検印スタンプ）
 */
export interface PlayfulStampProps {
  className?: string;
  editionLabel?: string;
}

export const PlayfulEditorialStamp: React.FC<PlayfulStampProps> = ({
  className = 'w-24 h-24',
  editionLabel = 'FINE PRESS',
}) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="エディトリアル組版検印スタンプ"
    >
      <g transform="rotate(-8 60 60)">
        {/* Outer Stamp Ring */}
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="2.2"
        />
        {/* Acid Yellow Inner Ring */}
        <circle
          cx="60"
          cy="60"
          r="43"
          fill="#E6FF00"
          stroke="#111111"
          strokeWidth="1.75"
          strokeDasharray="4 3"
        />
        {/* Center White Pill */}
        <rect
          x="16"
          y="46"
          width="88"
          height="28"
          rx="4"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="2"
        />
        {/* Tiny Fountain Pen Nib Icon Top */}
        <path
          d="M60 22L54 34H66L60 22Z"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <circle cx="60" cy="30" r="1.5" fill="#111111" />
        {/* Stamp Text */}
        <text
          x="60"
          y="59"
          textAnchor="middle"
          fill="#111111"
          fontSize="10"
          fontWeight="800"
          fontFamily="Inter, sans-serif"
          letterSpacing="1.5"
        >
          {editionLabel}
        </text>
        <text
          x="60"
          y="69"
          textAnchor="middle"
          fill="#111111"
          fontSize="6.5"
          fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="1"
        >
          MD2PDF EDITION
        </text>
        {/* Bottom Stars */}
        <circle cx="48" cy="88" r="2" fill="#111111" />
        <circle cx="60" cy="91" r="2.5" fill="#111111" />
        <circle cx="72" cy="88" r="2" fill="#111111" />
      </g>
    </svg>
  );
};
