const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Replace section title
appTsx = appTsx.replace(
  />Nuestros servicios visuales<\/h2>/,
  '>Lo que encuentras en Lensique</h2>'
);

// 2. Replace perks text
appTsx = appTsx.replace(
  /Servicios de ajuste<br\/>y mantenimiento/,
  'Micas de la más<br/>alta calidad'
);

// 3. Replace the s4 and s5 with Armazones and Lentes de contacto
const regex = /\{\s*id: 's4'[\s\S]*?id: 's5'[\s\S]*?\}\s*\]\.map/m;
const replacement = `{ 
                id: 's3_arm', 
                title: 'Armazones', 
                img: armazonesServiceImg, 
                action: () => { window.location.href = '/catalogo?tipo=armazones'; }
              },
              { 
                id: 's4', 
                title: 'Lentes de contacto', 
                img: contactLensesImg, 
                action: () => setSelectedServiceInfo({
                  id: 's4',
                  title: 'Lentes de contacto',
                  subtitle: 'Visión libre y cómoda',
                  description: '<p>Descubre una forma cómoda e invisible de corregir tu visión. Ofrecemos adaptaciones personalizadas para asegurar la mejor opción para tus ojos, ya sea para uso diario, mensual o casos especiales.</p>',
                  image: contactLensesImg,
                  actionText: 'Ver lentes de contacto',
                  onAction: () => { setSelectedServiceInfo(null); setIsContactQuizOpen(true); }
                })
              }
            ].map`;
            
appTsx = appTsx.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', appTsx);
console.log('App.tsx updated for removal of ajuste');
