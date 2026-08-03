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

          <div className="sdp-main-content">
            {/* Premium Hero Section */}
            <div className="sdp-hero-section">
              <div className="sdp-hero-bg" style={{ backgroundImage: `url(${service.image})` }}></div>
              <div className="sdp-hero-overlay"></div>
              <div className="sdp-hero-text">
                <motion.h1 
                  initial={{ y: 30, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="sdp-title-large"
                >
                  {service.title}
                </motion.h1>
                <motion.h2 
                  initial={{ y: 30, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="sdp-subtitle-large"
                >
                  {service.subtitle}
                </motion.h2>
              </div>
            </div>

            <div className="sdp-content-grid">
              {/* Text Body */}
              <div className="sdp-text-column">
                <div 
                  className="sdp-description premium-description" 
                  dangerouslySetInnerHTML={{ __html: service.description }} 
                />
                
                <div className="sdp-action-container">
                  <button className="sdp-primary-btn glow-btn" onClick={service.onAction}>
                    {service.actionText}
                  </button>
                </div>
              </div>

              {/* Gallery Grid */}
              <div className="sdp-gallery-column">
                <motion.div 
                  className="sdp-image-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <img src={service.image} alt={service.title} className="sdp-gallery-img" />
                </motion.div>
                
                {service.gallery && service.gallery.map((img, idx) => (
                  <motion.div 
                    key={idx} 
                    className="sdp-image-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (idx * 0.1) }}
                  >
                    <img src={img} alt={`${service.title} - foto ${idx + 1}`} className="sdp-gallery-img" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
