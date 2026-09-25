import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

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

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('target="_blank"')) {
      if (!line.includes('rel="noopener') && !line.includes('rel=\\"noopener')) {
        console.log(`${path.relative(ROOT_DIR, filePath)}:${i + 1}: ${line.trim()}`);
      }
    }
  });
}

walkDir(path.join(ROOT_DIR, 'src'), checkFile);
walkDir(path.join(ROOT_DIR, 'public'), checkFile);
