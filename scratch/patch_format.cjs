const fs = require('fs');
let code = fs.readFileSync('src/lib/format.ts', 'utf8');
code += `
export const isInStock = (product: any): boolean => {
  if (!product) return false;
  return product.stock != null && product.stock !== '' && Number(String(product.stock).trim()) > 0;
};
`;
fs.writeFileSync('src/lib/format.ts', code, 'utf8');
console.log('format.ts patched.');
