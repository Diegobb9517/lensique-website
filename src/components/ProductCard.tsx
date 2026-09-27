import React from 'react';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { getInventedName, getProductSlug, isInStock } from '../lib/format';
import { resolveImageUrl } from '../App';
import { motion } from 'framer-motion';
import { BASE_LENS_PRICE } from '../lib/constants';

const SVG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2.06 13a2.97 2.97 0 0 1 2.8-2.06h3.58a2 2 0 0 1 1.95 1.57l.82 3.43a2 2 0 0 0 1.95 1.57h1.68a2 2 0 0 0 1.95-1.57l.82-3.43a2 2 0 0 1 1.95-1.57h3.58a2.97 2.97 0 0 1 2.8 2.06'/%3E%3Cpath d='M17.5 10.5V8a5.5 5.5 0 0 0-11 0v2.5'/%3E%3C/svg%3E";

interface ProductCardProps {
  product: any;
  onClick: (product: any) => void;
  className?: string;
  style?: React.CSSProperties;
  fallbackImage?: string;
  isEditorial?: boolean;
  onSelectAction?: (product: any) => void;
}

export const FormatProductName = ({ name, brand, category }: { name: string, brand?: string, category?: string }) => {
  const cleanName = getInventedName(name, category);
  return <span className="fpn-main">{cleanName}</span>;
};

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick, 
  className = "wp-product-card", 
  style, 
  fallbackImage,
  isEditorial = false,
  onSelectAction
}) => {
  const outOfStock = !isInStock(product);
  
  const imageUrl = resolveImageUrl((product.images && product.images.length > 0) ? product.images[0].image_url : product.image_url, product.image);
  const slug = getProductSlug(product);
  const href = `/producto/${slug}`;

  const isFrame = !String(product.category || '').toLowerCase().includes('sol') && !String(product.category || '').toLowerCase().includes('contacto');
  const isContactLens = String(product.category || '').toLowerCase().includes('contacto');
  const displayPrice = (product.price_incl_tax || 0) + (isFrame ? BASE_LENS_PRICE : 0);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick(product);
  };
  
  if (isEditorial) {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`product-card-editorial hover-scale ${className}`}
        style={{ cursor: 'pointer', ...style }}
      >
        <a 
          href={href} 
          onClick={handleCardClick}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="product-img-area" style={{ position: 'relative' }}>
            {isFrame ? (
              <div className="out-of-stock-badge" style={outOfStock ? { color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' } : {}}>
                {outOfStock ? 'SOBRE PEDIDO' : 'EN EXISTENCIA'}
              </div>
            ) : (
              outOfStock && <div className="out-of-stock-badge" style={{ color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>Sobre pedido</div>
            )}
            <ImageWithSkeleton 
              src={imageUrl || fallbackImage} 
              alt={product.name} 
              className="product-main-img smooth-img"
              loading="lazy"
              decoding="async"
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = SVG_PLACEHOLDER;
                e.target.style.padding = '20%';
                e.target.style.objectFit = 'contain';
                e.target.style.background = '#f9fafb';
              }}
            />
          </div>

          <div className="product-info-editorial" style={{ textAlign: 'center' }}>
            <p className="product-brand-sub" style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
              {product.category || 'Armazón de vista'} {product.brand && `· ${product.brand}`}
            </p>
            <h3 className="product-name-serif" style={{ marginBottom: '8px', justifyContent: 'center' }}><FormatProductName name={product.name} brand={product.brand} category={product.category} /></h3>
            <div style={{ textAlign: 'center' }}>
              <span className="product-price-label tabular-nums">${displayPrice.toLocaleString('es-MX')}{isContactLens ? ' / caja' : ''}</span>
            </div>
            {isFrame && (
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                micas antirreflejantes incluidas
              </p>
            )}
            
            {onSelectAction && (
              <button 
                className="product-main-view-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSelectAction(product);
                }}
              >
                Seleccionar
              </button>
            )}
          </div>
        </a>
      </motion.div>
    );
  }

  // Standard WP Card (used in carousels and quiz)
  return (
    <div 
      className={className}
      style={style}
    >
      <a 
        href={href}
        onClick={handleCardClick}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
      >
        <div className="wp-card-img-area">
          {isFrame && (
            <div className="out-of-stock-badge" style={outOfStock ? { color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' } : {}}>
              {outOfStock ? 'SOBRE PEDIDO' : 'EN EXISTENCIA'}
            </div>
          )}
          <ImageWithSkeleton 
            src={imageUrl || fallbackImage} 
            alt={product.name} 
            className="wp-card-img"
            loading="lazy"
            decoding="async" 
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = SVG_PLACEHOLDER;
              e.target.style.padding = '20%';
              e.target.style.objectFit = 'contain';
              e.target.style.background = '#f9fafb';
            }}
          />
        </div>

        <div className="wp-card-info" style={{ textAlign: 'center' }}>
          <p className="wp-card-category" style={{ marginBottom: '4px' }}>
            {product.brand || (
              String(product.category || '').toLowerCase().includes('contacto') 
                ? (product.name.toLowerCase().includes('acuvue') ? 'Acuvue' :
                   product.name.toLowerCase().includes('bausch') ? 'Bausch + Lomb' :
                   product.name.toLowerCase().includes('biofinity') || product.name.toLowerCase().includes('clariti') || product.name.toLowerCase().includes('lunare') ? 'CooperVision' :
                   product.name.toLowerCase().includes('air optix') || product.name.toLowerCase().includes('freshlook') || product.name.toLowerCase().includes('dailies') ? 'Alcon' :
                   'Lentes de Contacto')
                : 'Lensique'
            )}
          </p>
          <h3 className="wp-product-name" style={{ justifyContent: 'center' }}><FormatProductName name={product.name} brand={product.brand} category={product.category} /></h3>
          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <span className="wp-product-price tabular-nums">${displayPrice.toLocaleString('es-MX')}{isContactLens ? ' / caja' : ''}</span>
          </div>
          {isFrame && (
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              micas antirreflejantes incluidas
            </p>
          )}
          
          {onSelectAction && (
            <span className="wp-card-cta-hover">
              Personalizar ›
            </span>
          )}
        </div>
      </a>
    </div>
  );
};
