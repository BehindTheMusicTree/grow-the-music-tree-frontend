"use client";

interface RingLoaderProps {
  size?: number;
  className?: string;
}

export default function RingLoader({ size = 24, className = "" }: RingLoaderProps) {
  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: size }}>
      <div
        className="animate-spin rounded-full border-2 border-gray-300 border-t-white"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
