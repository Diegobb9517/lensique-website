const { execSync } = require('child_process');
try {
  const out1 = execSync('git grep -nE "(TELEGRAM|MP_|MERCADOPAGO|ACCESS_TOKEN|TURSO|R2_|SECRET|API_KEY|PRIVATE)[A-Z_]*\\s*[:=]\\s*[\\\'\\"][A-Za-z0-9_:\\-.]{16,}" -- . ":!package-lock.json"', { encoding: 'utf8' });
  console.log('--- GIT GREP SECRETS WEB ---');
  console.log(out1);
} catch (e) {
  if (e.stdout) {
    console.log('--- GIT GREP SECRETS WEB ---');
    console.log(e.stdout);
  } else {
    console.log('--- GIT GREP SECRETS WEB --- (No matches or error: ' + e.message + ')');
  }
}
try {
  const out2 = execSync('git log -p --all -S "APP_USR" --oneline', { encoding: 'utf8' });
  console.log('--- GIT LOG APP_USR WEB ---');
  console.log(out2.split('\n').slice(0, 50).join('\n'));
} catch (e) {
  if (e.stdout) {
    console.log('--- GIT LOG APP_USR WEB ---');
    console.log(e.stdout.split('\n').slice(0, 50).join('\n'));
  } else {
    console.log('--- GIT LOG APP_USR WEB --- (No matches or error: ' + e.message + ')');
  }
}
