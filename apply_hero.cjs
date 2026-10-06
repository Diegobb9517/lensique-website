const fs = require('fs');

// 1. Update App.tsx
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// Replace heroImg fallback usage with '/hero-desktop.jpg'
appTsx = appTsx.replace(/import heroImg from '\.\/assets\/hero_glasses\.jpg';/, "const heroImg = '/hero-desktop.jpg';");

// Replace hero section image
const heroRegex = /<section className="hero">\s*<img[\s\S]*?className="hero-background-img"[\s\S]*?\}\s*\/>/m;
const heroReplacement = `<section className="hero">
          <picture style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <source srcSet="/hero-mobile.webp" media="(max-width: 768px)" width="1080" height="1350" />
            <img 
              src="/hero-desktop.webp" 
              alt="Persona probándose lentes en una óptica" 
              className="hero-background-img"
              loading="eager"
              fetchpriority="high"
              width="1920"
              height="1080"
              style={{ position: 'relative' }}
            />
          </picture>`;
appTsx = appTsx.replace(heroRegex, heroReplacement);
fs.writeFileSync('src/App.tsx', appTsx);

// 2. Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/hero_glasses\.jpg/g, 'hero-desktop.jpg');
fs.writeFileSync('index.html', indexHtml);

// 3. Update App.css for gradient overlay
let appCss = fs.readFileSync('src/App.css', 'utf8');
const gradientCss = `\n.hero::before {\n  content: '';\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%);\n  z-index: 1;\n}\n`;

if (!appCss.includes('.hero::before')) {
  appCss = appCss.replace('.hero-background-img {', gradientCss + '\n.hero-background-img {');
  fs.writeFileSync('src/App.css', appCss);
}

console.log('Frontend updated.');
