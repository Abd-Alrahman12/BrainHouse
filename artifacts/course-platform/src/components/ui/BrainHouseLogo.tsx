export function BrainHouseLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="25" width="20" height="11" rx="2.5" fill="currentColor" opacity="0.9"/>
      <rect x="7" y="22" width="22" height="5" rx="2" fill="currentColor" opacity="0.7"/>
      <path d="M28 27h3a3 3 0 0 1 0 6h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9"/>
      <ellipse cx="14" cy="13" rx="5" ry="6" fill="currentColor" opacity="0.85"/>
      <ellipse cx="24" cy="13" rx="5" ry="6" fill="currentColor" opacity="0.85"/>
      <path d="M19 8 Q19.5 13 19 18" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      <path d="M11 12 Q13 10 14 13 Q15 15 13 16" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M27 12 Q25 10 24 13 Q23 15 25 16" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
    </svg>
  );
}
