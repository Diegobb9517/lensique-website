import React from 'react';
import { getContactLensBrand, getContactLensSubtitle, getContactLensCardSpecs } from '../lib/productImages';
import { resolveImageUrl } from '../App';
import contactLensesImg from '../assets/contact_lenses.png';

interface ProductFallbackCardProps {
  product: any;
  variant?: 'compact' | 'detail';
  className?: string;
  style?: React.CSSProperties;
}

export const ProductFallbackCard: React.FC<ProductFallbackCardProps> = ({
  product,
  variant = 'compact',
  className = '',
  style
}) => {
  const brand = getContactLensBrand(product);
  const subtitle = getContactLensSubtitle(product);
  const specs = getContactLensCardSpecs(product);
  const displayName = String(product?.name || 'Lente de Contacto').replace(/\s*\(.*?\)\s*/g, '').trim();

  const isDetail = variant === 'detail';
  const rawImg = (product?.images && product.images.length > 0) ? product.images[0].image_url : (product?.image_url || product?.image);
  const imgSrc = resolveImageUrl(rawImg, contactLensesImg) || contactLensesImg;

  return (
    <div
      className={`cl-fallback-card ${isDetail ? 'cl-fallback-card--detail' : 'cl-fallback-card--compact'} ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: isDetail ? '260px' : '150px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center',
        background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
        border: '1px solid #e2e8f0',
        borderRadius: isDetail ? '16px' : '12px',
        padding: isDetail ? '24px 20px' : '12px 10px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Fondo óptico decorativo (anillos y reflejo sutil) */}
      <svg
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '180%',
          height: '180%',
          pointerEvents: 'none',
          opacity: 0.4
        }}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="70" stroke="url(#cardGrad)" strokeWidth="0.8" strokeDasharray="3 3" />
        <circle cx="100" cy="100" r="48" stroke="url(#cardGrad)" strokeWidth="0.6" />
        <defs>
          <linearGradient id="cardGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="1" stopColor="#06b6d4" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header: Marca y sello */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: isDetail ? '11px' : '9.5px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#1e3a8a',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          {brand}
        </span>

      </div>

      {/* Centro: Foto real del producto (caja) + Nombre */}
      <div style={{ position: 'relative', zIndex: 2, margin: isDetail ? '12px 0' : '6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img
          src={imgSrc}
          alt={displayName}
          style={{
            maxWidth: '100%',
            maxHeight: isDetail ? '180px' : '90px',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            marginBottom: isDetail ? '8px' : '4px'
          }}
          onError={(e: any) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = contactLensesImg;
          }}
        />

        <h4
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: isDetail ? '17px' : '13px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 2px 0',
            lineHeight: 1.2,
            maxWidth: isDetail ? '280px' : '180px'
          }}
        >
          {displayName}
        </h4>
        <span
          style={{
            fontSize: isDetail ? '12px' : '10px',
            color: '#64748b',
            lineHeight: 1.2
          }}
        >
          {subtitle}
        </span>
      </div>


    </div>
  );
};
