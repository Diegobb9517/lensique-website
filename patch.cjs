const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add currentPath state to App
if (!code.includes('const [currentPath,')) {
    code = code.replace('function App() {', `function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // SEO Update
  useEffect(() => {
    let title = "Óptica en Zapopan | Examen de vista gratis y lentes | Lensique";
    let desc = "Lentes graduados, examen de la vista gratis y armazones de marca en Zapopan...";
    let canonical = \`https://www.lensique.com.mx\${currentPath}\`;

    if (currentPath === '/armazones') {
      title = "Armazones y Lentes Graduados | Óptica Lensique Zapopan";
      desc = "Más de 130 modelos de armazones de marca: Ray-Ban, Vogue, Carrera, Lacoste, Calvin Klein y Puma. Graduación a tu medida. Envío gratis en compras mayores a $2,500.";
    } else if (currentPath === '/cotizador') {
      title = "Cotizador de Micas y Lentes Graduados | Óptica Lensique Zapopan";
      desc = "Calcula el costo de tus micas en menos de un minuto. Monofocales, progresivos, antirreflejante y filtro azul. Óptica en Zapopan.";
    } else if (currentPath === '/lentes-de-contacto') {
      title = "Lentes de Contacto en Zapopan | Óptica Lensique";
      desc = "Lentes de contacto blandos, tóricos para astigmatismo y multifocales. Acuvue, Biotrue, Bausch + Lomb, Biofinity y Clariti. Adaptación con oftalmólogo en Zapopan.";
    }

    if (['/armazones', '/cotizador', '/lentes-de-contacto'].includes(currentPath)) {
        document.title = title;
        let descEl = document.querySelector('meta[name="description"]');
        if (descEl) descEl.setAttribute('content', desc);
        let canonicalEl = document.querySelector('link[rel="canonical"]');
        if (!canonicalEl) {
          canonicalEl = document.createElement('link');
          canonicalEl.setAttribute('rel', 'canonical');
          document.head.appendChild(canonicalEl);
        }
        canonicalEl.setAttribute('href', canonical);
    }
  }, [currentPath]);
`);
}

// 2. Prevent handleUrlRoute from opening modals for these exact routes, since they will be inline now.
// wait, handleUrlRoute is doing:
// else if (path === '/cotizador') { setIsCotizadorGeneralOpen(true); }
// else if (path.startsWith('/marca/')) { window.history.pushState(null, '', '/armazones'); ... setIsCatalogOpen(true); }
// We can just keep handleUrlRoute doing its thing for /marca/ but remove the /cotizador and /armazones logic that opens modals.
code = code.replace(/else if \(path === '\/cotizador'\) \{[\s\S]*?setIsCotizadorGeneralOpen\(true\);[\s\S]*?\}/g, '');
// For /marca/:
// path.startsWith('/marca/') we can leave it to redirect to /armazones but wait! The user wants /armazones to show the catalog. If it redirects, it updates path. So currentPath becomes /armazones. That's fine.

