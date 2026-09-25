import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const htmlFilePath = path.join(__dirname, '../public/asesor_zeiss.html');

// Leemos constants de forma manual o podemos importarla dinámicamente
// Para evitar problemas de ESM con TS en build scripts, leemos BASE_LENS_PRICE vía regex
const constantsPath = path.join(__dirname, '../src/lib/constants.ts');
const constantsCode = fs.readFileSync(constantsPath, 'utf8');
const baseLensPriceMatch = constantsCode.match(/export const BASE_LENS_PRICE = (\d+);/);
if (!baseLensPriceMatch) {
  console.error("No se pudo extraer BASE_LENS_PRICE de constants.ts");
  process.exit(1);
}
const BASE_LENS_PRICE = parseInt(baseLensPriceMatch[1], 10);

const html = fs.readFileSync(htmlFilePath, 'utf8');

// Extraer el bloque IIFE de ZeissEngine
const iifeMatch = html.match(/\(function \(global\)[^]*?\}\)\(typeof globalThis !== 'undefined' \? globalThis : this\);/);
if (!iifeMatch) {
  console.error("No se encontró el bloque ZeissEngine en asesor_zeiss.html");
  process.exit(1);
}

// Extraer la función multFor
const multForMatch = html.match(/function multFor\([^\)]+\)\{[^}]+\}/);
let multForCode = "function multFor(c){c=c||0;return c<600?2.45:c<1500?2.2:c<3000?2.1:2.0;}"; // fallback
if (multForMatch) {
  multForCode = multForMatch[0];
}

let globalMock = {};
try {
  // Ejecutar el IIFE para poblar globalMock.ZeissEngine
  const engineCode = iifeMatch[0].replace(/typeof globalThis !== 'undefined' \? globalThis : this/, 'globalMock');
  eval(`(function() {
    const window = {};
    ${engineCode}
  })();`);
  
  const wrappedMultFor = `
    ${multForCode}
    globalMock.multFor = multFor;
  `;
  eval(wrappedMultFor);

  const r = globalMock.ZeissEngine.cotizar({ tipo: "mono", esf: 0, cil: 0, opcion: "chrome", indice: "1.5" });
  if (!r || !r.disponible) throw new Error("La cotización base no devolvió resultado disponible.");
  
  const calculatedBasePrice = Math.round(r.costoLista * 1.16 * globalMock.multFor(r.costoLista) / 50) * 50;

  if (calculatedBasePrice !== BASE_LENS_PRICE) {
    console.error(`ERROR EN BUILD: BASE_LENS_PRICE ($${BASE_LENS_PRICE}) NO COINCIDE con el motor de cotización ZEISS ($${calculatedBasePrice}).`);
    process.exit(1);
  } else {
    console.log(`✅ BASE_LENS_PRICE ($${BASE_LENS_PRICE}) validado correctamente con el motor de ZEISS.`);
  }

} catch(e) {
  console.error("Error validando BASE_LENS_PRICE:", e);
  process.exit(1);
}
