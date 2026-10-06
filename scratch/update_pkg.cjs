const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.scripts.build = pkg.scripts.build.replace('npx tsc --noEmit', 'npm run lint && npx tsc -b');
pkg.scripts.lint = 'eslint . --rule "no-undef: error"';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
