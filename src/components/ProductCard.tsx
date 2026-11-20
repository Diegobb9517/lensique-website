// @ts-nocheck
import React, { useState } from 'react';
import { getOfficialHdImage, getContactLensCardSpecs } from '../lib/productImages';
import { ImageWithSkeleton } from './ImageWithSkeleton';
import { getDisplayName, getProductSlug, isInStock, isProvisionalName, getCardDisplayName } from '../lib/format';
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

export const FormatProductName = ({ product }: { product: any }) => {
  const cleanName = getCardDisplayName(product);
  const isProv = isProvisionalName(product);
  if (isProv) {
    return <span className="fpn-main provisional-name" style={{ color: '#888', fontSize: '0.9em', fontWeight: 'normal', textTransform: 'uppercase' }}>{cleanName}</span>;
  }
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
  
  const hdImage = getOfficialHdImage(product);
  const rawImageUrl = (product.images && product.images.length > 0) ? product.images[0].image_url : product.image_url;
  const imageUrl = hdImage || resolveImageUrl(rawImageUrl, product.image);
  const slug = getProductSlug(product);
  const href = `/producto/${slug}`;

  const isFrame = !String(product.category || '').toLowerCase().includes('sol') && !String(product.category || '').toLowerCase().includes('contacto');
  const isContactLens = String(product.category || '').toLowerCase().includes('contacto') || String(product?.sku || '').toUpperCase().startsWith('LC-');
  const displayPrice = Number(product.price_incl_tax) || 0;
  const minWithLenses = displayPrice + 1899;
  const specs = isContactLens ? getContactLensCardSpecs(product) : null;

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
        className={`product-card-editorial hover-scale ${isContactLens ? 'contact-lens-card' : ''} ${className}`}
        style={{ cursor: 'pointer', ...(isContactLens ? { background: '#ffffff', backgroundColor: '#ffffff' } : {}), ...style }}
      >
        <a 
          href={href} 
          onClick={handleCardClick}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div className="product-card-badge-row" style={{ minHeight: '22px', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
            {isFrame ? (
              <div className="out-of-stock-badge" style={{ ...(outOfStock ? { color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' } : { color: '#16a34a', background: 'rgba(240, 253, 244, 0.9)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' }), position: 'static', top: 'auto', left: 'auto' }}>
                {outOfStock ? 'SOBRE PEDIDO' : 'EN EXISTENCIA'}
              </div>
            ) : (
              outOfStock && <div className="out-of-stock-badge" style={{ color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em', position: 'static', top: 'auto', left: 'auto' }}>Sobre pedido</div>
            )}
          </div>
          <div 
            className={`product-img-area ${isContactLens ? 'contact-lens-bg-white' : ''}`} 
            style={{ 
              position: 'relative',
              ...(isContactLens ? { background: '#ffffff', backgroundColor: '#ffffff' } : {})
            }}
          >
            <ImageWithSkeleton 
              src={imageUrl || fallbackImage} 
              alt={product.name} 
              className="product-main-img smooth-img"
              containerClassName={isContactLens ? 'contact-lens-img-container' : ''}
              loading="lazy"
              decoding="async"
              style={{ 
                objectFit: 'contain', 
                padding: isContactLens ? '12px' : undefined,
                ...(isContactLens ? { background: '#ffffff', backgroundColor: '#ffffff' } : {})
              }}
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = fallbackImage || SVG_PLACEHOLDER;
                e.target.style.padding = '20%';
                e.target.style.objectFit = 'contain';
                e.target.style.background = isContactLens ? '#ffffff' : '#f9fafb';
              }}
            />
          </div>

          <div className="product-info-editorial" style={{ textAlign: 'center' }}>
            <p className="product-brand-sub" style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
              {product.category || 'Armazón de vista'} {product.brand && `· ${product.brand}`}
            </p>
            <h3 className="product-name-serif" style={{ marginBottom: '8px', justifyContent: 'center' }}><FormatProductName product={product} /></h3>
            <div style={{ textAlign: 'center' }}>
              <span className="product-price-label tabular-nums">${displayPrice.toLocaleString('es-MX')}{isContactLens ? ' / caja' : ''}</span>
            </div>
            {isFrame && (
              <p style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                Armazón solo · desde ${minWithLenses.toLocaleString('es-MX')} con micas
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
      className={`${isContactLens ? 'contact-lens-card' : ''} ${className}`}
      style={{ ...(isContactLens ? { background: '#ffffff', backgroundColor: '#ffffff' } : {}), ...style }}
    >
      <a 
        href={href}
        onClick={handleCardClick}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
      >
        <div className="product-card-badge-row" style={{ minHeight: '22px', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
          {isFrame ? (
            <div className="out-of-stock-badge" style={{ ...(outOfStock ? { color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' } : { color: '#16a34a', background: 'rgba(240, 253, 244, 0.9)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' }), position: 'static', top: 'auto', left: 'auto' }}>
              {outOfStock ? 'SOBRE PEDIDO' : 'EN EXISTENCIA'}
            </div>
          ) : (
            outOfStock && <div className="out-of-stock-badge" style={{ color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em', position: 'static', top: 'auto', left: 'auto' }}>Sobre pedido</div>
          )}
        </div>
        <div 
          className={`wp-card-img-area ${isContactLens ? 'contact-lens-bg-white' : ''}`} 
          style={{ 
            position: 'relative',
            ...(isContactLens ? { background: '#ffffff', backgroundColor: '#ffffff' } : {})
          }}
        >
          <ImageWithSkeleton 
            src={imageUrl || fallbackImage} 
            alt={product.name} 
            className="wp-card-img"
            containerClassName={isContactLens ? 'contact-lens-img-container' : ''}
            loading="lazy"
            decoding="async" 
            style={{ 
              objectFit: 'contain', 
              padding: isContactLens ? '10px' : undefined,
              ...(isContactLens ? { background: '#ffffff', backgroundColor: '#ffffff' } : {})
            }}
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = fallbackImage || SVG_PLACEHOLDER;
              e.target.style.padding = '20%';
              e.target.style.objectFit = 'contain';
              e.target.style.background = isContactLens ? '#ffffff' : '#f9fafb';
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
          <h3 className="wp-product-name" style={{ justifyContent: 'center' }}><FormatProductName product={product} /></h3>
          <div style={{ textAlign: 'center', marginTop: '6px' }}>
            <span className="wp-product-price tabular-nums">${displayPrice.toLocaleString('es-MX')}{isContactLens ? ' / caja' : ''}</span>
          </div>
          {isFrame && (
            <p style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
              Armazón solo · desde ${minWithLenses.toLocaleString('es-MX')} con micas
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
