import Link from 'next/link';
import { ProductImage } from './ProductImage';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  category: string;
  coverImage: string | null;
}

export function ProductCard({ product }: { product: Product }) {
  const priceYuan = product.price === 0 ? '免费' : `¥${(product.price / 100).toFixed(0)}`;

  return (
    <Link href={`/product/${product.id}`} className='block border rounded-lg p-4 hover:shadow-lg transition'>
      <ProductImage src={product.coverImage} alt={product.name} />
      <h2 className='text-xl font-semibold'>{product.name}</h2>
      {product.description && (
        <p className='text-muted-foreground text-sm line-clamp-2'>{product.description}</p>
      )}
      <p className='text-lg font-bold mt-2'>{priceYuan}</p>
    </Link>
  );
}
