const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove isCotizadorGeneralOpen modal entirely
appContent = appContent.replace(
  /\{isCotizadorGeneralOpen\s*&&\s*\([\s\S]*?\}\s*\}\s*\/>\s*\)\}/,
  ''
);

// 2. Remove the old /cotizador render
const cotizadorRenderRegex = /\{currentPath === '\/cotizador' && \([\s\S]*?<StandaloneCotizadorModal[\s\S]*?window\.open\(url, '_blank'\);\s*\}\}\s*\/>\s*<\/div>\s*\)\}/;

const newCotizadorRender = `{currentPath === '/cotizador' && (
          <div style={{ paddingTop: '80px', backgroundColor: '#f8fafc', paddingBottom: '80px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#1d1d1f', margin: '0 20px 40px', textAlign: 'center' }}>Cotiza tus micas en menos de un minuto</h1>
            <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'var(--bg, #f1ede5)', height: '90vh', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.15)' }}>
              <iframe 
                src={\`/asesor_zeiss.html?v=1.0.2\${new URLSearchParams(window.location.search).get('tipo') ? \`&initialType=\${encodeURIComponent(new URLSearchParams(window.location.search).get('tipo')!)}\` : ''}\`}
                title="Asesor Visual ZEISS"
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'inherit' }}
              />
            </div>
          </div>
        )}`;

appContent = appContent.replace(cotizadorRenderRegex, newCotizadorRender);

// 3. Remove isCotizadorGeneralOpen uses in other buttons (like "Cotiza" button)
appContent = appContent.replace(
  /setIsCotizadorGeneralOpen\(true\);\s*window\.history\.pushState\(\{\}, '', '\/cotizador'\);/g,
  `window.history.pushState({}, '', '/cotizador'); window.dispatchEvent(new PopStateEvent('popstate'));`
);

// 4. Also we need to add the window.addEventListener message for the new iframe in App.tsx
// But the user just wants the iframe to render. If the user clicks finish, it should send the WhatsApp message.
// Where should the listener live? It can be a simple useEffect in App.tsx watching for currentPath === '/cotizador'.

const appUseEffect = `
  useEffect(() => {
    if (currentPath !== '/cotizador') return;
    
    const handleMessage = (event) => {
      if (event.data?.type === 'lensique-mica') {
        const config = event.data.payload;
        if (config) {
          let configText = \`Hola, quiero cotizar mis micas. Esto fue lo que seleccioné en el cotizador:\\n\`;
          if (config.etiqueta) configText += \`- \${config.etiqueta} (índice \${config.indice})\\n\`;
          if (config.tratamientos && config.tratamientos.length > 0) configText += \`- Tratamientos: \${config.tratamientos.join(', ')}\\n\`;
          if (config.material) configText += \`- Material sugerido: \${config.material}\\n\`;
          if (config.precioCalculado) configText += \`\\nPrecio estimado: \${config.precioCalculado}\\n\`;
          const phone = '523316929111';
          const url = \`https://api.whatsapp.com/send?phone=\${phone}&text=\${encodeURIComponent(configText)}\`;
          window.open(url, '_blank');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentPath]);
`;

// Insert it after const isInitialRender = useRef(true);
appContent = appContent.replace(
  /const isInitialRender = useRef\(true\);/,
  `const isInitialRender = useRef(true);\n${appUseEffect}`
);

fs.writeFileSync('src/App.tsx', appContent);
console.log('App.tsx updated');
