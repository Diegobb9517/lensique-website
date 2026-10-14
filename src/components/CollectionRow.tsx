import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

export interface CollectionRowProps {
  id?: string;
  title: string;
  href: string;
  products: any[];
  fallbackImage: string;
  onSeeAll: () => void;
  onSelectProduct: (product: any) => void;
  /** Mínimo de productos para mostrar la fila (por defecto 4). */
  minItems?: number;
}

export const CollectionRow: React.FC<CollectionRowProps> = ({
  id,
  title,
  href,
  products,
  fallbackImage,
  onSeeAll,
  onSelectProduct,
  minItems = 4
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length < minItems) {
    return null;
  }

  return (
    <div id={id} className="home-collection-row">
      <div className="home-collection-header">
        <h2 className="home-collection-title">{title}</h2>
        <div className="home-collection-actions">
          <a 
            href={href} 
            className="home-collection-see-all"
            onClick={(e) => {
              e.preventDefault();
              onSeeAll();
            }}
          >
            Ver todo &rarr;
          </a>
          <button 
            type="button"
            className="home-collection-nav-btn" 
            aria-label={`Desplazar ${title} a la izquierda`}
            onClick={() => scroll('left')}
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            type="button"
            className="home-collection-nav-btn" 
            aria-label={`Desplazar ${title} a la derecha`}
            onClick={() => scroll('right')}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="home-collection-slider" ref={sliderRef}>
        {products.map((product) => (
          <div key={product.id} className="home-collection-card-item">
            <ProductCard 
              product={product}
              fallbackImage={fallbackImage}
              onClick={() => onSelectProduct(product)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