// 3. Make FullCatalog accept isStandalone
code = code.replace(/function FullCatalog\(\{\s*isOpen,\s*onClose,\s*onViewProduct,\s*onTryOn,\s*catalogData,\s*initialFilter = 'Todas',\s*initialSearchQuery = '',\s*initialBrand = 'Todas',\s*onConfigureProduct\s*\}\:\s*\{/g, 
`function FullCatalog({ 
    isOpen, 
    onClose, 
    onViewProduct, 
    onTryOn,
    catalogData, 
    initialFilter = 'Todas',
    initialSearchQuery = '',
    initialBrand = 'Todas',
    onConfigureProduct,
    isStandalone = false
  }: { 
    isOpen: boolean, 
    onClose: () => void, 
    onViewProduct: (product: any) => void,
    onConfigureProduct: (product: any) => void,
    onTryOn: (product: any) => void,
    catalogData: any[], 
    initialFilter?: string,
    initialSearchQuery?: string,
    initialBrand?: string,
    isStandalone?: boolean`);

// Modify FullCatalog className and structure
// <motion.div className="full-catalog-view"> => <motion.div className={isStandalone ? "full-catalog-view standalone" : "full-catalog-view"} style={isStandalone ? {position:'relative', zIndex:1} : {}}>
code = code.replace(/className="full-catalog-view"/g, 'className={isStandalone ? "full-catalog-view standalone" : "full-catalog-view"} style={isStandalone ? {position:"relative", zIndex:1, height:"auto", minHeight:"100vh"} : {}}');
// Hide topbar in standalone
code = code.replace(/className="catalog-topbar"/g, 'className="catalog-topbar" style={{ display: isStandalone ? "none" : "flex", ...');

// 4. Modify StandaloneCotizadorModal to accept isInline
code = code.replace(/function StandaloneCotizadorModal\(\{ onClose, onComplete \}\:\s*\{/g, `function StandaloneCotizadorModal({ onClose, onComplete, isInline = false }: {`);
code = code.replace(/className="standalone-cotizador-overlay"/g, 'className={isInline ? "standalone-cotizador-overlay inline-mode" : "standalone-cotizador-overlay"} style={isInline ? {position:"relative", zIndex:1, background:"transparent", padding:0} : {}}');
code = code.replace(/className="standalone-cotizador-modal"/g, 'className="standalone-cotizador-modal" style={isInline ? {boxShadow:"none", maxWidth:"100%"} : {}}');
// Hide close button in inline
code = code.replace(/className="close-cotizador-btn"/g, 'className="close-cotizador-btn" style={{ display: isInline ? "none" : "flex" }}');

// 5. Wrap <main> content
// In App(), find `<main>` and change to conditional rendering.
// Find the exact <main> tag.
const mainStartIndex = code.indexOf('<main>');
if (mainStartIndex !== -1) {
    const mainStr = `<main>
        {currentPath === '/armazones' && (
          <div style={{ paddingTop: '80px', backgroundColor: '#f8fafc' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1d1d1f', margin: '0 20px', textAlign: 'center', marginBottom: '20px' }}>Armazones y lentes graduados en Zapopan</h1>
            <FullCatalog 
              isOpen={true} 
              isStandalone={true}
              onClose={() => {}} 
              catalogData={safeJsonParse(settings.full_catalog_data)}
              initialFilter="Armazones"
              onViewProduct={(prod) => {
                setSelectedProductDetail(prod);
                setIsCatalogOpen(false);
              }}
              onConfigureProduct={(prod) => {
                setConfiguratorProduct(prod);
                setIsCatalogOpen(false);
              }}
              onTryOn={(prod) => {
                setTryOnProduct(prod);
                setIsTryOnOpen(true);
                setIsCatalogOpen(false);
              }}
            />
            <section className="statement-banner-section" style={{ marginTop: '0' }}>
              <div className="statement-block">
                <span className="statement-eyebrow">Garantía Lensique</span>
                <p className="statement-headline">Tu visión perfecta, garantizada.</p>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
                    <div style={{ textAlign: 'center', maxWidth: '200px' }}>
                        <Shield size={32} color="#0066cc" style={{ margin: '0 auto 10px' }} />
                        <h4 style={{ fontWeight: 600 }}>Garantía de adaptación</h4>
                        <p style={{ fontSize: '14px', color: '#515154' }}>30 días para adaptarte a tu graduación.</p>
                    </div>
                </div>
                <button className="btn btn-wp-primary" onClick={() => handleOpenBooking()} style={{ marginTop: '30px' }}>Agendar cita</button>
              </div>
            </section>
          </div>
        )}

        {currentPath === '/cotizador' && (
          <div style={{ paddingTop: '80px', backgroundColor: '#f8fafc', paddingBottom: '80px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1d1d1f', margin: '0 20px 40px', textAlign: 'center' }}>Cotiza tus micas en menos de un minuto</h1>
            <StandaloneCotizadorModal 
              isInline={true}
              onClose={() => {}}
              onComplete={(config) => {
                let configText = \`Hola, quiero cotizar mis micas. Esto fue lo que seleccioné en el cotizador:\\n\`;
                if (config.etiqueta) configText += \`- \${config.etiqueta} (Índice \${config.indice})\\n\`;
                if (config.tratamientos && config.tratamientos.length > 0) configText += \`- Tratamientos: \${config.tratamientos.join(', ')}\\n\`;
                if (config.material) configText += \`- Material sugerido: \${config.material}\\n\`;
                if (config.precioCalculado) configText += \`\\nPrecio estimado: \${config.precioCalculado}\\n\`;
                
                const url = \`https://api.whatsapp.com/send?phone=523316929111&text=\${encodeURIComponent(configText)}\`;
                window.open(url, '_blank');
              }}
            />
          </div>
        )}

        {currentPath === '/lentes-de-contacto' && (
          <div style={{ paddingTop: '80px', backgroundColor: '#ffffff', paddingBottom: '80px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1d1d1f', margin: '0 20px 40px', textAlign: 'center' }}>Lentes de contacto en Zapopan</h1>
            
            <section className="contact-cta-section" style={{ padding: '40px 20px', background: '#f0fdf4', color: '#166534', textAlign: 'center', marginBottom: '40px' }}>
              <div className="contact-cta-content" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h3 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 600 }}>Adaptación Profesional</h3>
                <p style={{ fontSize: '16px', color: '#166534', marginBottom: '20px' }}>
                  Los lentes de contacto requieren adaptación, no solo graduación. La adaptación la realiza un oftalmólogo y el examen no tiene costo al comprar tus lentes con nosotros.
                </p>
                <a 
                  href="https://api.whatsapp.com/send?phone=523316929111&text=Hola,%20tengo%20dudas%20sobre%20lentes%20de%20contacto"
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-wp-primary" 
                  style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  Dudas por WhatsApp
                </a>
              </div>
            </section>

            <div className="wp-carousel-grid" style={{ maxWidth: '1200px', margin: '0 auto 60px', padding: '0 20px' }}>
              {safeJsonParse(settings.featured_contact_lenses).map((product: any, idx: number) => (
                <div 
                  key={\`contact-\${idx}-\${product.id}\`}
                  className="wp-product-card"
                  onClick={() => setSelectedProductDetail(product)}
                >
                  <div className="wp-product-image-wrapper">
                    <img src={resolveImageUrl(product.image_url, product.image)} alt={product.name} className="wp-product-image" loading="lazy" />
                  </div>
                  <div className="wp-product-info">
                    <div className="wp-product-title">{product.name}</div>
                    <div className="wp-product-price">{product.price ? \`$\${product.price}\` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'center' }}>
                <button className="btn btn-wp-secondary" onClick={() => setIsContactQuizOpen(true)}>
                  Iniciar guía interactiva
                </button>
            </div>
          </div>
        )}

        {!['/armazones', '/cotizador', '/lentes-de-contacto'].includes(currentPath) && (
          <div>
`;
    code = code.replace('<main>', mainStr);
    
    // Find closing main and close the div
    const lastMainIndex = code.lastIndexOf('</main>');
    if (lastMainIndex !== -1) {
        code = code.substring(0, lastMainIndex) + '</div>\n</main>' + code.substring(lastMainIndex + 7);
    }
}

// 6. Disable modals popups matching paths inside useEffect handleUrlRoute so they don't open over the inline pages
// code = code.replace(/else if \\(path === '\\/agendar-cita'\\) \\{[\\s\\S]*?setIsBookingOpen\\(true\\);\\s*\\}/, '');

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx successfully.");
