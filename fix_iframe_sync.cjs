const fs = require('fs');

// 1. Expose getDeliveryEstimate to window in App.tsx
const appPath = 'src/App.tsx';
let appCode = fs.readFileSync(appPath, 'utf8');

if (!appCode.includes('window.getDeliveryEstimate = getDeliveryEstimate')) {
  // Find where getDeliveryEstimate is imported
  if (!appCode.includes('import { getDeliveryEstimate')) {
      appCode = appCode.replace(/import \{ calculateDeliveryTime \} from '\.\/lib\/delivery';/, "import { calculateDeliveryTime, getDeliveryEstimate } from './lib/delivery';");
  }
  
  appCode = appCode.replace(/export default function App\(\) \{/, "(window as any).getDeliveryEstimate = getDeliveryEstimate;\n\nexport default function App() {");
  fs.writeFileSync(appPath, appCode);
  console.log('App.tsx updated to expose getDeliveryEstimate');
}

// 2. Update asesor_zeiss.html to use window.parent.getDeliveryEstimate
const asesorPath = 'public/asesor_zeiss.html';
let asesorCode = fs.readFileSync(asesorPath, 'utf8');

const targetRegex = /var isPreorder = false;.*?q\.entrega = "Llega entre el " \+ dMin\.getDate\(\) \+ " de " \+ months\[dMin\.getMonth\(\)\] \+ " y el " \+ dMax\.getDate\(\) \+ " de " \+ months\[dMax\.getMonth\(\)\];\s*\}/;

const replacement = `var isPreorder = false;
  var params = new URLSearchParams(window.location.search);
  if (params.get('isPreorder') === 'true') { isPreorder = true; }
  
  var frameAvail = isPreorder ? 'preorder' : 'instock';
  var lType = 'mono_basic';
  if (inp.tipo === 'prog' || inp.tipo === 'bif' || inp.tipo === 'ocupacional') {
      lType = 'progressive_bifocal';
  } else if (ST.treat === 'foto') {
      lType = 'photochromic';
  } else if (ST.treat === 'polar' || ST.treat === 'tinte' || ST.poli) {
      lType = 'special';
  } else if (inp.indice === '1.67' || inp.indice === '1.74' || inp.indice === '1.60' || inp.indice === '1.59') {
      lType = 'mono_complex';
  }
  
  if (window.parent && window.parent.getDeliveryEstimate) {
      var est = window.parent.getDeliveryEstimate(frameAvail, lType, 'pickup');
      q.entrega = est.dateRange;
  } else {
      q.entrega = "Llega pronto (consulta)";
  }`;

if (asesorCode.match(targetRegex)) {
  asesorCode = asesorCode.replace(targetRegex, replacement.replace(/\n/g, '').replace(/\s+/g, ' '));
  fs.writeFileSync(asesorPath, asesorCode);
  console.log('asesor_zeiss.html updated to use window.parent');
} else {
  console.log('targetRegex not found in asesor_zeiss.html');
}
