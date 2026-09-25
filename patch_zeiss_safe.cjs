const fs = require('fs');
let content = fs.readFileSync('public/asesor_zeiss.html', 'utf8');

const regex = /var diff = pvpNew - pvpCurrent;\s*if\s*\([^\n]+\s*if\s*\([^\n]+\s*return 'Incluido';/;
const replacementStr = `  if (ST[field] === val) return 'Incluido';
  if (pvpNew === 0) return 'Incluido';
  return '+$' + pvpNew.toLocaleString('en-US');`;

if (content.match(regex)) {
  content = content.replace(regex, replacementStr);
  fs.writeFileSync('public/asesor_zeiss.html', content);
  console.log("Successfully replaced getPriceTag logic");
} else {
  console.error("Could not find the target string in public/asesor_zeiss.html");
}
