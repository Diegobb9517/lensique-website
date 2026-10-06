const fs = require('fs');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

appTsx = appTsx.replace(
  /const \[selectedTech, setSelectedTech\] = useState<any>\(null\);/,
  `const [selectedTech, setSelectedTech] = useState<any>(null);\n  const [selectedMicaCard, setSelectedMicaCard] = useState<any>(null);`
);

fs.writeFileSync('src/App.tsx', appTsx);
console.log('App.tsx state added');
