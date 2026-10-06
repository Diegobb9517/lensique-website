const { execSync } = require('child_process');
try {
  const out1 = execSync('git grep -nE "(TELEGRAM|MP_|MERCADOPAGO|ACCESS_TOKEN|TURSO|R2_|SECRET|API_KEY|PRIVATE)[A-Z_]*\\s*[:=]\\s*[\\\'\\"][A-Za-z0-9_\\\\-:.]{16,}" -- . ":!package-lock.json"', { encoding: 'utf8' });
  console.log('--- GIT GREP SECRETS WEB ---');
  console.log(out1);
} catch (e) {
  console.log('--- GIT GREP SECRETS WEB --- (No matches or error)');
}
try {
  const out2 = execSync('git log -p --all -S "APP_USR" --oneline', { encoding: 'utf8' });
  console.log('--- GIT LOG APP_USR WEB ---');
  console.log(out2.split('\n').slice(0, 50).join('\n'));
} catch (e) {
  console.log('--- GIT LOG APP_USR WEB --- (No matches or error)');
}
try {
  const out3 = execSync('git ls-files', { encoding: 'utf8' });
  const envFiles = out3.split('\n').filter(f => f.toLowerCase().includes('env'));
  console.log('--- GIT LS-FILES ENV WEB ---');
  console.log(envFiles);
} catch (e) {
  console.log('--- GIT LS-FILES ENV WEB --- (Error)');
}
