import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ServiceInfoModal.css';

export interface ServiceInfoData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
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
        <div className="svc-modal-overlay" onClick={onClose}>
          <motion.div 
            className="svc-modal-content"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="svc-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
            
            <div className="svc-modal-image-container">
              <img src={service.image} alt={service.title} className="svc-modal-image" />
            </div>
            
            <div className="svc-modal-body">
              <h2 className="svc-modal-title">{service.title}</h2>
              <h3 className="svc-modal-subtitle">{service.subtitle}</h3>
              
              <div className="svc-modal-description" dangerouslySetInnerHTML={{ __html: service.description }} />
              
              <div className="svc-modal-actions">
                <button className="svc-primary-btn" onClick={service.onAction}>
                  {service.actionText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
