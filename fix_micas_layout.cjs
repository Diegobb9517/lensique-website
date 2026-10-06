const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import for polarized image
if (!appTsx.includes('premiumPolarized')) {
  appTsx = appTsx.replace(
    /import premiumAntireflective from '\.\/assets\/premium_antireflective_1785865428939\.jpg';/,
    `import premiumAntireflective from './assets/premium_antireflective_1785865428939.jpg';\nimport premiumPolarized from './assets/premium_polarized_1785866183086.jpg';`
  );
}

// 2. Replace the micas section
const regex = /<section id="micas" className="wp-micas-lifestyle-section">[\s\S]*?<\/section>/;

const newHTML = `<section id="micas" className="wp-micas-lifestyle-section">
          <div className="wp-section-header" style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 'var(--max-width)', margin: '0 auto 40px' }}>
            <h1 className="wp-section-title" style={{ margin: 0, textAlign: 'center', fontFamily: '"Playfair Display", serif' }}>Tecnologías de visión</h1>
            <p style={{ margin: '8px 0 0', color: '#6e6e73', fontSize: '16px', textAlign: 'center' }}>Elige el tipo de mica y los tratamientos que necesitas.</p>
          </div>
          
          <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%' }}>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', margin: '0 0 24px', textAlign: 'left', color: '#1d1d1f' }}>Tipos de mica</h2>
            <div className="wp-micas-lifestyle-grid" ref={micasSliderRef}>
              {[
                { id: 'm1', title: 'Monofocales', description: 'Visión nítida en una sola distancia.', image: premiumMonofocal },
                { id: 'm2', title: 'Bifocales', description: 'Visión de cerca y de lejos en un solo lente.', image: premiumBifocal },
                { id: 'm4', title: 'Progresivos', description: 'Visión fluida en todas las distancias.', image: premiumProgressive },
                { id: 'm5', title: 'Fotocromático', description: 'Lentes que se adaptan a la luz solar.', image: premiumPhotochromic }
              ].map((brick: any, idx: number) => (
                <div key={\`mica-ls-\${idx}-\${brick.id}\`} className="wp-mica-wrapper">
                  <motion.div 
                    className="wp-mica-lifestyle-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => setSelectedTech(brick)}
                  >
                    <div 
                      className="wp-mica-bg" 
                      style={{ backgroundImage: \`url(\${resolveImageUrl(brick.image_url, brick.image)})\` }}
                    />
                    <div className="wp-mica-action-pill">{brick.title}</div>
                  </motion.div>
                  <p className="wp-mica-desc-outside">{brick.description}</p>
                </div>
              ))}
            </div>
            
            <div style={{ height: '64px' }}></div>
            
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '24px', margin: '0 0 24px', textAlign: 'left', color: '#1d1d1f' }}>Tratamientos y materiales</h2>
            <div className="wp-treatments-grid">
              {[
                { id: 'm8', title: 'Antirreflejantes', description: 'Tratamientos premium sin deslumbramientos.', image: premiumAntireflective },
                { id: 'm9', title: 'Polarizado', description: 'Protección superior contra reflejos.', image: premiumPolarized },
                { id: 'm6', title: 'Luz azul', description: 'Protección para pantallas digitales.', image: premiumBluelight }
              ].map((brick: any, idx: number) => (
                <div key={\`mica-ls-treat-\${idx}-\${brick.id}\`} className="wp-mica-wrapper">
                  <motion.div 
                    className="wp-mica-lifestyle-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => setSelectedTech(brick)}
                  >
                    <div 
                      className="wp-mica-bg" 
                      style={{ backgroundImage: \`url(\${resolveImageUrl(brick.image_url, brick.image)})\` }}
                    />
                    <div className="wp-mica-action-pill">{brick.title}</div>
                  </motion.div>
                  <p className="wp-mica-desc-outside">{brick.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>`;

appTsx = appTsx.replace(regex, newHTML);

fs.writeFileSync('src/App.tsx', appTsx);
console.log('done TSX update');
