import React from 'react';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { getInventedName } from '../lib/format';
import { resolveImageUrl } from '../App';
import { motion } from 'framer-motion';

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
  
  if (isEditorial) {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`product-card-editorial hover-scale ${className}`}
        style={{ cursor: 'pointer', ...style }}
        onClick={() => onClick(product)}
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
            <span className="product-price-label">${product.price_incl_tax ? product.price_incl_tax.toLocaleString('es-MX') : '1,200'}</span>
          </div>
          <p className="product-brand-sub" style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            {product.category || 'Armazón de vista'} {product.brand && `· ${product.brand}`}
          </p>
          
          {onSelectAction && (
            <button 
              className="product-main-view-btn"
              onClick={(e) => {
                e.stopPropagation();
                onSelectAction(product);
              }}
            >
              Seleccionar
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  // Standard WP Card (used in carousels and quiz)
  return (
    <div 
      className={className}
      onClick={() => onClick(product)}
      style={style}
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
        <p className="wp-card-category">{product.brand || 'Lensique'}</p>
        <h3 className="wp-product-name"><FormatProductName name={product.name} brand={product.brand} category={product.category} /></h3>
        <span className="wp-product-price">${product.price_incl_tax ? product.price_incl_tax.toLocaleString('es-MX') : '1,200'}</span>
        
        {onSelectAction && (
          <span className="wp-card-cta-hover">
            Personalizar ›
          </span>
        )}
      </div>
    </div>
  );
};
