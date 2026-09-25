const fs = require('fs');
const file = 'public/asesor_zeiss.html';
let code = fs.readFileSync(file, 'utf8');

const targetStr = `return '<section class="sec" style="text-align:left; padding-top:28px"><div class="secK">05 — Tu total</div><div style="font-size:11px;color:var(--grey);letter-spacing:1px;text-transform:uppercase;margin:4px 0 6px">El par · IVA incluido</div><div style="font-family:Georgia,serif;font-size:42px;font-weight:600;color:var(--navy);line-height:1;letter-spacing:.5px" class="tabular-nums">'+money(framePrice + (q?q.pvp:0)) + '<div style="font-size:16px;color:var(--grey);font-weight:500;margin-top:4px">Desglose: Armazón '+money(framePrice)+' + Micas '+money(q?q.pvp:0)+'</div>'+'</div>'+'<div class="muted" style="margin-top:8px">'+q.etiqueta+' · índice '+q.indice+'</div><div class="muted" style="margin-top:2px">Incluye armado, protección UV y garantía de adaptación de 30 días · entrega '+q.entrega+' ('+q.tipoFab+')</div>'+abbe+'<div style="margin-top:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-size:12.5px;color:#334155;line-height:1.4"><b>🔒 Garantía Lensique:</b> <a href="/devoluciones" target="_blank" style="color:#0ea5e9;text-decoration:none">Cambio o devolución en 30 días · Validación por optometrista</a></div><div style="margin-top:8px;font-size:12.5px;color:#64748b;text-align:center;">Formas de pago: Tarjeta · OXXO · SPEI</div></section>';`;

const replacement = `return '<section class="sec" style="text-align:left; padding-top:28px"><div class="secK">05 — Tu total</div><div style="font-size:11px;color:var(--grey);letter-spacing:1px;text-transform:uppercase;margin:4px 0 6px">El par · IVA incluido</div><div style="font-family:Georgia,serif;font-size:42px;font-weight:600;color:var(--navy);line-height:1;letter-spacing:.5px" class="tabular-nums">'+money(framePrice + (q?q.pvp:0)) +'</div>'+'<div class="muted" style="margin-top:8px">'+q.etiqueta+' · índice '+q.indice+(q.pvp===0?' — incluido':'')+'</div><div class="muted" style="margin-top:2px">Incluye armado, protección UV y garantía de adaptación de 30 días</div><div class="muted" style="margin-top:4px;color:#16a34a;font-weight:500;">'+q.entrega+'</div>'+abbe+'<div style="margin-top:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;font-size:12.5px;color:#334155;line-height:1.4"><b>🔒 Garantía Lensique:</b> <a href="/devoluciones" target="_blank" style="color:#0ea5e9;text-decoration:none">Cambio o devolución en 30 días · Validación por optometrista</a></div><div style="margin-top:8px;font-size:12.5px;color:#64748b;text-align:center;">Formas de pago: Tarjeta · OXXO · SPEI</div></section>';`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacement);
  fs.writeFileSync(file, code);
  console.log('asesor_zeiss.html priceSection updated');
} else {
  console.log('targetStr not found in asesor_zeiss.html');
}
