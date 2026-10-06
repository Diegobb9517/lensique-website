const fs = require('fs');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// Ensure both imports exist properly
appTsx = appTsx.replace(/import premiumAntireflective from '\.\/assets\/premium_polarized_1785866183086\.jpg';/, "import premiumAntireflective from './assets/premium_antireflective_1785865428939.jpg';\nimport premiumPolarized from './assets/premium_polarized_1785866183086.jpg';");

fs.writeFileSync('src/App.tsx', appTsx);
console.log('Fixed imports');
