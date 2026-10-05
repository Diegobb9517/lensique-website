import React, { useState, useEffect, useRef } from 'react';

export default function Reveal({ children, className, style, delay = 0, onClick }: any) {
  const [shouldHide, setShouldHide] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.getBoundingClientRect().top > window.innerHeight) {
      setShouldHide(true);
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          observer.disconnect();
        }
      }, { threshold: 0.1 });
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, []);

  const isHidden = shouldHide && !hasRevealed;

  return (
    <div 
      ref={ref} 
      className={className}
      onClick={onClick}
      style={{
        ...style,
        opacity: isHidden ? 0 : 1,
        transform: isHidden ? 'translateY(30px)' : 'translateY(0)',
        transition: shouldHide ? `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s` : 'none'
      }}
    >
      {children}
    </div>
  );
}
