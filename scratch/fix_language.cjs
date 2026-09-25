const fs = require('fs');

const path = 'public/asesor_zeiss.html';
let code = fs.readFileSync(path, 'utf8');

// 1. Fix fresh() default level
code = code.replace(/level:"pure"/, 'level:"precision"');

// 2. Fix pick() default reset
// Find: function pick(field,val){ST[field]=val;if(field==="type"){var ok=treatList().some(function(t){return t.k===ST.treat;});if(!ok)ST.treat="ar";}render();...
// Note: we only reset `level` to "precision" if type changes to "prog".
const oldPick = `function pick(field,val){ST[field]=val;if(field==="type"){var ok=treatList().some(function(t){return t.k===ST.treat;});if(!ok)ST.treat="ar";}render();`;
const newPick = `function pick(field,val){ST[field]=val;if(field==="type"){var ok=treatList().some(function(t){return t.k===ST.treat;});if(!ok)ST.treat="ar";if(val==="prog")ST.level="precision";}render();`;
if(code.includes(oldPick)) code = code.replace(oldPick, newPick);

// 3. Fix LEVELS array
const oldLevels = `var LEVELS=[{k:"precision",nm:"Precision Classic",ds:"Progresivo estándar y económico con tecnología digital ZEISS."},{k:"pure",nm:"SmartLife Pure",ds:"Gama media; adaptación más rápida, campos visuales amplios para el día a día."},{k:"plus",nm:"SmartLife Plus",ds:"Diseño premium con campos aún más anchos y suaves para cualquier distancia."},{k:"superb",nm:"SmartLife Superb",ds:"Personalizado a tu tipo de armazón, para una experiencia visual superior."},{k:"individual",nm:"SmartLife Individual 3",ds:"El diseño tope de gama, fabricado 100% a la medida de tu rostro, ojos y hábitos."}];`;
const newLevels = `var LEVELS=[{k:"precision",nm:"Precision Classic",ds:"Progresivo de entrada."},{k:"pure",nm:"SmartLife Pure",ds:"Progresivo cómodo para todo el día."},{k:"plus",nm:"SmartLife Plus",ds:"Progresivo con campos amplios."},{k:"superb",nm:"SmartLife Superb",ds:"Progresivo con campos amplios y adaptación rápida."},{k:"individual",nm:"SmartLife Individual 3",ds:"Progresivo personalizado a la medida."}];`;
if(code.includes(oldLevels)) code = code.replace(oldLevels, newLevels);

// 4. Fix MATS array
const oldMats = `var MATS=[["1.50","Índice base 1.50"],["1.60","Más delgado 1.60"],["1.67","Extra delgado 1.67"],["1.74","Ultra delgado 1.74"]];`;
const newMats = `var MATS=[["1.50","Delgadez estándar (1.50)"],["1.60","Más delgado (1.60)"],["1.67","Muy delgado (1.67)"],["1.74","Ultra delgado (1.74)"]];`;
if(code.includes(oldMats)) code = code.replace(oldMats, newMats);

// Replace in poli/perfora blocks
code = code.replace(/Policarbonato · resistente al impacto/g, "Policarbonato resistente · Ideal para niños y deporte");
code = code.replace(/Más delgado y ligero \(1.67\)/g, "Muy delgado (1.67) · Recomendado para graduaciones altas");
code = code.replace(/Ultra delgado y ligero \(1.74\)/g, "Ultra delgado (1.74) · Recomendado para graduaciones altas");
code = code.replace(/Índice base · sube para adelgazar/g, "Delgadez estándar · sube para adelgazar");

