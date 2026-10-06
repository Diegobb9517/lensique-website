const fs = require('fs');
let c = fs.readFileSync('src/components/ProductCarousel.tsx', 'utf8');
c = c.replace('hideTryOn?: boolean;', 'hideTryOn?: boolean;\n  isContactLens?: boolean;');
c = c.replace('export default function ProductCarousel({ images, alt, hideTryOn }: ProductCarouselProps) {', 'export default function ProductCarousel({ images, alt, hideTryOn, isContactLens }: ProductCarouselProps) {');
c = c.replace('<div className="lsq-img-stack" onClick={() => setShowLightbox(true)}>', '<div className={`lsq-img-stack ${isContactLens ? "is-contact-lens" : ""}`} onClick={() => setShowLightbox(true)}>');
fs.writeFileSync('src/components/ProductCarousel.tsx', c);
