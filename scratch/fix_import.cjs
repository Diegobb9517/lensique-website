const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  "import { getDisplayName, formatProductTitle, getContactLensUsage, getProductSlug, findProductBySlug, slugify } from './lib/format';",
  "import { getDisplayName, formatProductTitle, getContactLensUsage, getProductSlug, findProductBySlug, slugify, isInStock } from './lib/format';"
);
fs.writeFileSync('src/App.tsx', code);
