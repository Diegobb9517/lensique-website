import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, '..', 'public', 'asesor_zeiss.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const scripts = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/g);
let scriptContent = '';
if (scripts) {
  for (const s of scripts) {
    scriptContent += '\n' + s.replace(/<script[\s\S]*?>|<\/script>/g, '');
  }
}

if (!scriptContent) {
  console.error('No script tags found in asesor_zeiss.html');
  process.exit(1);
}

const sandbox = {
  window: {
    location: { search: '' }
  },
  document: {
    getElementById: () => null,
    querySelector: () => null,
  },
  console: console,
  setTimeout: () => {},
  requestAnimationFrame: () => {},
  URLSearchParams: URLSearchParams,
  global: {}
};
sandbox.global = sandbox;

const context = vm.createContext(sandbox);

try {
  vm.runInContext(`
    try {
      ${scriptContent}
    } catch(e) {
      console.log("EXEC ERROR", e);
    }
  `, context);
} catch (e) {
  console.log("VM ERROR", e);
}

const engine = sandbox.ZeissEngine || sandbox.window.ZeissEngine;
if (!engine) {
  console.error("No ZeissEngine found in asesor_zeiss.html");
  process.exit(1);
}

const multFn = sandbox.multFor;
if (!multFn) {
  console.error("No multFor found in asesor_zeiss.html");
  process.exit(1);
}

const defaultQuote = engine.cotizar({
  tipo: "mono",
  esf: 0,
  cil: 0,
  opcion: "chrome",
  indice: "1.5"
});

if (!defaultQuote || !defaultQuote.disponible) {
  console.error("Base quote is not available!");
  process.exit(1);
}

const costoLista = defaultQuote.costoLista;
const m = multFn(costoLista);
const pvp = Math.round(costoLista * 1.16 * m / 50) * 50;

console.log(`Calculated Base PVP from motor: $${pvp}`);

const constantsPath = path.join(__dirname, '..', 'src', 'lib', 'constants.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');
const match = constantsContent.match(/export const BASE_LENS_PRICE\s*=\s*(\d+);/);
if (!match) {
  console.error("BASE_LENS_PRICE not found in src/lib/constants.ts");
  process.exit(1);
}

const definedBasePrice = parseInt(match[1], 10);

if (pvp !== definedBasePrice) {
  console.error(`ERROR: BASE_LENS_PRICE in constants.ts is $${definedBasePrice}, but motor calculated $${pvp}`);
  process.exit(1);
}

console.log(`✅ BASE_LENS_PRICE ($${definedBasePrice}) validado correctamente con el motor de ZEISS.`);
