const fs = require('fs');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import for MicaDetailModal
if (!appTsx.includes('import MicaDetailModal')) {
  appTsx = appTsx.replace(
    /import StandaloneCotizadorModal from '\.\/components\/StandaloneCotizadorModal';/,
    `import StandaloneCotizadorModal from './components/StandaloneCotizadorModal';\nimport MicaDetailModal from './components/MicaDetailModal';`
  );
}

// 2. Add state for selectedMicaCard
if (!appTsx.includes('const [selectedMicaCard, setSelectedMicaCard]')) {
  appTsx = appTsx.replace(
    /const \[selectedTech, setSelectedTech\] = useState<any \| null>\(null\);/,
    `const [selectedTech, setSelectedTech] = useState<any | null>(null);\n  const [selectedMicaCard, setSelectedMicaCard] = useState<any | null>(null);`
  );
}

// 3. Render the Modal below cotizador modal
if (!appTsx.includes('<MicaDetailModal')) {
  appTsx = appTsx.replace(
    /\{isCotizadorGeneralOpen && \(/,
    `<AnimatePresence>
        {selectedMicaCard && (
          <MicaDetailModal
            mica={selectedMicaCard}
            onClose={() => setSelectedMicaCard(null)}
            onOpenCotizador={() => {
              setIsCotizadorGeneralOpen(true);
              window.history.pushState({}, '', '/cotizador');
            }}
          />
        )}
      </AnimatePresence>

      {isCotizadorGeneralOpen && (`
  );
}

// 4. Update the onClick of the micas cards to open the modal
appTsx = appTsx.replace(
  /onClick=\{\(e: any\) => \{\s*e\.preventDefault\(\);\s*setIsCotizadorGeneralOpen\(true\);\s*window\.history\.pushState\(\{\}, '', '\/cotizador'\);\s*\}\}/g,
  `onClick={(e: any) => { 
                          e.preventDefault(); 
                          setSelectedMicaCard(brick);
                        }}`
);

// Note: Ensure the "Cotizar mis micas" primary button still links to the cotizador!
// The regex above will match the button too if I am not careful, wait! The primary button has exact same onClick?
// Let's check the previous script!
/*
<a 
  href="/cotizador" 
  onClick={(e) => { 
    e.preventDefault(); 
    setIsCotizadorGeneralOpen(true); 
    window.history.pushState({}, '', '/cotizador'); 
  }}
*/
// In my previous regex I used `(e: any)` which I only put on the card `onClick={(e: any) => {`. The a-tag has `onClick={(e) => {`.
// Let's be precise.

fs.writeFileSync('src/App.tsx', appTsx);
console.log('App.tsx updated for MicaDetailModal');
