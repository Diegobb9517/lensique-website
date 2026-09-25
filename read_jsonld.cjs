const fs = require('fs');
const html = fs.readFileSync('dist/producto/ray-ban-0rx3447v-0rx3447v/index.html', 'utf8');
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
if (match) {
  match.forEach(m => console.log(m));
} else {
  console.log("No JSON-LD found");
}
