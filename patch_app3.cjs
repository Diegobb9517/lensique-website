const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix Contact Lens Configurator onComplete
const onCompleteContactRegex = /onComplete=\{\(config\)\s*=>\s*\{\s*setContactConfiguratorProduct\(null\);/m;
const replaceOnCompleteContact = `onComplete={(config, checkoutNow) => {
            setContactConfiguratorProduct(null);
            setSelectedProductDetail(null); // Close product detail
`;
content = content.replace(onCompleteContactRegex, replaceOnCompleteContact);

// 2. Add setIsCartOpen
const addItemContactRegex = /addItem\(\{([\s\S]*?rxText: configText[\s\S]*?)\}\);\s*setContactConfiguratorProduct\(null\);/m;
const replaceAddItemContact = `addItem({$1});
            if (checkoutNow) {
               setIsCartOpen(true);
            }
`;
if (content.match(addItemContactRegex)) {
  content = content.replace(addItemContactRegex, replaceAddItemContact);
}

// 3. Price formatting in ProductDetail modal
const priceRegex = /<span style=\{\{ color: '#16a34a', whiteSpace: 'nowrap' \}\}>\$\{\(selectedProductDetail\.price_incl_tax \|\| 0\)\.toLocaleString\('en-US'\)\}<\/span>/g;
const replacePrice = `<span style={{ color: '#16a34a', whiteSpace: 'nowrap' }}>\${(selectedProductDetail.price_incl_tax || 0).toLocaleString('en-US')}{String(selectedProductDetail.category || '').toLowerCase().includes('contacto') ? ' / caja' : ''}</span>`;
content = content.replace(priceRegex, replacePrice);

// 4. Fix route fallback for /armazones
const routeFallback = `        if (product) {
          if (window.history.state && window.history.state.productId) {
            window.history.back();
          } else {
            window.history.pushState(null, '', '/armazones');
          }
        }`;
const replaceRouteFallback = `        if (product) {
          if (window.history.state && window.history.state.productId) {
            window.history.back();
          } else {
            window.history.pushState(null, '', '/catalogo'); // Fallback to catalogo instead of armazones, or whatever. But wait, user said "no cambiar la ruta". Let's just do history.back() blindly? 
          }
        }`;
// Wait, actually, let's just use window.history.back() unconditionally if product was open.
const betterRouteFallback = `        if (product) {
          if (window.history.state && window.history.state.productId) {
            window.history.back();
          } else {
             // Do nothing to avoid jumping randomly to /armazones
          }
        }`;
content = content.replace(routeFallback, betterRouteFallback);

fs.writeFileSync(file, content);
console.log('App.tsx patched successfully.');
