const fs = require('fs');
const path = 'src/components/ProductCard.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { calculateDeliveryTime }')) {
  content = content.replace(/import { BASE_LENS_PRICE } from '\.\.\/lib\/constants';/, "import { BASE_LENS_PRICE } from '../lib/constants';\nimport { calculateDeliveryTime } from '../lib/delivery';");
  fs.writeFileSync(path, content);
  console.log('ProductCard import added');
} else {
  console.log('Import already present');
}
