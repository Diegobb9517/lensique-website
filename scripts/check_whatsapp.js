import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

// Get WHATSAPP_NUMBER from constants.ts
const constantsPath = path.join(ROOT_DIR, 'src', 'lib', 'constants.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');
const match = constantsContent.match(/export\s+const\s+WHATSAPP_NUMBER\s*=\s*['"](\d+)['"]/);
if (!match) {
  console.error('Error: Could not find WHATSAPP_NUMBER in src/lib/constants.ts');
  process.exit(1);
}
const WHATSAPP_NUMBER = match[1];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
        walkDir(dirPath, callback);
      }
    } else {
      if (['.tsx', '.ts', '.html', '.js'].includes(path.extname(dirPath))) {
        callback(dirPath);
      }
    }
  });
}

let hasError = false;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Look for wa.me/NUMBER where NUMBER is composed of digits.
  // We can also have https://wa.me/NUMBER
  const regex = /wa\.me\/(\d+)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const foundNumber = match[1];
    if (foundNumber !== WHATSAPP_NUMBER) {
      console.error(`ERROR: Encontrado número duro distinto a la constante en ${path.relative(ROOT_DIR, filePath)}`);
      console.error(`       Encontrado: ${foundNumber}, Esperado: ${WHATSAPP_NUMBER}`);
      hasError = true;
    }
  }
}

walkDir(path.join(ROOT_DIR, 'src'), checkFile);
walkDir(path.join(ROOT_DIR, 'public'), checkFile);

if (hasError) {
  console.error('\nBuild failed: There are hardcoded WhatsApp numbers that do not match WHATSAPP_NUMBER.');
  process.exit(1);
} else {
  console.log('WhatsApp number check passed!');
}
