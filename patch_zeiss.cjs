const fs = require('fs');
let content = fs.readFileSync('public/asesor_zeiss.html', 'utf8');

content = content.replace(/if\(ST\[field\]===val\) return 'Incluido'; if\(pvpNew===0\) return 'Incluido'; return '\+/, "if(ST[field]===val) return 'Incluido'; if(pvpNew===0) return 'Incluido'; return '+$' + pvpNew.toLocaleString('en-US');");

// Let's just cleanly replace the whole getPriceTag function to be absolutely sure.
const getPriceTagRegex = /function getPriceTag\(field, val\) \{[\s\S]*?return '\+[\s\S]*?\n\}/;

const cleanGetPriceTag = `function getPriceTag(field, val) {
  var old = ST[field];
  var baseVal = old;
  if (field === 'type') baseVal = 'mono';
  if (field === 'treat') baseVal = 'ar';
  if (field === 'level') baseVal = 'smart';
  
  var qOld = zeissQuote();
  var pvpCurrent = qOld && qOld.disponible ? qOld.pvp : 0;
  
  var oldPoli = ST.poli;
  var oldIdx = ST.idx;
  if (field === 'mat') {
     ST.poli = (val === 'poli');
     ST.idx = val === 'poli' ? '1.59' : val;
  } else {
     ST[field] = val;
  }
  var qNew = zeissQuote();
  var pvpNew = qNew && qNew.disponible ? qNew.pvp : 0;
  
  if (field === 'mat') {
     ST.poli = oldPoli; ST.idx = oldIdx;
  } else {
     ST[field] = old;
  }
  
  if (ST[field] === val) return 'Incluido';
  if (pvpNew === 0) return 'Incluido';
  return '+$' + pvpNew.toLocaleString('en-US');
}`;

content = content.replace(getPriceTagRegex, cleanGetPriceTag);
fs.writeFileSync('public/asesor_zeiss.html', content);
