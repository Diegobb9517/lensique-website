import React from 'react';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { getInventedName, getProductSlug } from '../lib/format';
import { resolveImageUrl } from '../App';
import { motion } from 'framer-motion';
import { BASE_LENS_PRICE } from '../lib/constants';

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
              <div className="out-of-stock-badge">
                {isOutOfStock ? 'SOBRE PEDIDO' : 'EN EXISTENCIA'}
              </div>
            ) : (
              isOutOfStock && <div className="out-of-stock-badge">Sobre pedido</div>
            )}
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
          {isFrame ? (
            <div className="out-of-stock-badge">
              {isOutOfStock ? 'SOBRE PEDIDO' : 'EN EXISTENCIA'}
            </div>
          ) : (
            isOutOfStock && <div className="out-of-stock-badge">Sobre pedido</div>
          )}
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
