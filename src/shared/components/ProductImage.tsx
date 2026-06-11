import Image from 'next/image';

interface ProductImageProps {
  src?: string | null;
  alt: string;
}

export function ProductImage({ src, alt }: ProductImageProps) {
  if (!src) return null;

  return (
    <div className="aspect-square bg-muted rounded mb-4 overflow-hidden relative">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        loading="lazy"
      />
    </div>
  );
}
