const fs = require('fs');

function processFile(filePath) {
  let f = fs.readFileSync(filePath, 'utf8');

  // 1. Update CSS: hide header and .nav on mobile
  // The current media query starts with:
  // @media(max-width:560px){.stageVisual{display:none !important}.step{padding:12px 16px 96px}header{padding:16px 16px 12px}
  f = f.replace(/header\{padding:16px 16px 12px\}/, 'header{display:none !important}');
  
  // We also need to add .nav{display:none !important} to the max-width:560px media query
  if (!f.includes('.nav{display:none !important}')) {
      f = f.replace(/\.m-nav\{display:flex/, '.nav{display:none !important}.m-nav{display:flex');
  }

  // 2. Update stepWrap to include Finalizar button in step 5
  const oldStepWrap = /if\(stepNum < 5\) btns \+= '<button class="btn next" style="flex:1;padding:12px;border-radius:30px;font-weight:600;border:none;background:#15223e;color:#fff;" onclick="go\(1\)">Continuar<\/button>';/;
  
  const newStepWrap = `if(stepNum < 5) {
    btns += '<button class="btn next" style="flex:1;padding:12px;border-radius:30px;font-weight:600;border:none;background:#15223e;color:#fff;" onclick="go(1)">Continuar</button>';
  } else {
    btns += '<button class="btn next" style="flex:1;padding:12px;border-radius:30px;font-weight:600;border:none;background:#15223e;color:#fff;" onclick="var cb=document.getElementById(\\'cartBtn\\'); if(cb) cb.click();">Agregar al carrito</button>';
  }`;
  
  f = f.replace(oldStepWrap, newStepWrap);

  fs.writeFileSync(filePath, f, 'utf8');
}

processFile('public/asesor_zeiss.html');
processFile('public/cotizador/index.html');

console.log("Updated CSS and logic for buttons on mobile");
