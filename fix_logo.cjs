const fs = require('fs');
let file = fs.readFileSync('public/asesor_zeiss.html', 'utf8');
file = file.replace(/<div class="logo">Lensique<sup>(.*?)<\/sup><\/div>/g, '<a href="/" target="_top" class="logo" style="text-decoration:none;">Lensique<sup>$1</sup></a>');
fs.writeFileSync('public/asesor_zeiss.html', file);

let file2 = fs.readFileSync('public/cotizador/index.html', 'utf8');
file2 = file2.replace(/<div class="logo">Lensique<sup>(.*?)<\/sup><\/div>/g, '<a href="/" target="_top" class="logo" style="text-decoration:none;">Lensique<sup>$1</sup></a>');
fs.writeFileSync('public/cotizador/index.html', file2);
