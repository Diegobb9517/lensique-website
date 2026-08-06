const fs = require('fs');
let f = fs.readFileSync('public/asesor_zeiss.html', 'utf8');

const oldPayload = 'var payload={etiqueta:q.etiqueta,indice:q.indice,tipoFab:q.tipoFab,entrega:q.entrega,costoLista:q.costoLista,pvp:q.pvp,ordenZEISS:q.ordenZEISS,productoZEISS:q.productoZEISS,color:q.color,esfera:ST.esf,cilindro:ST.cil,adicion:(ST.type!=="mono"?ST.add:null),pd:(ST.pdAsym?{od:ST.pdR,oi:ST.pdL}:ST.pd),od:{esf:ST.odE,cil:ST.odC,eje:ST.odAx,add:ST.odAdd},oi:{esf:ST.oiE,cil:ST.oiC,eje:ST.oiAx,add:ST.oiAdd}};';
const newPayload = 'var payload={etiqueta:q.etiqueta,indice:q.indice,tipoFab:q.tipoFab,entrega:q.entrega,costoLista:q.costoLista,pvp:q.pvp,ordenZEISS:q.ordenZEISS,productoZEISS:q.productoZEISS,color:q.color,esfera:ST.esf,cilindro:ST.cil,adicion:(ST.type!=="mono"?ST.add:null),pd:(ST.pdAsym?{od:ST.pdR,oi:ST.pdL}:ST.pd),od:{esf:ST.odE,cil:ST.odC,eje:ST.odAx,add:ST.odAdd},oi:{esf:ST.oiE,cil:ST.oiC,eje:ST.oiAx,add:ST.oiAdd},rxMethod:ST.rxMethod,rxFileName:ST.rxFileName,rxFileBase64:ST.rxFileBase64,rxText:rxText()};';

f = f.replace(oldPayload, newPayload);

fs.writeFileSync('public/asesor_zeiss.html', f, 'utf8');
fs.writeFileSync('public/cotizador/index.html', f, 'utf8');
console.log("Updated payload!");
