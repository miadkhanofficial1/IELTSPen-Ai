import React from "react";

interface AppIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  rounded?: boolean;
  className?: string;
}

/**
 * AppIcon: iOS Squircle background (#E31837 Crimson Red) with bold white "IELTS"
 * and top-right translucent frosted white badge containing "Ai".
 * Matches icon.jpg exactly.
 */
export const AppIcon: React.FC<AppIconProps> = ({
  size = 64,
  rounded = true,
  className = "",
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        {/* Soft shadow for the iOS squircle */}
        <filter id="icon-ambient-shadow" x="-8%" y="-6%" width="116%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="16" stdDeviation="24" floodColor="#E31837" floodOpacity="0.32" />
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000000" floodOpacity="0.12" />
        </filter>

        {/* Linear subtle sheen across the red squircle */}
        <linearGradient id="icon-red-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EB2645" />
          <stop offset="100%" stopColor="#D91130" />
        </linearGradient>

        {/* Frosted translucent glass gradient for Ai badge */}
        <linearGradient id="icon-glass-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.18" />
        </linearGradient>

        {/* Specular highlight border for Ai badge */}
        <linearGradient id="icon-glass-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Main Crimson Red Squircle */}
      <rect
        width="512"
        height="512"
        rx={rounded ? "114" : "0"}
        fill="url(#icon-red-gradient)"
      />

      {/* Inner specular top rim */}
      {rounded && (
        <rect
          x="1"
          y="1"
          width="510"
          height="510"
          rx="113"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
          fill="none"
        />
      )}

      {/* Translucent Frosted Glass "Ai" Badge (Top-Right) */}
      <g transform="translate(340, 68)">
        {/* Badge background with rounded corners */}
        <rect
          width="94"
          height="94"
          rx="26"
          fill="url(#icon-glass-fill)"
          stroke="url(#icon-glass-border)"
          strokeWidth="2.5"
        />
        {/* "Ai" Text inside badge */}
        <text
          x="47"
          y="65"
          fill="#FFFFFF"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontSize="48"
          fontWeight="700"
          textAnchor="middle"
          letterSpacing="-0.02em"
        >
          Ai
        </text>
      </g>

      {/* Bold White "IELTS" in the center */}
      <text
        x="256"
        y="306"
        fill="#FFFFFF"
        fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
        fontSize="126"
        fontWeight="800"
        textAnchor="middle"
        letterSpacing="-0.04em"
      >
        IELTS
      </text>
    </svg>
  );
};

export default AppIcon;
