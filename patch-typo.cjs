const fs = require('fs');
let file = 'src/App.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(
  /style=\{\{ display: isStandalone \? "none" : "flex", \.\.\. style=\{\{ display: isStandalone \? "none" : "flex",/,
  'style={{ display: isStandalone ? "none" : "flex",'
);

fs.writeFileSync(file, txt);
console.log('Fixed typo in App.tsx');