// 5. Fix renderTopBar
const oldTopBar = `function renderTopBar() {
  var topBar = $("topBar");
  if (!topBar) {
    topBar = document.createElement("div");
    topBar.id = "topBar";
    topBar.style.cssText = "position:sticky;top:0;background:#f8fafc;color:var(--navy);padding:12px;text-align:center;font-size:14px;font-weight:600;z-index:100;border-bottom:1px solid #e2e8f0;box-shadow:0 2px 4px rgba(0,0,0,0.05);";
    document.body.insertBefore(topBar, document.body.firstChild);
  }
  var q = zeissQuote();
  var micas = q && q.disponible ? q.pvp : 0;
  var total = framePrice + micas;
  if (framePrice > 0) {
    var lbl = micas > 1200 ? (q.etiqueta||'micas').toLowerCase() : "micas incluidas";
    topBar.innerHTML = "Total " + money(total) + " &middot; " + lbl;
  } else {
    topBar.style.display = 'none';
  }
}`;

const newTopBar = `function renderTopBar() {
  var topBar = $("topBar");
  if (!topBar) {
    topBar = document.createElement("div");
    topBar.id = "topBar";
    topBar.style.cssText = "position:sticky;top:0;background:#f8fafc;color:var(--navy);padding:12px;text-align:center;font-size:14px;font-weight:600;z-index:100;border-bottom:1px solid #e2e8f0;box-shadow:0 2px 4px rgba(0,0,0,0.05);";
    document.body.insertBefore(topBar, document.body.firstChild);
  }
  var q = zeissQuote();
  var micas = q && q.disponible ? q.pvp : 0;
  var total = framePrice + micas;
  if (framePrice > 0) {
    var lbl = "";
    if (micas <= 1200) {
      lbl = "Micas incluidas";
    } else {
      var t = ST.type === "prog" ? "Progresivo" : (ST.type === "bif" ? "Bifocal" : "");
      var tr = "";
      if (ST.treat === "ar" && !ST.arPremium) tr = "antirreflejante";
      if (ST.treat === "ar" && ST.arPremium) tr = "antirreflejante premium";
      if (ST.treat === "azul") tr = "filtro de luz azul";
      if (ST.treat === "foto") tr = "fotocromático";
      if (ST.treat === "polar") tr = "polarizado";
      if (ST.treat === "invisible") tr = "sin línea visible";
      if (ST.treat === "entintado") tr = "entintado";
      if (ST.treat === "espejo") tr = "espejo";
      if (t) {
         lbl = t + (tr ? " + " + tr : "");
      } else {
         lbl = "Incluye " + tr;
      }
    }
    topBar.innerHTML = "Total " + money(total) + " &middot; " + lbl;
  } else {
    topBar.style.display = 'none';
  }
}`;

if(code.includes('function renderTopBar()')) {
  // We'll replace it. The original code has some variations, let's use regex
  code = code.replace(/function renderTopBar\(\).*?topBar\.style\.display = 'none';\s*\}/s, newTopBar);
}

// 6. Fix Summary and "05 - Tu total"
// Helper function to inject: clientFriendlySummary()
const helperFunction = `function clientFriendlySummary(){var t=ST.type==="mono"?"Una distancia":(ST.type==="prog"?"Progresivo":(ST.type==="bif"?"Bifocal":""));if(ST.type==="prog"&&ST.level==="pure")t="Progresivo cómodo para todo el día";if(ST.type==="prog"&&ST.level==="precision")t="Progresivo de entrada";if(ST.type==="prog"&&(ST.level==="plus"||ST.level==="superb"))t="Progresivo con campos amplios";if(ST.type==="prog"&&ST.level==="individual")t="Progresivo personalizado";var tr="";if(ST.treat==="ar"&&!ST.arPremium)tr="Antirreflejante";if(ST.treat==="ar"&&ST.arPremium)tr="Antirreflejante premium";if(ST.treat==="azul")tr="Filtro de luz azul";if(ST.treat==="foto")tr="Fotocromático";if(ST.treat==="polar")tr="Polarizado";if(ST.treat==="invisible")tr="Sin línea visible";if(ST.treat==="entintado")tr="Entintado";if(ST.treat==="espejo")tr="Espejo";var idx=ST.poli?"Policarbonato resistente":(ST.idx==="1.50"?"Delgadez estándar":(ST.idx==="1.60"?"Más delgado":(ST.idx==="1.67"?"Muy delgado":"Ultra delgado")));var parts=[];if(t)parts.push(t);if(tr)parts.push(tr);if(idx)parts.push(idx);return parts.join(" · ");}\nfunction`;
code = code.replace(/function/i, helperFunction); // replace first function with the helper and function

