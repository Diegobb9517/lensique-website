const fs = require('fs');

// --- ProductCard.tsx ---
let codePC = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');
codePC = codePC.replace(/\r\n/g, '\n');

// Import isInStock
if (!codePC.includes('isInStock')) {
  codePC = codePC.replace(
    `import { getInventedName, getProductSlug } from '../lib/format';`,
    `import { getInventedName, getProductSlug, isInStock } from '../lib/format';`
  );
}

// Replace isOutOfStock logic
const targetPC = `  const isOutOfStock = product.stock != null && product.stock !== '' && Number(product.stock) <= 0;`;
const replacePC = `  const outOfStock = !isInStock(product);`;
codePC = codePC.replace(targetPC, replacePC);

// Replace badge rendering logic
const targetBadge = `          {isFrame ? (
            <div className="out-of-stock-badge" style={isOutOfStock ? { color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' } : {}}>
              {isOutOfStock ? 'SOBRE PEDIDO' : 'EN EXISTENCIA'}
            </div>
          ) : (
            isOutOfStock && <div className="out-of-stock-badge" style={{ color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>Sobre pedido</div>
          )}`;
          
const replaceBadge = `          {isFrame && (
            <div className="out-of-stock-badge" style={outOfStock ? { color: '#d97706', background: '#fffbeb', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.05em' } : {}}>
              {outOfStock ? 'SOBRE PEDIDO' : 'EN EXISTENCIA'}
            </div>
          )}`;
codePC = codePC.replace(targetBadge, replaceBadge);
// Just in case it was used elsewhere
codePC = codePC.replace(/isOutOfStock/g, 'outOfStock');

fs.writeFileSync('src/components/ProductCard.tsx', codePC, 'utf8');

// --- App.tsx ---
let codeApp = fs.readFileSync('src/App.tsx', 'utf8');
codeApp = codeApp.replace(/\r\n/g, '\n');

// Import isInStock
if (!codeApp.includes('isInStock')) {
  codeApp = codeApp.replace(
    `import { getInventedName, getProductSlug } from './lib/format';`,
    `import { getInventedName, getProductSlug, isInStock } from './lib/format';`
  );
  if (!codeApp.includes('isInStock')) {
     codeApp = codeApp.replace(
       `import { getProductSlug } from './lib/format';`,
       `import { getProductSlug, isInStock } from './lib/format';`
     );
  }
}

const targetFilter = `    const isContactLens = String(p.category || 'vista').toLowerCase().includes('contacto');
    const isOutOfStock = p.stock != null && p.stock !== '' && Number(p.stock) <= 0;
    const matchesAvailability = availabilityFilter === 'Todos' || isContactLens || !isOutOfStock;`;
const replaceFilter = `    const isContactLens = String(p.category || 'vista').toLowerCase().includes('contacto');
    const outOfStock = !isInStock(p);
    const matchesAvailability = availabilityFilter === 'Todos' || isContactLens || !outOfStock;`;
codeApp = codeApp.replace(targetFilter, replaceFilter);

const targetSort = `    if (!aIsContact && !bIsContact) {
      const aOutOfStock = a.stock != null && a.stock !== '' && Number(a.stock) <= 0;
      const bOutOfStock = b.stock != null && b.stock !== '' && Number(b.stock) <= 0;
      if (!aOutOfStock && bOutOfStock) return -1;
      if (aOutOfStock && !bOutOfStock) return 1;
    }`;
const replaceSort = `    if (!aIsContact && !bIsContact) {
      const aOutOfStock = !isInStock(a);
      const bOutOfStock = !isInStock(b);
      if (!aOutOfStock && bOutOfStock) return -1;
      if (aOutOfStock && !bOutOfStock) return 1;
    }`;
codeApp = codeApp.replace(targetSort, replaceSort);

fs.writeFileSync('src/App.tsx', codeApp, 'utf8');

console.log('App and ProductCard patched.');
