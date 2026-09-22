const fs = require('fs');

const p = 'public/asesor_zeiss.html';
let content = fs.readFileSync(p, 'utf8');

content = content.replace(
  /function bigOpt\(sel,ic,nm,ds,attr\)\{return '<div class="big'\+\(sel\?" sel":"\"\)\+'" '\+attr\+'>'\+\(ic\?'<div class="ic">'\+ic\+'<\/div>':''\)\+'<div><div class="nm">'\+nm\+'<\/div><div class="ds">'\+ds\+'<\/div><\/div><div class="ck">'\+\(sel\?"✓":"\"\)\+'<\/div><\/div>';\}/g,
  `function bigOpt(sel,ic,nm,ds,attr,pTag){return '<div class="big'+(sel?" sel":"")+'" '+attr+'>'+(ic?'<div class="ic">'+ic+'</div>':'')+'<div><div class="nm">'+nm+'</div><div class="ds">'+ds+(pTag?pTag:'')+'</div></div><div class="ck">'+(sel?"✓":"")+'</div></div>';}`
);

content = content.replace(
  /\["mono","prog","bif"\]\.forEach\(function\(k\)\{o1\+=bigOpt\(ST\.type===k,IC\[TYPES\[k\]\.ic\],TYPES\[k\]\.nm,TYPES\[k\]\.ds,'onclick="pick\\('type\\','\+k\+'\\)'"'\);\}/g,
  `["mono","prog","bif"].forEach(function(k){var pt='<div style="font-size:12px;color:#16a34a;font-weight:700;margin-top:4px;background:#f0fdf4;padding:2px 6px;border-radius:12px;display:inline-block">'+getPriceTag('type',k)+'</div>';o1+=bigOpt(ST.type===k,IC[TYPES[k].ic],TYPES[k].nm,TYPES[k].ds,'onclick="pick(\\'type\\',\\''+k+'\\')" ',pt);}`
);

content = content.replace(
  /treatList\(\)\.forEach\(function\(t\)\{o2\+=bigOpt\(ST\.treat===t\.k,IC\[t\.k\],t\.nm,t\.ds,'onclick="pick\\('treat\\','\+t\.k\+'\\)'"'\);if\(t\.k==="ar"&&ST\.treat==="ar"\)o2\+=arUpgradeBlock\(\);if\(t\.k==="foto"&&ST\.treat==="foto"\)o2\+=fotoColorBlock\(\);if\(t\.k==="entintado"&&ST\.treat==="entintado"\)o2\+=tintBlock\(\);\}/g,
  `treatList().forEach(function(t){var pt='<div style="font-size:12px;color:#16a34a;font-weight:700;margin-top:4px;background:#f0fdf4;padding:2px 6px;border-radius:12px;display:inline-block">'+getPriceTag('treat',t.k)+'</div>';o2+=bigOpt(ST.treat===t.k,IC[t.k],t.nm,t.ds,'onclick="pick(\\'treat\\',\\''+t.k+'\\')" ',pt);if(t.k==="ar"&&ST.treat==="ar")o2+=arUpgradeBlock();if(t.k==="foto"&&ST.treat==="foto")o2+=fotoColorBlock();if(t.k==="entintado"&&ST.treat==="entintado")o2+=tintBlock();}`
);

content = content.replace(
  /LEVELS\.forEach\(function\(l\)\{o3\+=bigOpt\(ST\.level===l\.k,"",l\.nm,l\.ds,'onclick="pick\\('level\\','\+l\.k\+'\\)'"'\);\}/g,
  `LEVELS.forEach(function(l){var pt='<div style="font-size:12px;color:#16a34a;font-weight:700;margin-top:4px;background:#f0fdf4;padding:2px 6px;border-radius:12px;display:inline-block">'+getPriceTag('level',l.k)+'</div>';o3+=bigOpt(ST.level===l.k,"",l.nm,l.ds,'onclick="pick(\\'level\\',\\''+l.k+'\\')" ',pt);}`
);

fs.writeFileSync(p, content);
console.log('done');
