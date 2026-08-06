const fs = require('fs');
let f = fs.readFileSync('public/asesor_zeiss.html', 'utf8');

// We need to inject the 3 options into rxBlock
const newRxBlock = `
  function rxBlock(){
    var h = '<div class="opts" style="margin-bottom: 24px;">';
    h += bigOpt(ST.rxMethod === 'upload', IC.ar || '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>', 'Subir mi receta', 'Sube una foto o PDF y nosotros nos encargamos', 'onclick="pick(\\'rxMethod\\',\\'upload\\')"');
    h += bigOpt(ST.rxMethod === 'manual', IC.foto || '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>', 'Ingresar datos', 'Copia los datos de tu receta manualmente', 'onclick="pick(\\'rxMethod\\',\\'manual\\')"');
    h += bigOpt(ST.rxMethod === 'contact', IC.entintado || '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>', 'Asesoría / Agendar cita', 'Te contactaremos para guiarte o agendar cita', 'onclick="pick(\\'rxMethod\\',\\'contact\\')"');
    h += '</div>';

    if (ST.rxMethod === 'upload') {
      h += '<div style="margin-bottom: 24px; padding: 20px; border: 2px dashed var(--line); border-radius: 12px; text-align: center; background: #fff;">';
      h += '<input type="file" id="rxUploadInput" accept="image/*,.pdf" style="display:none" onchange="handleRxUpload(event)">';
      h += '<div id="rxUploadPreview" style="margin-bottom: 12px; font-size: 13px; font-weight: 600; color: var(--navy);">' + (ST.rxFileName || 'Ningún archivo seleccionado') + '</div>';
      h += '<button onclick="document.getElementById(\\'rxUploadInput\\').click()" style="background: var(--navy); color: #fff; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 600; cursor: pointer;">Seleccionar archivo</button>';
      h += '</div>';
    } else if (ST.rxMethod === 'manual') {
      var st="style='display:block'";
      h += "<div "+st+"><details style='margin-bottom:14px' open><summary class='upToggle'><div class='uplbl'>Tu receta</div><div style='font-size:13.5px'>Ingresa los valores (opcional afinar)</div></summary>";
      h += dataBlock();
      h += "</details></div>";
    } else if (ST.rxMethod === 'contact') {
      h += '<div style="margin-bottom: 24px; padding: 16px; border: 1px solid var(--line); border-radius: 12px; background: #f0fdf4; color: #166534; font-size: 14px; line-height: 1.5;">';
      h += '<strong>¡Excelente elección!</strong> Puedes continuar con tu compra ahora mismo. Nuestro equipo se pondrá en contacto contigo muy pronto para agendar tu cita o ayudarte a obtener tu graduación.';
      h += '</div>';
    }

    return h;
  }
`;

// Replace the old rxBlock
f = f.replace(/function rxBlock\(\)\{[\s\S]*?return h;\}/, newRxBlock);

// Inject handleRxUpload function
const handleRxUploadFn = `
  function handleRxUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    ST.rxFileName = file.name;
    var reader = new FileReader();
    reader.onload = function(evt) {
      ST.rxFileBase64 = evt.target.result;
      render();
    };
    reader.readAsDataURL(file);
  }
`;
if (!f.includes('function handleRxUpload')) {
  f = f.replace('function selOpts', handleRxUploadFn + '\\n  function selOpts');
}

// Require ST.rxMethod to proceed past step 3
const stepWrapFix = `
function stepWrap(stepNum, content) {
  var isMobile = window.innerWidth <= 560;
  if(!isMobile) return content;
  var on = ST.step === stepNum ? ' m-active' : '';
  var btns = '<div class="m-nav">';
  if(stepNum > 1) btns += '<button class="btn" style="background:#f1f5f9;color:#0f172a;border:1px solid #cbd5e1;flex:1;padding:12px;border-radius:30px;font-weight:600;" onclick="go(-1)">Volver</button>';
  
  var disabledNext = false;
  if(stepNum === 3 && !ST.rxMethod) disabledNext = true;
  
  if(stepNum < 5) btns += '<button class="btn next" style="flex:1;padding:12px;border-radius:30px;font-weight:600;border:none;background:' + (disabledNext ? '#d8d4ca' : '#15223e') + ';color:#fff;" onclick="if(!' + disabledNext + ') go(1)" ' + (disabledNext ? 'disabled' : '') + '>Continuar</button>';
  btns += '</div>';
  return '<div class="m-step m-step-' + stepNum + on + '">' + content + btns + '</div>';
}
`;
f = f.replace(/function stepWrap\([\s\S]*?return '<div class="m-step m-step-' \+ stepNum \+ on \+ '">' \+ content \+ btns \+ '<\/div>';\n\}/, stepWrapFix);

// Also need to fix the desktop "Continuar" button in the nav element, which is updated in function render()
const desktopNavFix = `
  var nav='<div class="navIn">';
  if(ST.step>1) nav+='<button class="btn back" onclick="go(-1)">Volver</button>';
  var dsbl = (ST.step === 3 && !ST.rxMethod) ? 'disabled' : '';
  if(ST.step<TOTAL_STEPS) nav+='<button class="btn next" onclick="if(!' + dsbl + ') go(1)" ' + dsbl + '>Continuar</button>';
  else nav+='<button class="btn next" onclick="finish()" id="fbtn">Añadir al carrito</button>';
  nav+='</div>';
`;
f = f.replace(/var nav='<div class="navIn">';[\s\S]*?nav\+='<\/div>';/, desktopNavFix);

// And update secHead for step 3 to make it mandatory
f = f.replace('"Tu lente: material y grosor","Si tienes tu receta, agrégala (opcional) para afinar el grosor; si no, solo elige tu material."', '"Tu lente: material y grosor","Es OBLIGATORIO indicar tu graduación o cómo la obtendremos para poder elaborar tus lentes."');

fs.writeFileSync('public/asesor_zeiss.html', f, 'utf8');
fs.writeFileSync('public/cotizador/index.html', f, 'utf8');
console.log("Updated correctly!");
