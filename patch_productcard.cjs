const fs = require('fs');
const path = 'src/components/ProductCard.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<span className="wp-product-price tabular-nums">([\s\S]*?)<\/span>/g;
const replacement = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="wp-product-price tabular-nums">$1</span>
            <span style={{ fontSize: '11px', color: '#16a34a', background: '#f0fdf4', padding: '3px 6px', borderRadius: '4px', fontWeight: 600, border: '1px solid #bbf7d0', flexShrink: 0, marginTop: '2px' }}>
              {calculateDeliveryTime(product).labelShort}
            </span>
          </div>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content);
  console.log('ProductCard updated');
} else {
  console.log('Regex not found');
}
