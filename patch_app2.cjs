const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. In ContactLensConfiguratorModal onComplete, add checkoutNow logic
// Find onComplete of ContactLensConfiguratorModal
const onCompleteContact = `          onComplete={(config) => {`;
const replaceOnCompleteContact = `          onComplete={(config, checkoutNow) => {`;
content = content.replace(onCompleteContact, replaceOnCompleteContact);

const setCartTrueContact = `            setContactConfiguratorProduct(null);
          }}`;
const replaceSetCartTrueContact = `            setContactConfiguratorProduct(null);
            setSelectedProductDetail(null); // Close product detail
            if (checkoutNow) setIsCartOpen(true);
          }}`;
content = content.replace(setCartTrueContact, replaceSetCartTrueContact);

// 2. Add checkoutNow to LensConfiguratorModal if we need it? No, they didn't ask for 3 steps in Lens.
// But wait, the "en armazones 'Comprar ahora' navega a /armazones; corrígelo también"
// Let's find the fallback in useEffect
const routeFallback = `        if (product) {
          if (window.history.state && window.history.state.productId) {
            window.history.back();
          } else {
            window.history.pushState(null, '', '/armazones');
          }
        }`;
// They said "y no cambiar la ruta". So if we close the modal, we SHOULD NOT change the route at all?
// Wait, if they close the modal, the route SHOULD change back, otherwise it stays /producto/slug.
// Wait, if I just remove this else branch entirely, the popstate listener won't change the route when selectedProductDetail becomes null.
// Let's change the routeFallback to do nothing!
const replaceRouteFallback = `        if (product) {
          // User requested: "y no cambiar la ruta". So when closing product modal, do nothing to the route.
          // Wait, if we do nothing, the URL remains /producto/slug. If they click outside to close, the URL stays /producto/slug.
          // Is that what they want? Yes, "cerrar la ventana del producto y no cambiar la ruta".
        }`;
content = content.replace(routeFallback, replaceRouteFallback);

// 3. Price format for contact lenses
// "en la ventana del producto muestra el precio real formateado como '$790 / caja'. 'Desde $790' solo si hay varias presentaciones."
// Where is the price shown in the product modal?
// Let's search for the price in App.tsx product detail.
fs.writeFileSync(file, content);
console.log('App.tsx patched part 1');
