const fs = require('fs');
const code = fs.readFileSync('public/asesor_zeiss.html', 'utf8');
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('optCard') || lines[i].includes('Mejorar a AR premium') || lines[i].includes('opcion') || lines[i].includes('<div class="td"')) {
    console.log(i + ': ' + lines[i]);
  }
}
