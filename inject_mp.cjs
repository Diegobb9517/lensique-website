const fs = require('fs');
const file = 'public/cotizador/index.html';
let html = fs.readFileSync(file, 'utf8');

const sendWATarget = "function sendWA(){var t=waText();if(!t){alert('Configura tu lente primero.');return;}window.open('https://wa.me/523316929111?text='+encodeURIComponent(t),'_blank');}";
const sendWAReplacement = sendWATarget + `
function payOnline(){
  var q=zeissQuote();
  if(!q||!q.disponible){alert('Configura tu lente primero.');return;}
  var total = q.pvp;
  var title = q.productoZEISS + (q.color ? ' ' + q.color : '') + ' ' + (q.tipoFab || '');
  var items = [{ title: title.trim(), quantity: 1, unit_price: total }];
  var email = prompt('Ingresa tu correo electrónico para el comprobante de pago (opcional):', '');
  var btn = document.getElementById('payBtn');
  if(btn) btn.innerText = 'Generando pago...';
  fetch('https://lensique-pos.onrender.com/api/checkout/preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: total, items: items, payer_email: email || null })
  }).then(r => r.json()).then(data => {
    if(data.init_point) {
      window.location.href = data.init_point;
    } else {
      alert('Error: ' + (data.error||''));
      if(btn) btn.innerText = 'Pagar en línea';
    }
  }).catch(e => {
    alert('Error de conexión.');
    console.error(e);
    if(btn) btn.innerText = 'Pagar en línea';
  });
}
`;

const btnTarget = "else{_btn='<button class=\"btn next\" id=\"cartBtn\" onclick=\"sendWA()\" style=\"flex:0 0 auto;min-width:250px;padding:12px 26px\">Enviar mi cotización por WhatsApp</button>';}$(\"nav\").innerHTML='<div class=\"navBar\" style=\"justify-content:flex-end\">'+_btn+'</div>';";
const btnReplacement = "else{_btn='<div style=\"text-align:right; margin-right:15px; font-size:12px; color:#555;\"><b>Recolección en tienda (Zapopan)</b><br>Sin costo de envío</div><button class=\"btn next\" id=\"cartBtn\" onclick=\"sendWA()\" style=\"flex:0 0 auto;min-width:250px;padding:12px 26px;margin-right:10px;\">Enviar mi cotización por WhatsApp</button><button class=\"btn next\" id=\"payBtn\" onclick=\"payOnline()\" style=\"flex:0 0 auto;min-width:250px;padding:12px 26px;background:#009ee3;color:white;\">Pagar en línea</button>';}$(\"nav\").innerHTML='<div class=\"navBar\" style=\"justify-content:flex-end; align-items:center;\">'+_btn+'</div>';";

if (html.includes(sendWATarget) && html.includes(btnTarget)) {
  html = html.replace(sendWATarget, sendWAReplacement);
  html = html.replace(btnTarget, btnReplacement);
  fs.writeFileSync(file, html, 'utf8');
  console.log('Successfully injected MercadoPago button in lensique-web/public/cotizador/index.html');
} else {
  console.log('Could not find target strings for injection.');
  if (!html.includes(btnTarget)) {
    console.log('Did not find button target!');
  }
}
