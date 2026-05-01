export function BrainHouseLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="BrainHouse logo"
    >
      {/* Coffee cup body */}
      <rect x="8" y="22" width="20" height="14" rx="3" fill="currentColor" opacity="0.15" />
      <path
        d="M8 25h20v11a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V25z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Cup handle */}
      <path
        d="M28 27h3a3 3 0 0 1 0 6h-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      {/* Cup rim */}
      <rect x="7" y="22" width="22" height="4" rx="2" fill="currentColor" opacity="0.7" />
      {/* Steam / Brain shape above cup */}
      {/* Left brain lobe */}
      <ellipse cx="14" cy="13" rx="5" ry="6" fill="currentColor" opacity="0.85" />
      {/* Right brain lobe */}
      <ellipse cx="24" cy="13" rx="5" ry="6" fill="currentColor" opacity="0.85" />
      {/* Brain center crease */}
      <path
        d="M19 8 Q19.5 13 19 18"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Left lobe detail */}
      <path
        d="M11 12 Q13 10 14 13 Q15 15 13 16"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      {/* Right lobe detail */}
      <path
        d="M27 12 Q25 10 24 13 Q23 15 25 16"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
