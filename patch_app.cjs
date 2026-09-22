const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /if\s*\(product\)\s*\{\s*window\.history\.pushState\(null,\s*'',\s*'\/armazones'\);\s*\}/;

const replacement = `if (product) {
          if (window.history.state && window.history.state.productId) {
            window.history.back();
          } else {
            window.history.pushState(null, '', '/armazones');
          }
        }`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content);
    console.log('App.tsx updated successfully.');
} else {
    console.log('Regex did not match.');
}
