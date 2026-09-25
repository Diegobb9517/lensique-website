const fs = require('fs');
let code = fs.readFileSync('public/asesor_zeiss.html', 'utf8');

code = code.replace(/chipUp\(ST\.poli,"Policarbonato","setPoli\(\)"\)/g, 'chipUp(ST.poli,"Policarbonato resistente","setPoli()")');
code = code.replace(/Índice base · sube para adelgazar/g, 'Delgadez estándar · sube para adelgazar');
code = code.replace(/\(ST\.idx==="1\.74"\?"Ultra delgado y ligero \(1\.74\)":"Más delgado y ligero \(1\.67\)"\)/g, '(ST.idx==="1.74"?"Ultra delgado (1.74)":"Muy delgado (1.67)")');

fs.writeFileSync('public/asesor_zeiss.html', code);
