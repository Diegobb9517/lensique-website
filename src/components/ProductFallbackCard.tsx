import React from 'react';
import { getContactLensBrand, getContactLensSubtitle, getContactLensCardSpecs } from '../lib/productImages';

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
        <span
          style={{
            fontSize: isDetail ? '10px' : '8.5px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: '#16a34a',
            background: 'rgba(240, 253, 244, 0.95)',
            border: '1px solid rgba(187, 247, 208, 0.8)',
            padding: isDetail ? '2px 8px' : '1px 6px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}
        >
          ✓ Original
        </span>
      </div>

      {/* Centro: Gráfico vector del lente + Nombre */}
      <div style={{ position: 'relative', zIndex: 2, margin: isDetail ? '12px 0' : '6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg
          width={isDetail ? 64 : 42}
          height={isDetail ? 40 : 28}
          viewBox="0 0 64 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 4px 10px rgba(37, 99, 235, 0.15))', marginBottom: isDetail ? '8px' : '4px' }}
        >
          {/* Menisco curvado del lente de contacto */}
          <path
            d="M 6 12 C 18 32, 46 32, 58 12 C 48 24, 16 24, 6 12 Z"
            fill="url(#lensFill)"
            stroke="url(#lensStroke)"
            strokeWidth="1.5"
          />
          {/* Reflejo superior del lente */}
          <path
            d="M 12 15 C 22 23, 42 23, 52 15"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.8"
          />
          <defs>
            <linearGradient id="lensFill" x1="6" y1="12" x2="58" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60a5fa" stopOpacity="0.45" />
              <stop offset="0.6" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="1" stopColor="#06b6d4" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="lensStroke" x1="6" y1="12" x2="58" y2="12" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563eb" />
              <stop offset="0.5" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          </defs>
        </svg>

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

      {/* Footer: Especificaciones ópticas del empaque */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: isDetail ? '6px' : '4px',
          width: '100%'
        }}
      >
        <span
          style={{
            fontSize: isDetail ? '10.5px' : '9px',
            fontWeight: 600,
            color: '#334155',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #cbd5e1',
            borderRadius: '999px',
            padding: isDetail ? '3px 8px' : '2px 6px',
            whiteSpace: 'nowrap'
          }}
        >
          {specs.bc} · {specs.dia}
        </span>
        <span
          style={{
            fontSize: isDetail ? '10.5px' : '9px',
            fontWeight: 500,
            color: '#475569',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #cbd5e1',
            borderRadius: '999px',
            padding: isDetail ? '3px 8px' : '2px 6px',
            whiteSpace: 'nowrap'
          }}
        >
          {specs.usage}
        </span>
      </div>
    </div>
  );
};
