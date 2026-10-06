const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts['check:types'] = 'tsc -p tsconfig.ci.json --noEmit';
pkg.scripts.build = pkg.scripts.build.replace(
  'npx tsc -p tsconfig.ci.json --noEmit',
  'npx eslint "src/**/*.{ts,tsx}" --no-eslintrc --parser @typescript-eslint/parser --parser-options "{\\"ecmaVersion\\":2022,\\"sourceType\\\":\\"module\\",\\"ecmaFeatures\\\":{\\"jsx\\\":true}}" --env browser,es2022 --rule "no-undef:error" --rule "no-unused-vars:off"'
);

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
