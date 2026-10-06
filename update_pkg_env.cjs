const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts.build = pkg.scripts.build.replace(
  'npx eslint',
  'cross-env ESLINT_USE_FLAT_CONFIG=false npx eslint'
);

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
