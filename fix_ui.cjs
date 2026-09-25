const fs = require('fs');

const path = 'public/asesor_zeiss.html';
let code = fs.readFileSync(path, 'utf8');

// 1. Rewrite bigOpt function
const oldBigOpt = `function bigOpt(sel,ic,nm,ds,attr,pTag){return '<div class="big'+(sel?" sel":"")+'" '+attr+'>'+(ic?'<div class="ic">'+ic+'</div>':'')+'<div><div class="nm">'+nm+'</div><div class="ds">'+ds+(pTag?pTag:'')+'</div></div><div class="ck">'+(sel?"✓":"")+'</div></div>';}`;
const newBigOpt = `function bigOpt(sel,ic,nm,ds,attr,pTag){return '<div class="big'+(sel?" sel":"")+'" '+attr+'>'+(ic?'<div class="ic">'+ic+'</div>':'')+'<div style="flex:1"><div class="nm">'+nm+'</div><div class="ds">'+ds+'</div></div>'+(pTag?'<div style="margin-left:auto">'+pTag+'</div>':'')+'<div class="ck" style="margin-left:'+(pTag?'10px':'auto')+'">'+(sel?"✓":"")+'</div></div>';}`;

if (code.includes(oldBigOpt)) {
  code = code.replace(oldBigOpt, newBigOpt);
} else {
  console.log('oldBigOpt not found');
}

// 2. Rewrite pt function
const oldPt = `function pt(f,v){return '<span class="priceTag" style="font-size:12px;color:#16a34a;font-weight:700;margin-top:4px;background:#f0fdf4;padding:2px 6px;border-radius:12px;display:inline-block">'+getPriceTag(f,v)+'</span>';}`;
const newPt = `function pt(f,v){return '<span class="priceTag" style="font-size:12px;color:#16a34a;font-weight:700;background:#f0fdf4;padding:3px 8px;border-radius:12px;display:inline-block;white-space:nowrap">'+getPriceTag(f,v)+'</span>';}`;

if (code.includes(oldPt)) {
  code = code.replace(oldPt, newPt);
} else {
  console.log('oldPt not found');
}

// 3. Rewrite AR premium toggle
const oldAr = `return '<div class="toggle'+(on?' on':'')+'" style="margin-top:10px" onclick="ST.arPremium=!ST.arPremium;render()"><span class="sw"></span><div><div class="tt">Mejorar a AR premium</div><div class="td">Repele agua y grasa · más resistente a rayas · se limpia más fácil'+(d>0?' · +'+money(d):'')+'</div></div></div>';`;
const newAr = `return '<div class="toggle'+(on?' on':'')+'" style="margin-top:10px" onclick="ST.arPremium=!ST.arPremium;render()"><span class="sw"></span><div style="flex:1"><div class="tt">Mejorar a AR premium</div><div class="td">Repele agua y grasa · más resistente a rayas · se limpia más fácil</div></div>'+(d>0?'<div style="margin-left:auto"><span class="priceTag" style="font-size:12px;color:#16a34a;font-weight:700;background:#f0fdf4;padding:3px 8px;border-radius:12px;display:inline-block;white-space:nowrap">+$'+d.toLocaleString('en-US')+'</span></div>':'')+'</div>';`;

if (code.includes(oldAr)) {
  code = code.replace(oldAr, newAr);
} else {
  console.log('oldAr not found');
}

fs.writeFileSync(path, code);
console.log('UI formatting applied');
