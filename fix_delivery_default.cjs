const fs = require('fs');
const file = 'src/lib/delivery.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /let lensType: LensType = 'none';\s+if \(lensConfig\) \{/;
const replacement = `let lensType: LensType = isContactLens ? 'none' : 'mono_basic';
  if (lensConfig) {`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync(file, code);
  console.log('delivery.ts updated with mono_basic default');
} else {
  console.log('regex not found in delivery.ts');
}
