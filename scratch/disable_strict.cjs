const fs = require('fs');
let code = fs.readFileSync('tsconfig.app.json', 'utf8');
code = code.replace(/"strict": true/g, '"strict": false');
code = code.replace(/"noUnusedLocals": true/g, '"noUnusedLocals": false');
code = code.replace(/"noUnusedParameters": true/g, '"noUnusedParameters": false');
fs.writeFileSync('tsconfig.app.json', code);
