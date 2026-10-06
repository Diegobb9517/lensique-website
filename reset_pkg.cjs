const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts.build = 'node scripts/compile_delivery.js && node scripts/check_syntax.js && node scripts/check_base_lens_price.js && vite build && node scripts/prerender.js';
pkg.scripts['check:types'] = 'tsc -p tsconfig.ci.json --noEmit';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
