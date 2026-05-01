export function BrainHouseLogo({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="BrainHouse Logo"
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "inline-block" }}
    />
  );
}
