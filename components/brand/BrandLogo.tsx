import React from "react";

interface BrandLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: "auto" | "light" | "dark";
  showSlogan?: boolean;
  className?: string;
  height?: number | string;
  width?: number | string;
}

/**
 * BrandLogo: Official SVG component matching "main logo.jpg" (Light Mode)
 * and "main logo 2.jpg" (Dark Mode).
 *
 * Slogan: "WRITE SMARTER. SCORE HIGHER."
 * Typography: Plus Jakarta Sans / Inter
 * Color tokens:
 *  - Light: IELTS (#111827 Charcoal), Pen (#E31837 Crimson), Slogan (#6B7280), Badge (Light Gray #E2E8F0 / #111827 text)
 *  - Dark: IELTS (#FFFFFF Pure White), Pen (#E31837 Crimson), Slogan (#9CA3AF), Badge (Frosted Dark #27272A / #FFFFFF text)
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "auto",
  showSlogan = true,
  className = "",
  width,
  height,
  ...props
}) => {
  // Determine color styling based on variant
  const isLight = variant === "light";
  const isDark = variant === "dark";
  const isAuto = variant === "auto";

  const ieltsFill = isLight
    ? "#111827"
    : isDark
    ? "#FFFFFF"
    : undefined;

  const sloganFill = isLight
    ? "#6B7280"
    : isDark
    ? "#9CA3AF"
    : undefined;

  const badgeFill = isLight
    ? "#E5E7EB"
    : isDark
    ? "rgba(255, 255, 255, 0.14)"
    : undefined;

  const badgeStroke = isLight
    ? "#D1D5DB"
    : isDark
    ? "rgba(255, 255, 255, 0.22)"
    : undefined;

  const badgeTextFill = isLight
    ? "#111827"
    : isDark
    ? "#FFFFFF"
    : undefined;

  // ViewBox: 320 wide; 96 high when slogan is shown, 72 high without slogan
  const viewBoxHeight = showSlogan ? 96 : 72;
  const computedHeight = height || (width ? undefined : showSlogan ? 42 : 30);

  return (
    <svg
      viewBox={`0 0 320 ${viewBoxHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-colors ${className}`}
      width={width}
      height={computedHeight}
      aria-label="IELTSPen Ai - WRITE SMARTER. SCORE HIGHER."
      {...props}
    >
      <defs>
        <linearGradient id="ai-badge-dark-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3F3F46" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#27272A" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Main Wordmark Group */}
      <g id="brand-wordmark">
        {/* ONE single continuous wordmark: "IELTS" and "Pen" in a single text element using tspan */}
        <text
          x="8"
          y="62"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="62"
          fontWeight="800"
          letterSpacing="-0.035em"
        >
          <tspan
            fill={ieltsFill}
            className={
              isAuto
                ? "fill-[#111827] dark:fill-[#FFFFFF] transition-colors duration-200"
                : undefined
            }
          >IELTS</tspan><tspan fill="#E31837">Pen</tspan>
        </text>

        {/* Top-Right "Ai" Rounded Badge right next to the "n" in "Pen" */}
        <g id="ai-badge" transform="translate(276, 16)">
          <rect
            width="36"
            height="30"
            rx="8"
            fill={badgeFill || (isAuto ? "currentColor" : undefined)}
            stroke={badgeStroke || (isAuto ? "currentColor" : undefined)}
            strokeWidth="1.2"
            className={
              isAuto
                ? "fill-[#E5E7EB] stroke-[#D1D5DB] dark:fill-[#27272A] dark:stroke-white/20 transition-colors duration-200"
                : undefined
            }
          />
          <text
            x="18"
            y="21.5"
            fill={badgeTextFill}
            className={
              isAuto
                ? "fill-[#111827] dark:fill-[#FFFFFF] transition-colors duration-200"
                : undefined
            }
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontSize="17.5"
            fontWeight="700"
            textAnchor="middle"
          >
            Ai
          </text>
        </g>
      </g>

      {/* Slogan Underneath: Exact width alignment matching start of "I" to end of "n" */}
      {showSlogan && (
        <text
          x="8"
          y="86"
          textLength="261"
          lengthAdjust="spacing"
          fill={sloganFill}
          className={
            isAuto
              ? "fill-[#6B7280] dark:fill-[#9CA3AF] transition-colors duration-200"
              : undefined
          }
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="12.5"
          fontWeight="600"
        >
          WRITE SMARTER. SCORE HIGHER.
        </text>
      )}
    </svg>
  );
};

export default BrandLogo;
