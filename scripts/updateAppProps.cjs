const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /<StandaloneCotizadorModal\s+onClose=\{\(\) => setIsCotizadorGeneralOpen\(false\)\}\s+onComplete=\{\(config\) => \{\s+setIsCotizadorGeneralOpen\(false\);/g,
  `<StandaloneCotizadorModal
          initialType={cotizadorInitialType}
          onClose={() => {
            setIsCotizadorGeneralOpen(false);
            setCotizadorInitialType(null);
          }}
          onComplete={(config) => {
            setIsCotizadorGeneralOpen(false);
            setCotizadorInitialType(null);`
);

content = content.replace(
  /<StandaloneCotizadorModal \s+onClose=\{\(\) => \{\}\}\s+onComplete=\{\(config\) => \{/g,
  `<StandaloneCotizadorModal
              initialType={cotizadorInitialType}
              onClose={() => setCotizadorInitialType(null)}
              onComplete={(config) => {`
);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
