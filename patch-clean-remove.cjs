const fs = require('fs');
let file = 'src/App.tsx';
let txt = fs.readFileSync(file, 'utf8');

const target = `<FaceMatcher onOpenCatalog={(shape) => { 
          setCatalogInitialFilter('Armazones'); 
          setCatalogInitialSearchQuery(shape || '');
          setIsCatalogOpen(true); 
        }} />`;

txt = txt.replace(target, '');
txt = txt.replace("import FaceMatcher from './components/FaceMatcher';\n", "");

fs.writeFileSync(file, txt);
console.log('Removed FaceMatcher properly');
