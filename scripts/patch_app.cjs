const fs = require('fs');

const p = 'src/App.tsx';
let content = fs.readFileSync(p, 'utf8');

const target = `      {configuratorProduct && (
        <LensConfiguratorModal
          product={configuratorProduct}
          onClose={() => setConfiguratorProduct(null)}
          onComplete={(config) => {
            setConfiguratorProduct(null);`;

const replacement = `      {configuratorProduct && (
        <LensConfiguratorModal
          product={configuratorProduct}
          onClose={() => setConfiguratorProduct(null)}
          onComplete={(config) => {
            setConfiguratorProduct(null);
            setSelectedProductDetail(null);`;

content = content.replace(target, replacement);

fs.writeFileSync(p, content);
console.log('done');
