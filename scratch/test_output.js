import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';
import jsdom from 'jsdom';

const { JSDOM } = jsdom;
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

const dom = new JSDOM(`<!DOCTYPE html><body><div id="topBar"></div><div id="up"></div></body>`, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

const sandbox = {
  window,
  document,
  console: console,
  setTimeout: () => {},
  requestAnimationFrame: () => {},
  URLSearchParams: window.URLSearchParams,
  ZeissEngine: {
    cotizar: () => ({ disponible: true, costoLista: 1000, pvp: 3000, mult: 1, etiqueta: 'Progresivo', indice: '1.5', entrega: '30 sep - 2 oct' })
  },
  MULT: 1,
  framePrice: 2000,
  $: (id) => document.getElementById(id),
  TINTS: { cafe: ['Café', ''], gris: ['Gris', ''], verde: ['Verde', ''] },
  IC: { ar: '', azul: '', foto: '', polar: '', invisible: '', entintado: '', espejo: '' },
  LEVELS: [
    {k:"precision",nm:"Precision Classic",ds:"Progresivo de entrada."},
    {k:"pure",nm:"SmartLife Pure",ds:"Progresivo cómodo para todo el día."},
    {k:"plus",nm:"SmartLife Plus",ds:"Progresivo con campos amplios."},
    {k:"superb",nm:"SmartLife Superb",ds:"Progresivo con campos amplios y adaptación rápida."},
    {k:"individual",nm:"SmartLife Individual 3",ds:"Progresivo personalizado a la medida."}
  ]
};

const context = vm.createContext(sandbox);

try {
  vm.runInContext(scriptContent, context);
  vm.runInContext(`
    ST = fresh();
    ST.type = 'prog';
    // simulate pick('type', 'prog')
    ST.level = 'precision';
    
    // Check tags
    const ptCalls = LEVELS.map(l => ({ name: l.nm, tag: getPriceTag('level', l.k) }));
    console.log("--- ETIQUETAS DE PROGRESIVO ---");
    ptCalls.forEach(c => console.log(c.name + ': ' + c.tag));
    
    // Render top bar
    renderTopBar();
    console.log("\\n--- STICKY BAR ---");
    console.log(document.getElementById('topBar').textContent);
    
    // Render summary
    const summaryHTML = renderSummary();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = summaryHTML;
    console.log("\\n--- RESUMEN Y TU TOTAL ---");
    console.log(tempDiv.textContent.replace(/\\s+/g, ' '));
  `, context);
} catch(e) {
  console.log("VM Error:", e);
}
