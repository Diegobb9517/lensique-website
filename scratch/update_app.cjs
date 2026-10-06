const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update imports
code = code.replace(
  /import \{ getInventedName, formatProductTitle, getContactLensUsage, getProductSlug, findProductBySlug, slugify \} from '\.\/lib\/format';/,
  "import { getDisplayName, formatProductTitle, getContactLensUsage, getProductSlug, findProductBySlug, slugify } from './lib/format';"
);

// 2. Update dynamic Title & Description (around line 1100)
const oldSeoTitle = `const brand = (selectedProductDetail.brand && selectedProductDetail.brand !== 'null') ? \`\${selectedProductDetail.brand.trim()} \` : '';
      const model = (selectedProductDetail.model || selectedProductDetail.name || '').trim();
      const isContact = String(selectedProductDetail.category || '').toLowerCase().includes('contacto');
      const categoryLabel = isContact ? 'Lentes de Contacto' : 'Armazón oftálmico';
      const pageTitle = \`\${brand}\${model} | \${categoryLabel} | Óptica Lensique\`;`;

const newSeoTitle = `const isContact = String(selectedProductDetail.category || '').toLowerCase().includes('contacto');
      const categoryLabel = isContact ? 'Lentes de Contacto' : 'Armazón oftálmico';
      const displayName = getDisplayName(selectedProductDetail);
      const pageTitle = \`\${displayName} | \${categoryLabel} | Óptica Lensique\`;
      
      const brand = (selectedProductDetail.brand && selectedProductDetail.brand !== 'null') ? \`\${selectedProductDetail.brand.trim()} \` : '';
      const model = displayName; // Used later for JSON-LD description fallback`;

code = code.replace(oldSeoTitle, newSeoTitle);

// 3. Update JSON-LD name
code = code.replace(/"name": \`\$\{brand \? brand \+ ' ' : ''\}\$\{model\} - \$\{categoryLabel\}\`/g, `"name": \`\${displayName} - \${categoryLabel}\``);

// 4. Update the WhatsApp preview button in Cart
// Let's replace any instance where it uses formatProductTitle to show the product name
// Actually, formatProductTitle in format.ts will handle it.

fs.writeFileSync('src/App.tsx', code);
