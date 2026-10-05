import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ServiceInfoData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gallery?: string[];
  actionText: string;
  onAction: () => void;
}

interface ServiceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceInfoData | null;
}

export default function ServiceInfoModal({ isOpen, onClose, service }: ServiceInfoModalProps) {
  if (!isOpen || !service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="product-detail-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ zIndex: 1000, position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <motion.div
            className="product-detail-modal mica-modal-override"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', background: '#fff', borderRadius: '24px', overflow: 'hidden', width: '100%', maxWidth: '1100px', maxHeight: '90vh', position: 'relative' }}
          >
            <button className="product-detail-close" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.8)', border: 'none', cursor: 'pointer', zIndex: 10, width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
              <X size={20} />
            </button>

            {/* Left Column: Image */}
            <div className="product-detail-img-col" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
              <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Right Column: Info */}
            <div className="product-detail-info-col" style={{ padding: '40px', overflowY: 'auto' }}>
              <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', margin: '0 0 8px', color: '#1d1d1f' }}>{service.title}</h2>
              <h3 style={{ fontSize: '18px', color: '#6e6e73', margin: '0 0 32px', fontWeight: 500 }}>{service.subtitle}</h3>

              <div 
                style={{ fontSize: '15px', color: '#4a4a4f', lineHeight: 1.6, marginBottom: '32px' }}
                dangerouslySetInnerHTML={{ __html: service.description }} 
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button 
                  onClick={service.onAction}
                  style={{ width: '100%', padding: '16px', borderRadius: '980px', background: '#1d1d1f', color: '#fff', fontSize: '16px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  {service.actionText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
