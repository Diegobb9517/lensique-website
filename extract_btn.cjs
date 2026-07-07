const fs = require('fs');
const txt = fs.readFileSync('public/cotizador/index.html', 'utf8');
const idx = txt.indexOf('_btn=');
if (idx !== -1) {
  console.log(txt.substring(idx - 100, idx + 800));
} else {
  console.log('Not found');
}
