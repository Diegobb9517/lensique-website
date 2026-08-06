const fs = require('fs');
let f = fs.readFileSync('public/asesor_zeiss.html', 'utf8');

const rxTextFix = `
  function rxText(){
    if (ST.rxMethod === 'upload') return "RECETA ADJUNTA (Ver foto/PDF)";
    if (ST.rxMethod === 'contact') return "REQUIERE GRADUACIÓN — CONTACTAR CLIENTE";
    var t="Esf "+(ST.esf>=0?"+":"")+(ST.esf||0).toFixed(2)+"  Cil "+(ST.cil||0).toFixed(2);
    if(ST.type!=="mono"&&ST.add)t+="  Add +"+Number(ST.add).toFixed(2);
    if(ST.pdAsym){if(ST.pdR||ST.pdL)t+="  PD "+(ST.pdR||"?")+"/"+(ST.pdL||"?")+" mm";}
    else if(ST.pd)t+="  PD "+ST.pd+" mm";
    return t;
  }
`;

f = f.replace(/function rxText\(\)\{[\s\S]*?return t;\}/, rxTextFix);

// I should also ensure that ST gets updated properly so finish() sends it.
// We already did the HTML replacement.

fs.writeFileSync('public/asesor_zeiss.html', f, 'utf8');
fs.writeFileSync('public/cotizador/index.html', f, 'utf8');
console.log("Updated rxText!");
