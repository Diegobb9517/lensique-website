const fs = require('fs');

// 1. Create Reveal.tsx
const revealContent = `import React, { useState, useEffect, useRef } from 'react';

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
        transition: shouldHide ? \`opacity 0.8s ease \${delay}s, transform 0.8s ease \${delay}s\` : 'none'
      }}
    >
      {children}
    </div>
  );
}
`;
fs.writeFileSync('src/components/Reveal.tsx', revealContent);

// 2. Modify App.tsx
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

if (!appTsx.includes("import Reveal")) {
  appTsx = appTsx.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport Reveal from './components/Reveal';");
}

// Replace micas cards
appTsx = appTsx.replace(
  /<motion\.div\s+className="wp-mica-lifestyle-card"\s+initial=\{\{ opacity: 0, y: 30 \}\}\s+whileInView=\{\{ opacity: 1, y: 0 \}\}\s+transition=\{\{ duration: 0\.8, delay: idx \* 0\.1 \}\}\s+viewport=\{\{ once: true \}\}\s+onClick=\{\(e: any\) => \{\s+e\.preventDefault\(\);\s+e\.stopPropagation\(\);\s+console\.log\('Opening modal for:', brick\.title\);\s+setSelectedMicaCard\(brick\);\s+\}\}\s+>\s+<img src=\{brick\.image\} alt=\{brick\.title\} className="wp-mica-img" loading="lazy" \/>\s+<div className="wp-mica-pill">\s+<span>\{brick\.title\}<\/span>\s+<\/div>\s+<\/motion\.div>/g,
  `<Reveal 
                        className="wp-mica-lifestyle-card"
                        delay={idx * 0.1}
                        onClick={(e: any) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          console.log('Opening modal for:', brick.title);
                          setSelectedMicaCard(brick); 
                        }}
                      >
                        <img src={brick.image} alt={brick.title} className="wp-mica-img" loading="lazy" />
                        <div className="wp-mica-pill">
                          <span>{brick.title}</span>
                        </div>
                      </Reveal>`
);

// Replace services cards
appTsx = appTsx.replace(
  /<motion\.div\s+className="wp-mica-lifestyle-card"\s+initial=\{\{ opacity: 0, y: 30 \}\}\s+whileInView=\{\{ opacity: 1, y: 0 \}\}\s+transition=\{\{ duration: 0\.8, delay: idx \* 0\.1 \}\}\s+viewport=\{\{ once: true \}\}\s+onClick=\{service\.action\}\s+>\s+<img src=\{service\.image\} alt=\{service\.title\} className="wp-mica-img" loading="lazy" \/>\s+<div className="wp-mica-pill">\s+<span>\{service\.title\}<\/span>\s+<\/div>\s+<\/motion\.div>/g,
  `<Reveal 
                  className="wp-mica-lifestyle-card"
                  delay={idx * 0.1}
                  onClick={service.action}
                >
                  <img src={service.image} alt={service.title} className="wp-mica-img" loading="lazy" />
                  <div className="wp-mica-pill">
                    <span>{service.title}</span>
                  </div>
                </Reveal>`
);

// Replace lifestyle banner
appTsx = appTsx.replace(
  /<motion\.div\s+className="lifestyle-banner"\s+initial=\{\{ opacity: 0, y: 30 \}\}\s+whileInView=\{\{ opacity: 1, y: 0 \}\}\s+transition=\{\{ duration: 0\.8 \}\}\s+viewport=\{\{ once: true \}\}\s+>/g,
  `<Reveal className="lifestyle-banner">`
);
appTsx = appTsx.replace(
  /<\/div>\s+<\/motion\.div>\s+<\/section>/g,
  `</div>\n          </Reveal>\n        </section>`
);

// BUG 3 fix: close modal before navigation and trigger popstate
appTsx = appTsx.replace(
  /setSelectedMicaCard\(null\);\s+setIsCotizadorGeneralOpen\(true\);\s+window\.history\.pushState\(\{\}, '', '\/cotizador'\);/,
  `setSelectedMicaCard(null);
              setIsCotizadorGeneralOpen(true);
              window.history.pushState({}, '', '/cotizador');
              window.dispatchEvent(new PopStateEvent('popstate'));`
);

fs.writeFileSync('src/App.tsx', appTsx);
console.log('App.tsx and Reveal.tsx updated.');
