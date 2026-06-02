import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type ServiceInfoData } from './ServiceInfoModal';
import './ServiceDetailsPage.css';

interface ServiceDetailsPageProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceInfoData | null;
}

export default function ServiceDetailsPage({ isOpen, onClose, service }: ServiceDetailsPageProps) {
  useEffect(() => {
    if (isOpen) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="service-details-page"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Header */}
          <div className="sdp-header">
            <button className="sdp-back-btn" onClick={onClose}>
              <ChevronLeft size={24} /> <span>Volver</span>
            </button>
            <div className="sdp-header-title">{service.title}</div>
          </div>

          <div className="sdp-content-wrapper">
            {/* Hero Image */}
            <div className="sdp-hero-image-container">
              <img src={service.image} alt={service.title} className="sdp-hero-image" />
            </div>

            {/* Content Body */}
            <div className="sdp-body">
              <h1 className="sdp-title">{service.title}</h1>
              <h2 className="sdp-subtitle">{service.subtitle}</h2>

              <div 
                className="sdp-description" 
                dangerouslySetInnerHTML={{ __html: service.description }} 
              />

              {service.gallery && service.gallery.length > 0 && (
                <div className="sdp-gallery">
                  {service.gallery.map((img, idx) => (
                    <img key={idx} src={img} alt={`${service.title} - foto ${idx + 1}`} className="sdp-gallery-img" />
                  ))}
                </div>
              )}

              {/* Action Button */}
              <div className="sdp-action-container">
                <button className="sdp-primary-btn" onClick={service.onAction}>
                  {service.actionText}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
