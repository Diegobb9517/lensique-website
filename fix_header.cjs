const fs = require('fs');

const headerHTML = `<header>
  <div style="display:flex; justify-content:space-between; align-items:flex-start;">
    <div>
      <div class="brandrow"><a href="/" target="_top" class="logo" style="text-decoration:none;">Lensique<sup>&reg;</sup></a><div class="hcred">Asesor&iacute;a &oacute;ptica profesional</div></div>
      <div class="s">Encontremos el lente perfecto para ti</div>
    </div>
    <a href="/" target="_top" id="closeBtnStandalone" style="display:none; width:36px; height:36px; border-radius:50%; background:#f1f3f6; color:var(--navy); align-items:center; justify-content:center; text-decoration:none; font-size:16px; margin-top:2px; flex-shrink:0; border:1px solid #e2e6eb;" onmouseover="this.style.background='#e3e7ec'" onmouseout="this.style.background='#f1f3f6'">&#10005;</a>
  </div>
  <script>try{if(window.self===window.top)document.getElementById("closeBtnStandalone").style.display="flex";}catch(e){}</script>
</header>`;

let file = fs.readFileSync('public/asesor_zeiss.html', 'utf8');
file = file.replace(/<header>.*?<\/header>/, headerHTML);
fs.writeFileSync('public/asesor_zeiss.html', file);

let file2 = fs.readFileSync('public/cotizador/index.html', 'utf8');
file2 = file2.replace(/<header>.*?<\/header>/, headerHTML);
fs.writeFileSync('public/cotizador/index.html', file2);
