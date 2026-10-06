const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{currentPath === '\/micas' && \([\s\S]*?<LensExplainer onOpenCotizador=\{\(\) => setIsCotizadorGeneralOpen\(true\)\} \/>\s*<ProgressiveExplainer onOpenCotizador=\{\(\) => setIsCotizadorGeneralOpen\(true\)\} \/>\s*<\/div>\s*\)\}/;

const newHTML = `{currentPath === '/micas' && (
          <div style={{ paddingTop: '80px', backgroundColor: '#f8fafc', paddingBottom: '80px' }}>
            <section id="micas" className="wp-micas-lifestyle-section" style={{ padding: '80px 40px 80px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="wp-section-header" style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 'var(--max-width)', margin: '0 auto 40px' }}>
                <h1 className="wp-section-title" style={{ margin: 0, textAlign: 'center', fontFamily: '"Playfair Display", serif' }}>Tecnologías de visión</h1>
                <p style={{ margin: '8px 0 0', color: '#6e6e73', fontSize: '16px', textAlign: 'center' }}>Elige el tipo de mica; los tratamientos los decides al configurar.</p>
              </div>
              
              <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', width: '100%' }}>
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
                        onClick={(e: any) => { 
                          e.preventDefault(); 
                          setIsCotizadorGeneralOpen(true); 
                          window.history.pushState({}, '', '/cotizador'); 
                        }}
                      >
                        <div 
                          className="wp-mica-bg" 
                          style={{ backgroundImage: \`url(\${brick.image})\` }}
                        />
                        <div className="wp-mica-action-pill">{brick.title}</div>
                      </motion.div>
                      <p className="wp-mica-desc-outside">{brick.description}</p>
                    </div>
                  ))}
                </div>
                
                <div style={{ marginTop: '48px', textAlign: 'center' }}>
                  <p style={{ fontSize: '15px', color: '#6e6e73', margin: '0 0 32px' }}>Antirreflejante, filtro de luz azul, polarizado y adelgazado se eligen al configurar tus micas, con su precio a la vista.</p>
                  <a 
                    href="/cotizador" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      setIsCotizadorGeneralOpen(true); 
                      window.history.pushState({}, '', '/cotizador'); 
                    }}
                    style={{
                      display: 'inline-block',
                      background: '#1d1d1f',
                      color: '#ffffff',
                      padding: '16px 40px',
                      borderRadius: '980px',
                      fontSize: '17px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                  >
                    Cotizar mis micas
                  </a>
                </div>
              </div>
            </section>
          </div>
        )}`;

appTsx = appTsx.replace(regex, newHTML);

fs.writeFileSync('src/App.tsx', appTsx);
console.log('done TSX update for minimal micas');
