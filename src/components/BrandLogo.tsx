interface BrandLogoProps {
  size?: number;
  className?: string;
}

export default function BrandLogo({ size = 32, className = "" }: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="BukScan"
      width={size}
      height={size}
      className={`shrink-0 rounded-lg object-cover shadow-[0_4px_14px_-4px_rgba(56,189,248,0.6)] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
