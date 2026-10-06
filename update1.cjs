const fs = require('fs');

function replaceInFile(filePath, searchRegex, replaceWith) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(searchRegex, replaceWith);
  fs.writeFileSync(filePath, content);
}

// 1. Update format.ts toTitleCase properly
const formatTs = fs.readFileSync('src/lib/format.ts', 'utf8');
const newToTitleCase = `export const toTitleCase = (str: string) => {
  if (!str) return '';
  const preserve = ['UV', 'OD', 'OS', 'OD/OS'];
  return str.split(' ').map(word => {
    const upper = word.toUpperCase();
    if (preserve.includes(upper)) return word; // preserve original if it's one of these
    if (word.match(/^[A-Za-z]+\\d+/)) return word; // preserves RX3447V without lowercasing
    return word.toLowerCase().replace(/(?:^|\\s|-)\\S/g, s => s.toUpperCase());
  }).join(' ');
};`;
fs.writeFileSync('src/lib/format.ts', formatTs.replace(/export const toTitleCase = [\s\S]*?\n\};/, newToTitleCase));
console.log('Updated format.ts');
