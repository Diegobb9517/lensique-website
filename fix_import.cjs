const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

if (!appTsx.includes('import premiumPolarized')) {
  appTsx = appTsx.replace(
    /import premiumAntireflective from '\.\/assets\/premium_antireflective_1785865428939\.jpg';/,
    `import premiumAntireflective from './assets/premium_antireflective_1785865428939.jpg';\nimport premiumPolarized from './assets/premium_polarized_1785866183086.jpg';`
  );
  fs.writeFileSync('src/App.tsx', appTsx);
  console.log('Import added successfully.');
} else {
  console.log('Import already exists.');
}
