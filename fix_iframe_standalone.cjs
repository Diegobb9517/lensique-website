const fs = require('fs');

// 1. Update package.json
const pkgPath = 'package.json';
let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.scripts.build = "node scripts/compile_delivery.js && " + pkg.scripts.build;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log('package.json updated');

// 2. Update asesor_zeiss.html
const asesorPath = 'public/asesor_zeiss.html';
let asesorCode = fs.readFileSync(asesorPath, 'utf8');

if (!asesorCode.includes('<script src="/delivery.js"></script>')) {
  asesorCode = asesorCode.replace('<head>', '<head>\n  <script src="/delivery.js"></script>');
}

const targetRegex = /if \(window\.parent && window\.parent\.getDeliveryEstimate\) \{.*?\q\.entrega = "Llega pronto \(consulta\)";\s*\}/s;
const replacement = `
  if (typeof getDeliveryEstimate === 'function') {
      var est = getDeliveryEstimate(frameAvail, lType, 'pickup');
      q.entrega = est.dateRange;
  } else {
      q.entrega = "Consultar en tienda";
  }
`;

if (asesorCode.match(targetRegex)) {
  asesorCode = asesorCode.replace(targetRegex, replacement.trim());
} else {
  console.log('targetRegex not found, might have been already modified');
}

// Ensure the label for treatments is aligned to right and green.
// The user asked: "etiqueta verde uniforme y alineada a la derecha para todas las opciones (incluido "AR premium +$700")."
// In asesor_zeiss.html, the extra labels are usually added in engOpcion() or something. Let's see where the extra label is.
// Actually, it's in the side selection panel, which uses elements like <div class="sidePill"> or something?
// Let's check where the labels are generated. We'll leave that for a second script run if we need it.

fs.writeFileSync(asesorPath, asesorCode);
console.log('asesor_zeiss.html updated');
