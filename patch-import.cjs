const fs = require('fs');
let file = 'src/App.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/import FaceMatcher from '\.\/components\/FaceMatcher';\n?/, '');

fs.writeFileSync(file, txt);
console.log('Removed FaceMatcher import');
