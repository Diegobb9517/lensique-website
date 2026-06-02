import React, { useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './InfoPage.css';

export interface InfoPageData {
  title: string;
  layout?: 'default' | 'grid';
  sections: {
    heading?: string;
    icon?: React.ElementType;
    content: React.ReactNode;
  }[];
}

interface InfoPageProps {
  isOpen: boolean;
  onClose: () => void;
  data: InfoPageData | null;
}

export default function InfoPage({ isOpen, onClose, data }: InfoPageProps) {
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

  if (!isOpen || !data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="info-page-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="ip-header">
            <button className="ip-back-btn" onClick={onClose}>
              <ChevronLeft size={24} />
              <span>Volver</span>
            </button>
            <h2 className="ip-header-title">{data.title}</h2>
            <div style={{ width: 100 }}></div>
          </div>

          <div className="ip-content-wrapper">
            <div className={`ip-sections ${data.layout === 'grid' ? 'ip-grid' : ''}`}>
              {data.sections.map((section, index) => (
                <div key={index} className="ip-section">
                  {section.icon && (
                    <div className="ip-section-icon">
                      <section.icon size={32} strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="ip-section-content">
                    {section.heading && <h3>{section.heading}</h3>}
                    <div className="ip-text">
                      {section.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
