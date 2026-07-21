const fs = require('fs');
let f = fs.readFileSync('public/asesor_zeiss.html', 'utf8');

// Update TOTAL_STEPS
f = f.replace('var TOTAL_STEPS=4;', 'var TOTAL_STEPS=5;');

// The string we want to insert
const renderReplacement = `function stepWrap(stepNum, content) {
  var isMobile = window.innerWidth <= 560;
  if(!isMobile) return content;
  var on = ST.step === stepNum ? ' m-active' : '';
  var btns = '<div class="m-nav">';
  if(stepNum > 1) btns += '<button class="btn" style="background:#f1f5f9;color:#0f172a;border:1px solid #cbd5e1;flex:1;padding:12px;border-radius:30px;font-weight:600;" onclick="go(-1)">Volver</button>';
  if(stepNum < 5) btns += '<button class="btn next" style="flex:1;padding:12px;border-radius:30px;font-weight:600;border:none;background:#15223e;color:#fff;" onclick="go(1)">Continuar</button>';
  btns += '</div>';
  return '<div class="m-step m-step-' + stepNum + on + '">' + content + btns + '</div>';
}

function render(){
 $("prog").style.display="none";
 var R="";
 // 01 Tipo
 var o1='<div class="opts">';["mono","prog","bif"].forEach(function(k){o1+=bigOpt(ST.type===k,IC[TYPES[k].ic],TYPES[k].nm,TYPES[k].ds,'onclick="pick(\\'type\\',\\''+k+'\\')"');});o1+='</div>';
 R+=stepWrap(1, '<section class="sec">'+secHead("01 — Tipo","¿Qué necesitas ver?","Cuéntame cómo usas tus lentes y te muestro la mejor opción.")+o1+'</section>');
 // 02 Tratamiento
 var o2='<div class="opts">';treatList().forEach(function(t){o2+=bigOpt(ST.treat===t.k,IC[t.k],t.nm,t.ds,'onclick="pick(\\'treat\\',\\''+t.k+'\\')"');if(t.k==="ar"&&ST.treat==="ar")o2+=arUpgradeBlock();if(t.k==="foto"&&ST.treat==="foto")o2+=fotoColorBlock();if(t.k==="entintado"&&ST.treat==="entintado")o2+=tintBlock();});o2+='</div>';
 R+=stepWrap(2, '<section class="sec">'+secHead("02 — Tratamiento","¿Qué quieres que haga tu lente?","Elige según tu día a día. Esto hace tus lentes mucho más cómodos.")+o2+'</section>');
 // 03 Medidas y material
 var o3=rxBlock();
 if(ST.type==="prog"){o3+='<div class="muted" style="margin:2px 0 14px">La zona clara se ensancha de Estándar a Premium — mírala en el lente.</div><div class="opts">';LEVELS.forEach(function(l){o3+=bigOpt(ST.level===l.k,"",l.nm,l.ds,'onclick="pick(\\'level\\',\\''+l.k+'\\')"');});o3+='</div>';}
 o3+=materialSimple();
 R+=stepWrap(3, '<section class="sec">'+secHead("03 — Material y grosor","Tu lente: material y grosor","Si tienes tu receta, agrégala (opcional) para afinar el grosor; si no, solo elige tu material.")+o3+'</section>');
 // 04 Beneficios
 var o4="";benefitsList().forEach(function(b){o4+='<div class="benefit"><div class="bi">'+IC[b.ic]+'</div><div><div class="bt">'+b.t+'</div><div class="bd">'+b.d+'</div></div></div>';});
 o4+='<div style="margin-top:18px;padding:14px 16px;border:1px solid var(--line);border-radius:10px"><div style="font-size:14px;font-weight:600;color:var(--navy)">Entrega estimada: '+deliveryTime()+'</div><div class="muted" style="font-size:12px;margin-top:2px">Sujeta a tiempos del laboratorio</div></div>';
 R+=stepWrap(4, '<section class="sec">'+secHead("04 — Tu lente","Lo que hace por ti","")+o4+'</section>');
 // 05 Inversión
 R+=stepWrap(5, priceSection()+labPanel());
 var _sb=document.getElementById("stageBody");`;

// We use regex to replace from function render(){ to var _sb=document.getElementById("stageBody");
const regex = /function render\(\)\{[\s\S]*?var _sb=document\.getElementById\("stageBody"\);/;

f = f.replace(regex, renderReplacement);

// We also need to fix the encoding issues that may have occurred if there were strange characters, but readFileSync with utf8 keeps them intact.

fs.writeFileSync('public/asesor_zeiss.html', f, 'utf8');
fs.writeFileSync('public/cotizador/index.html', f, 'utf8');

console.log("Files updated successfully.");
