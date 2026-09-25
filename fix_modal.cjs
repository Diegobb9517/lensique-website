const fs = require('fs');

const path = 'src/components/LensConfiguratorModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the invalid JSX
content = content.replace(
  /const isPreorder = \(product\?\.stock != null && product\.stock !== '' && Number\(product\.stock\) <= 0\) \? 'true' : 'false';/,
  ''
);

// We still need to pass isPreorder in the URL, but we calculate it directly in the URL string
content = content.replace(
  /src=\{`\/asesor_zeiss\.html\?v=1\.0\.5&framePrice=\$\{product\?\.price_incl_tax \|\| product\?\.price \|\| 0\}&isPreorder=\$\{isPreorder\}`\}/,
  `src={\`/asesor_zeiss.html?v=1.0.5&framePrice=\${product?.price_incl_tax || product?.price || 0}&isPreorder=\${(product?.stock != null && product.stock !== '' && Number(product.stock) <= 0) ? 'true' : 'false'}\`}`
);

fs.writeFileSync(path, content);
console.log('Fixed LensConfiguratorModal.tsx');
