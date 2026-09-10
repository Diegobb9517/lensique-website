const fs = require('fs');
let file = 'src/App.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/<FaceMatcher[^>]*>[\s\S]*?<\/FaceMatcher>/, '');
txt = txt.replace(/<FaceMatcher[^>]*\/>/, '');
// Wait, since it has nested { ... } maybe the regex fails if it contains >
// The tag is: <FaceMatcher onOpenCatalog={(shape) => { ... }} />
txt = txt.replace(/<FaceMatcher[\s\S]*?\/>/, '');

txt = txt.replace(/import FaceMatcher from '\.\/components\/FaceMatcher';/, '');

// Fix the typo on line 273 if it exists
txt = txt.replace(
  /style=\{\{ display: isStandalone \? "none" : "flex", \.\.\. style=\{\{ display: isStandalone \? "none" : "flex",/,
  'style={{ display: isStandalone ? "none" : "flex",'
);

fs.writeFileSync(file, txt);
console.log('Removed FaceMatcher properly');
