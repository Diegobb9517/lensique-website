const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace('style={{ display: isStandalone ? "none" : "flex", ... style={{ display: \'flex\',', 'style={{ display: isStandalone ? "none" : "flex", ');
fs.writeFileSync('src/App.tsx', code);
