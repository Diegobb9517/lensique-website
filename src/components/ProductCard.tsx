import React from 'react';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { getInventedName, getProductSlug } from '../lib/format';
import { resolveImageUrl } from '../App';
import { motion } from 'framer-motion';
import { BASE_LENS_PRICE } from '../lib/constants';
import { calculateDeliveryTime } from '../lib/delivery';

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
  const isOutOfStock = product.stock != null && product.stock !== '' && Number(product.stock) <= 0;
  
  const imageUrl = resolveImageUrl((product.images && product.images.length > 0) ? product.images[0].image_url : product.image_url, product.image);
  const slug = getProductSlug(product);
  const href = `/producto/${slug}`;

  const isFrame = !String(product.category || '').toLowerCase().includes('sol') && !String(product.category || '').toLowerCase().includes('contacto');
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
            {isOutOfStock && <div className="out-of-stock-badge">Sobre pedido</div>}
            <ImageWithSkeleton 
              src={imageUrl || fallbackImage} 
              alt={product.name} 
              className="product-main-img smooth-img"
              loading="lazy"
              decoding="async"
              onError={(e: any) => {
                if (fallbackImage) {
                  e.target.onerror = null;
                  e.target.src = fallbackImage;
                }
              }}
            />
          </div>

          <div className="product-info-editorial">
            <div className="product-name-row">
              <h3 className="product-name-serif"><FormatProductName name={product.name} brand={product.brand} category={product.category} /></h3>
              <span className="product-price-label tabular-nums">${displayPrice.toLocaleString('es-MX')}</span>
            </div>
            <p className="product-brand-sub" style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
              {product.category || 'Armazón de vista'} {product.brand && `· ${product.brand}`}
            </p>
            {isFrame && (
              <p style={{ fontSize: '11px', color: '#059669', marginTop: '2px', fontWeight: 500 }}>
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
          {isOutOfStock && <div className="out-of-stock-badge">Sobre pedido</div>}
          <ImageWithSkeleton 
            src={imageUrl || fallbackImage} 
            alt={product.name} 
            className="wp-card-img"
            loading="lazy"
            decoding="async" 
            onError={(e: any) => {
              if (fallbackImage) {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }
            }}
          />
        </div>

        <div className="wp-card-info">
                    <p className="wp-card-category">
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
          <h3 className="wp-product-name"><FormatProductName name={product.name} brand={product.brand} category={product.category} /></h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="wp-product-price tabular-nums">${displayPrice.toLocaleString('es-MX')}</span>
            <span style={{ fontSize: '11px', color: '#16a34a', background: '#f0fdf4', padding: '3px 6px', borderRadius: '4px', fontWeight: 600, border: '1px solid #bbf7d0', flexShrink: 0, marginTop: '2px' }}>
              {calculateDeliveryTime(product).labelShort}
            </span>
          </div>
          {isFrame && (
            <p style={{ fontSize: '11px', color: '#059669', marginTop: '2px', fontWeight: 500 }}>
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
