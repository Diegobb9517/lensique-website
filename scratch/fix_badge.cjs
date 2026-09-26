const fs = require('fs');
let code = fs.readFileSync('src/components/ProductCard.tsx', 'utf8');

const regex = /<div className="out-of-stock-badge" style={{ background:[^>]+}}>/g;
code = code.replace(regex, '<div className="out-of-stock-badge">');

fs.writeFileSync('src/components/ProductCard.tsx', code);
