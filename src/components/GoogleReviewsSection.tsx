import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GOOGLE_REVIEWS, GOOGLE_REVIEWS_STATS, type GoogleReview } from '../data/googleReviews';
import './GoogleReviewsSection.css';

// Logo oficial multicolor de Google (SVG)
const GoogleLogoSVG: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-3.9H24v7.1h12c-.2 1.8-1.5 4.6-4.3 6.5l6.6 5.1C42.2 41.4 45 33.4 45 24z"/>
    <path fill="#34A853" d="M24 46c5.9 0 10.8-1.9 14.4-5.3l-6.6-5.1c-1.8 1.2-4.1 2-7.8 2-6 0-11-4-12.8-9.5l-6.8 5.3C7.9 40.8 15.3 46 24 46z"/>
    <path fill="#FBBC05" d="M11.2 28.1c-.5-1.4-.7-2.8-.7-4.1s.3-2.8.7-4.1l-6.8-5.3C3 17.3 2.3 20.5 2.3 24s.8 6.7 2.1 9.4l6.8-5.3z"/>
    <path fill="#EA4335" d="M24 10.5c3.3 0 5.6 1.4 6.9 2.6l5.8-5.7C33.2 4.1 28.9 2 24 2 15.3 2 7.9 7.2 4.4 14.6l6.8 5.3C13 14.5 18 10.5 24 10.5z"/>
  </svg>
);

const getInitial = (name: string): string => {
  const trimmed = (name || '').trim();
  return trimmed ? trimmed[0].toUpperCase() : '·';
};

export const GoogleReviewsSection: React.FC = () => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 900;
    }
    return false;
  });

  const [page, setPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Contador dinámico al entrar en pantalla
  const [rating, setRating] = useState('0.0');
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Detección responsiva de ancho de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const perView = isMobile ? 1 : 3;
  const totalPages = Math.ceil(GOOGLE_REVIEWS.length / perView);

  // Animación de conteo con IntersectionObserver
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);

            const targetRating = GOOGLE_REVIEWS_STATS.rating; // 4.9
            const targetCount = GOOGLE_REVIEWS_STATS.totalOpiniones; // 63
            const duration = 1300;
            const start = performance.now();

            const animate = (now: number) => {
              const p = Math.min((now - start) / duration, 1);
              const ease = 1 - Math.pow(1 - p, 3); // Ease-out cubic

              const currentR = targetRating * ease;
              const currentC = Math.round(targetCount * ease);

              setRating(currentR.toFixed(1));
              setCount(currentC);

              if (p < 1) {
                requestAnimationFrame(animate);
              } else {
                setRating(targetRating.toFixed(1));
                setCount(targetCount);
              }
            };

            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Transición suave entre páginas
  const changePage = useCallback((newPageGetter: (prev: number) => number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setPage(newPageGetter);
      setIsTransitioning(false);
    }, 200);
  }, []);

  const nextPage = useCallback(() => {
    changePage((prev) => (prev + 1) % totalPages);
  }, [changePage, totalPages]);

  const prevPage = useCallback(() => {
    changePage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [changePage, totalPages]);

  // Auto-rotación cada 5 segundos (pausa con hover o toque)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextPage();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextPage]);

  // Tarjetas visibles en la página actual
  const currentReviews = useMemo(() => {
    const start = page * perView;
    return Array.from({ length: perView }, (_, idx) => {
      return GOOGLE_REVIEWS[(start + idx) % GOOGLE_REVIEWS.length];
    });
  }, [page, perView]);

  // Soporte táctil en móvil (swipe opcional + pausa)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current !== null) {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (diff > 50) {
        nextPage();
      } else if (diff < -50) {
        prevPage();
      }
    }
    touchStartX.current = null;
  };

  return (
    <section 
      ref={sectionRef}
      className="reviews-section" 
      aria-label="Reseñas de Google"
    >
      <div className="reviews-container">
        <span className="reviews-eyebrow">Lo que dicen nuestros pacientes</span>
        <h2 className="reviews-title">Tu visión es nuestra prioridad</h2>

        {/* Contador dinámico animado: 4.9 ★ · 63 opiniones */}
        <div className="reviews-stat-bar">
          <span className="reviews-rnum">{rating}</span>
          <span className="reviews-rstars">★★★★★</span>
          <span className="reviews-rcount">
            <b>{count}</b> opiniones
          </span>
          <span className="reviews-gpill">
            <GoogleLogoSVG size={15} /> Google
          </span>
        </div>

        {/* Carrusel automático sin controles visibles (sin flechas ni puntitos) */}
        <div 
          className="reviews-carousel-wrap"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="reviews-track-grid"
            style={{
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(4px)' : 'translateY(0)',
              transition: 'opacity 0.22s ease, transform 0.22s ease'
            }}
          >
            {currentReviews.map((r: GoogleReview, index: number) => (
              <div className="resena-card-uniform" key={`${r.id}-${index}`}>
                <div className="resena-card-stars">★★★★★</div>
                <blockquote className="resena-card-quote">
                  “{r.texto}”
                </blockquote>
                <div className="resena-card-who">
                  <div className="resena-card-av">{getInitial(r.nombre)}</div>
                  <div className="resena-card-meta">
                    <div className="resena-card-name">{r.nombre}</div>
                    <div className="resena-card-source">
                      <GoogleLogoSVG size={13} /> {r.fuente || 'Reseña en Google'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="reviews-footer-note">
          Reseñas reales verificadas y publicadas por pacientes en Google
        </p>
      </div>
    </section>
  );
};

export default GoogleReviewsSection;
