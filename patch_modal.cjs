const fs = require('fs');

const path = 'src/components/LensConfiguratorModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const isPreorderCalc = "const isPreorder = (product?.stock != null && product.stock !== '' && Number(product.stock) <= 0) ? 'true' : 'false';";
const framePriceQuery = "framePrice=${product?.price_incl_tax || product?.price || 0}";

if (!content.includes('isPreorder=')) {
  content = content.replace(
    /src=\{`\/asesor_zeiss\.html\?v=1\.0\.4&framePrice=\$\{product\?\.price_incl_tax \|\| product\?\.price \|\| 0\}`\}/,
    `${isPreorderCalc}\n            src={\`/asesor_zeiss.html?v=1.0.5&framePrice=\${product?.price_incl_tax || product?.price || 0}&isPreorder=\${isPreorder}\`}`
  );
  fs.writeFileSync(path, content);
  console.log('LensConfiguratorModal.tsx updated');
}
