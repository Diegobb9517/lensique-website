const fs = require('fs');

const path = 'public/asesor_zeiss.html';
let code = fs.readFileSync(path, 'utf8');

// The line is currently broken (ends at white-space:nowrap">+ )
// Let's replace the broken line entirely
const brokenLineRegex = /return '<div class="toggle'\+\(on\?' on':''\)\+'" style="margin-top:10px" onclick="ST\.arPremium=!ST\.arPremium;render\(\)"><span class="sw"><\/span><div style="flex:1"><div class="tt">Mejorar a AR premium<\/div><div class="td">Repele agua y grasa · más resistente a rayas · se limpia más fácil<\/div><\/div>'\+\(d>0\?'<div style="margin-left:auto"><span class="priceTag" style="font-size:12px;color:#16a34a;font-weight:700;background:#f0fdf4;padding:3px 8px;border-radius:12px;display:inline-block;white-space:nowrap">\+/;

const correctLine = " return '<div class=\"toggle'+(on?' on':'')+'\" style=\"margin-top:10px\" onclick=\"ST.arPremium=!ST.arPremium;render()\"><span class=\"sw\"></span><div style=\"flex:1\"><div class=\"tt\">Mejorar a AR premium</div><div class=\"td\">Repele agua y grasa · más resistente a rayas · se limpia más fácil</div></div>'+(d>0?'<div style=\"margin-left:auto\"><span class=\"priceTag\" style=\"font-size:12px;color:#16a34a;font-weight:700;background:#f0fdf4;padding:3px 8px;border-radius:12px;display:inline-block;white-space:nowrap\">+$'+money(d)+'</span></div>':'')+'</div>';";

if (code.match(brokenLineRegex)) {
  const lines = code.split('\\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(brokenLineRegex)) {
      lines[i] = correctLine;
      break;
    }
  }
  fs.writeFileSync(path, lines.join('\\n'));
  console.log('Fixed broken AR premium line');
} else {
  console.log('brokenLineRegex not found');
}
