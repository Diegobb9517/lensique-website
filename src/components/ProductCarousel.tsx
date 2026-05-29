import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCarouselProps {
  images: Array<{ id: number; image_url: string }>;
  alt: string;
  hideTryOn?: boolean;
}

export default function ProductCarousel({ images, alt, hideTryOn }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Scroll thumbnails into view when index changes
  useEffect(() => {
    if (thumbnailRefs.current[currentIndex]) {
      thumbnailRefs.current[currentIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentIndex]);

  if (!images || images.length === 0) {
    return (
      <div className="lsq-carousel-root" style={{ alignItems: 'center', justifyContent: 'center', background: '#f7f7f7', borderRadius: '20px', minHeight: '400px' }}>
        <span style={{ color: '#A0A0A0', fontWeight: 500 }}>Sin imágenes</span>
      </div>
    );
  }

  const next = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <style>{`
        .lsq-carousel-root {
          display: flex !important;
          flex-direction: row !important;
          gap: 24px !important;
          width: 100% !important;
          height: 520px !important; 
          max-height: 100% !important;
          overflow: hidden !important;
          position: relative !important;
          background: #fff !important;
        }

        .lsq-thumbs-col {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
          width: 84px !important;
          height: 100% !important;
          overflow-y: auto !important;
          padding-right: 4px !important;
          flex-shrink: 0 !important;
        }

        .lsq-thumbs-col::-webkit-scrollbar { display: none; }

        .lsq-thumb-btn {
          width: 72px !important;
          height: 72px !important;
          border-radius: 12px !important;
          border: 2px solid transparent !important;
          background: #f8f8f8 !important;
          padding: 4px !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          flex-shrink: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
        }

        .lsq-thumb-btn.active {
          border-color: #000 !important;
          background: #fff !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
        }

        .lsq-thumb-btn img {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
        }

        .lsq-main-viewport {
          position: relative !important;
          flex: 1 !important;
          height: 100% !important;
          background: #fff !important;
          border-radius: 20px !important;
          border: 1px solid rgba(0,0,0,0.06) !important;
          overflow: hidden !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .lsq-img-stack {
          position: absolute !important;
          inset: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 40px !important;
          z-index: 10 !important;
        }

        .lsq-img-stack img {
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
        }

        .lsq-nav-arrow {
          position: absolute !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 54px !important;
          height: 54px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.6) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(255, 255, 255, 0.8) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          z-index: 50 !important;
          transition: all 0.3s !important;
          color: #1d1d1f !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;
        }

        .lsq-nav-arrow:hover {
          background: rgba(255, 255, 255, 1) !important;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
          transform: translateY(-50%) scale(1.05) !important;
        }

        .lsq-arrow-left { left: 24px !important; }
        .lsq-arrow-right { right: 24px !important; }

        .lsq-try-on-tag {
          position: absolute !important;
          top: 24px !important;
          right: 24px !important;
          background: #0047BB !important;
          color: #fff !important;
          padding: 10px 20px !important;
          border-radius: 40px !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          z-index: 60 !important;
          border: none !important;
          box-shadow: 0 4px 12px rgba(0, 71, 187, 0.2) !important;
        }

        .lsq-v-indicator {
          position: absolute !important;
          bottom: 12px !important;
          left: 12px !important;
          font-size: 9px !important;
          color: #ccc !important;
          z-index: 100 !important;
          pointer-events: none !important;
        }

        @media (max-width: 768px) {
          .lsq-carousel-root { flex-direction: column !important; height: auto !important; }
          .lsq-thumbs-col { flex-direction: row !important; width: 100% !important; height: 84px !important; order: 2 !important; }
          .lsq-main-viewport { height: 350px !important; order: 1 !important; flex: none !important; }
        }
      `}</style>

      <div className="lsq-carousel-root">
        {/* Version Indicator */}
        <span className="lsq-v-indicator">CAROUSEL V2.1 - BLINDADO</span>
        
        {/* Thumbnails Column (Left) */}
        {images.length > 1 && (
          <div className="lsq-thumbs-col">
            {images.map((img, idx) => (
              <button
                key={img.id}
                ref={(el) => (thumbnailRefs.current[idx] = el)}
                onClick={() => setCurrentIndex(idx)}
                className={`lsq-thumb-btn ${idx === currentIndex ? 'active' : ''}`}
              >
                <img src={img.image_url} alt={`Vista ${idx + 1}`} />
              </button>
            ))}
          </div>
        )}

        {/* Main Viewport */}
        <div className="lsq-main-viewport">
          
          <div className="lsq-img-stack" onClick={() => setShowLightbox(true)}>
            <AnimatePresence mode="wait">
              <motion.img
                key={images[currentIndex].id}
                src={images[currentIndex].image_url}
                alt={`${alt} - Vista ${currentIndex + 1}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                style={{ cursor: 'zoom-in' }}
              />
            </AnimatePresence>
          </div>

          {/* Try On Button */}
          {!hideTryOn && (
            <button className="lsq-try-on-tag">
              <Camera size={16} />
              <span>Prueba virtual</span>
            </button>
          )}

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button className="lsq-nav-arrow lsq-arrow-left" onClick={prev}>
                <ChevronLeft size={32} strokeWidth={1.5} />
              </button>
              <button className="lsq-nav-arrow lsq-arrow-right" onClick={next}>
                <ChevronRight size={32} strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Expand Icon */}
          <div 
            onClick={() => setShowLightbox(true)}
            style={{ position: 'absolute', bottom: '24px', right: '24px', cursor: 'pointer', opacity: 0.4, zIndex: 50 }}
          >
            <Maximize2 size={24} />
          </div>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {showLightbox && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ 
                position: 'fixed', inset: 0, zIndex: 10000, background: '#fff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' 
              }}
              onClick={() => setShowLightbox(false)}
            >
              <button
                onClick={() => setShowLightbox(false)}
                style={{ position: 'absolute', top: '30px', right: '30px', border: 'none', background: 'transparent', cursor: 'pointer' }}
              >
                <X size={32} />
              </button>

              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.img
                  key={`lb-${images[currentIndex].id}`}
                  src={images[currentIndex].image_url}
                  alt={alt}
                  style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
