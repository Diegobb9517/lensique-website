import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './LensConfiguratorModal.css';

interface LensConfiguratorModalProps {
  product: any;
  catalogData?: any[];
  onClose: () => void;
  onComplete: (config: any) => void;
}

export default function LensConfiguratorModal({
  product,
  onClose,
  onComplete
}: LensConfiguratorModalProps) {
  const hasProcessed = React.useRef(false);
  const [iframeLoaded, setIframeLoaded] = React.useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Allow messages from the same origin iframe
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'lensique-lead') {
        if ((window as any).fbq) {
          (window as any).fbq('track', 'Lead');
        }
        return;
      }

      if (event.data?.source === 'lensique-asesor' && event.data?.type === 'ready') {
        setIframeLoaded(true);
      }
      if (event.data?.type === 'lensique-mica') {
        if (hasProcessed.current) return;
        
        const payload = event.data.payload;
        if (payload) {
          hasProcessed.current = true;
          // Pass both the ZEISS payload and the original product being purchased
          onComplete({
            ...payload,
            originalProduct: product
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onComplete, product]);

  return (
    <AnimatePresence>
      <motion.div 
        className="config-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ zIndex: 9999 }}
      >
        <motion.div 
          className="config-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{ 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            background: 'var(--bg, #f1ede5)',
            padding: 0
          }}
        >
          <button 
            onClick={onClose} 
            style={{ 
              position: 'absolute', 
              top: '16px', 
              right: '20px', 
              zIndex: 100, 
              background: '#fff', 
              borderRadius: '50%', 
              padding: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={24} color="#1b2436" />
          </button>
          
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: iframeLoaded ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1, backgroundColor: '#f8fafc' }}>
             <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
             <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 500 }}>Cargando configurador...</p>
          </div>

          <iframe 
            
            src={`/asesor_zeiss.html?v=1.0.5&framePrice=${product?.price_incl_tax || product?.price || 0}&isPreorder=${(product?.stock != null && product.stock !== '' && Number(product.stock) <= 0) ? 'true' : 'false'}`}
            title="Asesor Visual ZEISS"
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'inherit', position: 'relative', zIndex: 2, opacity: iframeLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
            onLoad={() => setIframeLoaded(true)}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
