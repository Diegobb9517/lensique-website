const fs = require('fs');
const path = 'src/context/CartContext.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('minDeliveryDays?: number')) {
  content = content.replace(/maxDeliveryDays\?: number;/g, 'maxDeliveryDays?: number;\n  minDeliveryDays?: number;');
  fs.writeFileSync(path, content);
  console.log('CartContext updated');
}
