'use client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface BaconImageProps {
  width?: number;
  height?: number;
}

export default function BaconImage({ width = 300, height = 300 }: BaconImageProps) {
  const src = `${BACKEND_URL}/api/bacon?width=${width}&height=${height}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Bacon" width={width} height={height} />
  );
}
