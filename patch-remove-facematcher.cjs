const fs = require('fs');
let file = 'src/App.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(
  /\s*<FaceMatcher[\s\S]*?\/>/,
  ''
);

fs.writeFileSync(file, txt);
console.log('Removed FaceMatcher from App.tsx');
