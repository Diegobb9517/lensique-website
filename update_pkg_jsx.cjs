const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts.build = pkg.scripts.build.replace(
  '--env browser,es2022',
  '--env browser,es2022 --global JSX'
);

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
