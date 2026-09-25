const fs = require('fs');

function applyTabular(path) {
  let content = fs.readFileSync(path, 'utf8');
  let changed = false;
  
  if (path === 'src/App.tsx') {
    // Add to large price in product modal
    const priceRegex = /<span style=\{\{ fontSize: '26px', fontWeight: 600, color: '#16a34a', lineHeight: 1 \}\}>/g;
    if (priceRegex.test(content)) {
      content = content.replace(priceRegex, `<span className="tabular-nums" style={{ fontSize: '26px', fontWeight: 600, color: '#16a34a', lineHeight: 1 }}>`);
      changed = true;
    }
  } else if (path === 'src/components/CartDrawer.tsx') {
    // Add to total price
    const totalRegex = /<span>\$\{Math\.round\(finalTotal\)\.toLocaleString\('es-MX'\)\}<\/span>/g;
    if (totalRegex.test(content)) {
      content = content.replace(totalRegex, `<span className="tabular-nums">\${Math.round(finalTotal).toLocaleString('es-MX')}</span>`);
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(path, content);
    console.log(path + ' tabular-nums updated');
  } else {
    console.log(path + ' tabular-nums no match or already updated');
  }
}

applyTabular('src/App.tsx');
applyTabular('src/components/CartDrawer.tsx');