// In renderSummary():
// Change `<div class="lentname">'+name+' '+trn+'</div>` to `<div class="lentname">'+clientFriendlySummary()+'</div>`
// Change `<div class="muted" style="margin-bottom:8px">'+matLabel()+(ST.type==="prog"?" · nivel "+levelName(ST.level):"")+(ST.treat==="foto"?" · color "+(ST.fotoColor==="cafe"?"Café":"Gris"):"")+(ST.treat==="entintado"?" · "+TINTS[ST.tintColor][0]+" intensidad "+ST.tintInt:"")+(ST.perfora?" · armazón al aire":"")+'</div>`
// to `<div class="muted" style="margin-bottom:8px">ZEISS '+(ST.type==="prog"?"SmartLife "+levelName(ST.level):"Monofocal")+' · índice '+ST.idx+(ST.treat==="foto"?" · color "+(ST.fotoColor==="cafe"?"Café":"Gris"):"")+(ST.treat==="entintado"?" · "+TINTS[ST.tintColor][0]+" intensidad "+ST.tintInt:"")+(ST.perfora?" · armazón al aire":"")+'</div>`

code = code.replace(/<div class="lentname">'\+name\+' '\+trn\+'<\/div><div class="muted" style="margin-bottom:8px">'\+matLabel\(\)\+\(ST\.type==="prog"\?" · nivel "\+levelName\(ST\.level\):""\)\+\(ST\.treat==="foto"\?" · color "\+\(ST\.fotoColor==="cafe"\?"Café":"Gris"\):""\)\+\(ST\.treat==="entintado"\?" · "\+TINTS\[ST\.tintColor\]\[0\]\+" intensidad "\+ST\.tintInt:""\)\+\(ST\.perfora\?" · armazón al aire":""\)\+'<\/div>/g, 
  `<div class="lentname">'+clientFriendlySummary()+'</div><div class="muted" style="margin-bottom:8px;font-size:12px;">ZEISS '+(ST.type==="prog"?levelName(ST.level):"Monofocal")+' · índice '+(ST.poli?'1.59':ST.idx)+(ST.treat==="foto"?" · color "+(ST.fotoColor==="cafe"?"Café":"Gris"):"")+(ST.treat==="entintado"?" · "+TINTS[ST.tintColor][0]+" intensidad "+ST.tintInt:"")+(ST.perfora?" · armazón al aire":"")+'</div>`);

// In priceSection():
// Change `<div class="muted" style="margin-top:8px">'+q.etiqueta+' · índice '+q.indice+(q.pvp===0?' — incluido':'')+'</div>`
// to `<div class="lentname" style="margin-top:8px;font-size:15px;color:var(--navy);font-weight:700;">'+clientFriendlySummary()+'</div><div class="muted" style="margin-top:2px;font-size:12px;">ZEISS '+(ST.type==="prog"?levelName(ST.level):"Monofocal")+' · índice '+(ST.poli?'1.59':ST.idx)+'</div>`

code = code.replace(/<div class="muted" style="margin-top:8px">'\+q\.etiqueta\+' · índice '\+q\.indice\+\(q\.pvp===0\?' — incluido':''\)\+'<\/div>/g, 
  `<div class="lentname" style="margin-top:8px;font-size:15px;color:var(--navy);font-weight:700;">'+clientFriendlySummary()+'</div><div class="muted" style="margin-top:2px;font-size:12px;">ZEISS '+(ST.type==="prog"?levelName(ST.level):"Monofocal")+' · índice '+(ST.poli?'1.59':ST.idx)+'</div>`);


// Save changes
fs.writeFileSync(path, code);
console.log('UI and language updates complete');
