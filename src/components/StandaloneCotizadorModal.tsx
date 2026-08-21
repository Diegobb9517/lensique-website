import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './LensConfiguratorModal.css';

interface StandaloneCotizadorModalProps {
  onClose: () => void;
  onComplete: (config: any) => void;
}

export default function StandaloneCotizadorModal({
  onClose,
  onComplete
}: StandaloneCotizadorModalProps) {
  const hasProcessed = React.useRef(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Allow messages from the same origin iframe
      if (event.data?.type === 'lensique-mica') {
        if (hasProcessed.current) return;
        
        const payload = event.data.payload;
        if (payload) {
          hasProcessed.current = true;
          onComplete(payload);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onComplete]);

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
          
          <iframe 
            src="/asesor_zeiss.html?v=1.0.2"
            title="Asesor Visual ZEISS"
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'inherit' }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
