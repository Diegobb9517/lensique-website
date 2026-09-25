import fs from 'fs';
import { execSync } from 'child_process';

console.log('Compiling delivery.ts for iframe...');

let code = fs.readFileSync('src/lib/delivery.ts', 'utf8');
// Remove exports so they become global variables in the browser script
code = code.replace(/export /g, '');

fs.writeFileSync('temp_delivery.ts', code);

try {
  execSync('npx tsc temp_delivery.ts --target ES2015 --module none --outFile public/delivery.js --skipLibCheck --noResolve', { stdio: 'inherit' });
  console.log('Successfully generated public/delivery.js');
} catch (e) {
  console.error('Failed to compile delivery.ts:', e.message);
} finally {
  if (fs.existsSync('temp_delivery.ts')) {
    fs.unlinkSync('temp_delivery.ts');
  }
}
