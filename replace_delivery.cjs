const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', color: '#16a34a', fontSize: '14px', fontWeight: 500, background: '#f0fdf4', padding: '10px 14px', borderRadius: '10px' }}>
                  <Clock size={16} />
                  <span>Entrega estimada: {calculateDeliveryTime(selectedProductDetail).label}</span>
                </div>`;

const replacement = `<div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '12px', color: '#16a34a', fontSize: '14px', fontWeight: 500, background: '#f0fdf4', padding: '10px 14px', borderRadius: '10px' }}>
                  <Clock size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ marginBottom: '2px', color: '#15803d' }}>{calculateDeliveryTime(selectedProductDetail).label}</div>
                    <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 400 }}>{calculateDeliveryTime(selectedProductDetail).subtitle}</div>
                    {(selectedProductDetail.stock != null && selectedProductDetail.stock !== '' && Number(selectedProductDetail.stock) <= 0) && (
                      <div style={{ marginTop: '6px' }}>
                        <a href="/catalogo?disponibilidad=existencia" style={{ fontSize: '12px', color: '#15803d', textDecoration: 'underline', fontWeight: 500 }}>¿Lo necesitas antes? Ver modelos en existencia →</a>
                      </div>
                    )}
                  </div>
                </div>`;

const targetNormalized = target.replace(/\r\n/g, '\n');
const replacementNormalized = replacement.replace(/\r\n/g, '\n');

if (code.includes(targetNormalized) || code.includes(target)) {
  code = code.replace(target, replacement);
  code = code.replace(targetNormalized, replacementNormalized);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App.tsx updated');
} else {
  console.log('Target not found, trying regex...');
  
  // Create a looser regex for the target
  const looseRegex = /<div style=\{\{\s*display:\s*'flex',\s*alignItems:\s*'center',\s*gap:\s*'8px',\s*marginTop:\s*'12px',\s*color:\s*'#16a34a',\s*fontSize:\s*'14px',\s*fontWeight:\s*500,\s*background:\s*'#f0fdf4',\s*padding:\s*'10px 14px',\s*borderRadius:\s*'10px'\s*\}\}>\s*<Clock size=\{16\} \/>\s*<span>Entrega estimada: \{calculateDeliveryTime\(selectedProductDetail\)\.label\}<\/span>\s*<\/div>/g;
  
  if (looseRegex.test(code)) {
    code = code.replace(looseRegex, replacementNormalized);
    fs.writeFileSync('src/App.tsx', code);
    console.log('App.tsx updated with regex');
  } else {
    console.log('Target still not found. Check exact text in App.tsx');
  }
}
