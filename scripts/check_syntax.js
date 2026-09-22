import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlFilePath = path.join(__dirname, '../public/asesor_zeiss.html');
const tempDir = path.join(__dirname, '../scratch/syntax_checks');

if (!fs.existsSync(htmlFilePath)) {
  console.log('No asesor_zeiss.html found, skipping syntax check.');
  process.exit(0);
}

const html = fs.readFileSync(htmlFilePath, 'utf8');

// Match <script> blocks
const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let match;
let hasError = false;
let blockIndex = 0;

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

while ((match = scriptRegex.exec(html)) !== null) {
  const attrs = match[1];
  const content = match[2];
  
  if (!content.trim()) continue; // Skip empty scripts or src only

  const isModule = /type\s*=\s*['"]module['"]/i.test(attrs);
  const ext = isModule ? '.mjs' : '.js';
  const tempFile = path.join(tempDir, `script_block_${blockIndex}${ext}`);
  
  fs.writeFileSync(tempFile, content);
  
  try {
    execSync(`node --check ${tempFile}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`SyntaxError found in script block ${blockIndex} (isModule: ${isModule})`);
    hasError = true;
  }
  
  blockIndex++;
}

// Clean up
try {
  fs.rmSync(tempDir, { recursive: true, force: true });
} catch (e) {}

if (hasError) {
  console.error('\nSyntax checks failed! See errors above.');
  process.exit(1);
} else {
  console.log('Syntax check passed.');
}
