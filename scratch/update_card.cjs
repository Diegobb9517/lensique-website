const fs = require('fs');
let code = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

code = code.replace(/getInventedName/g, 'getDisplayName');

const oldFormat = `export const FormatProductName = ({ name, brand, category }: { name: string, brand?: string, category?: string }) => {
  const cleanName = getDisplayName(name, category);
  return <span className="fpn-main">{cleanName}</span>;
};`;
const newFormat = `export const FormatProductName = ({ product }: { product: any }) => {
  const cleanName = getDisplayName(product);
  return <span className="fpn-main">{cleanName}</span>;
};`;
code = code.replace(oldFormat, newFormat);

code = code.replace(/<FormatProductName name={product.name} brand={product.brand} category={product.category} \/>/g, '<FormatProductName product={product} />');

fs.writeFileSync('src/components/ProductCard.tsx', code);
