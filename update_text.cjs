const fs = require('fs');

// 1. Update App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Add toTitleCase to the import
const importRegex = /(import \{.*?getDisplayName)(.*?\} from '\.\/lib\/format';)/s;
if (importRegex.test(appContent) && !appContent.includes('toTitleCase')) {
  appContent = appContent.replace(importRegex, '$1, toTitleCase$2');
}

// Wrap getDisplayName with toTitleCase
const titleRegex = /\{getDisplayName\(selectedProductDetail\)\}/g;
appContent = appContent.replace(titleRegex, '{toTitleCase(getDisplayName(selectedProductDetail))}');

fs.writeFileSync('src/App.tsx', appContent);
console.log('App.tsx updated');

// 2. Update App.css for .product-detail-name
let cssContent = fs.readFileSync('src/App.css', 'utf8');

const cssRegex = /\.product-detail-name\s*\{\s*font-family:\s*[^;]+;\s*font-size:\s*32px;\s*font-weight:\s*700;\s*color:\s*#1d1d1f;\s*margin:\s*0 0 12px;\s*line-height:\s*1\.1;\s*letter-spacing:\s*-0\.5px;\s*\}/s;
const newCss = `.product-detail-name {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 38px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0 0 16px;
  line-height: 1.2;
  letter-spacing: -0.2px;
}`;

if (cssRegex.test(cssContent)) {
  cssContent = cssContent.replace(cssRegex, newCss);
} else {
  console.log('Strict CSS regex failed, using loose replacement...');
  const looseRegex = /\.product-detail-name\s*\{.*?\}/s;
  // wait we only want to replace the FIRST occurrence in the file, which is the main block, but there is also a media query block.
  // Actually, better to just replace the whole block by finding it manually.
}
// Let's just do a string replace of the exact lines if we know them
// "font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;"
cssContent = cssContent.replace(
  /.product-detail-name\s*\{\s*font-family:\s*'Inter',\s*-apple-system,\s*BlinkMacSystemFont,\s*sans-serif;\s*font-size:\s*32px;\s*font-weight:\s*700;\s*color:\s*#1d1d1f;\s*margin:\s*0\s*0\s*12px;\s*line-height:\s*1.1;\s*letter-spacing:\s*-0.5px;\s*\}/g,
  newCss
);

fs.writeFileSync('src/App.css', cssContent);
console.log('App.css updated');
