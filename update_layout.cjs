const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const newCode = `                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginBottom: '16px' }}>
                  <h2 className="product-detail-name" style={{ margin: 0, width: '100%', lineHeight: '1.2' }}>
                    {getDisplayName(selectedProductDetail)}
                  </h2>
                  {(() => {
                    const isFrame = !String(selectedProductDetail.category || '').toLowerCase().includes('sol') && !String(selectedProductDetail.category || '').toLowerCase().includes('contacto');
                    const basePrice = selectedProductDetail.price_incl_tax || 0;
                    const finalPrice = isFrame ? basePrice + BASE_LENS_PRICE : basePrice;
                    
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ color: '#16a34a', fontSize: '32px', fontWeight: 700, whiteSpace: 'nowrap' }} className="tabular-nums">\${finalPrice.toLocaleString('en-US')}{String(selectedProductDetail.category || '').toLowerCase().includes('contacto') ? ' / caja' : ''}</span>
                        {isFrame && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '13px', color: '#059669', fontWeight: 500, marginTop: '4px' }}>Incluye micas antirreflejantes, examen de la vista y armado</span>
                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 400, marginTop: '2px' }}>Armazón \${basePrice.toLocaleString('en-US')} + Micas \\$1,200</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>`;

const rx = /<h2 className="product-detail-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>.*?<\/h2>/s;

if(rx.test(content)) {
  fs.writeFileSync('src/App.tsx', content.replace(rx, newCode));
  console.log('Successfully updated layout.');
} else {
  console.log('Regex did not match.');
}
