const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(/import StandaloneCotizadorModal from '.\/components\/StandaloneCotizadorModal';\n/, '');
appContent = appContent.replace(/const \[isCotizadorGeneralOpen, setIsCotizadorGeneralOpen\] = useState\(false\);\n/, '');
appContent = appContent.replace(/const \[cotizadorInitialType, setCotizadorInitialType\] = useState<string \| null>\(null\);\n/, '');

appContent = appContent.replace(
  /onOpenCotizador=\{\(\) => \{[\s\S]*?\}\}\n\s*\/>/,
  `onOpenCotizador={() => {
              const micaContent = { m1: 'Monofocales', m2: 'Bifocales', m4: 'Progresivos', m5: 'Fotocromático' };
              const initialType = micaContent[selectedMicaCard.id];
              setSelectedMicaCard(null);
              window.history.pushState({}, '', '/cotizador' + (initialType ? '?tipo=' + encodeURIComponent(initialType) : ''));
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
          />`
);

fs.writeFileSync('src/App.tsx', appContent);
console.log('App.tsx cleaned');
