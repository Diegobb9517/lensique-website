const fs = require('fs');
let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// Add state for OD/OS quantities inside App component
const stateRegex = /(const \[isProductModalOpen, setIsProductModalOpen\] = useState\(false\);)/;
if (appTsx.includes('const [isProductModalOpen, setIsProductModalOpen] = useState(false);') && !appTsx.includes('clQuantityOD')) {
  appTsx = appTsx.replace(stateRegex, `$1\n  const [clQuantityOD, setClQuantityOD] = useState(1);\n  const [clQuantityOS, setClQuantityOS] = useState(0);\n`);
}

// Reset quantities when opening a product
const openProductRegex = /(setSelectedProductDetail\(product\);\n\s*setIsProductModalOpen\(true\);)/;
if (appTsx.match(openProductRegex)) {
  appTsx = appTsx.replace(openProductRegex, `setClQuantityOD(1);\n    setClQuantityOS(0);\n    $1`);
}

// The new product detail info column replacing the old one
const newInfoCol = `              <div className="product-detail-info-col">
                <span className="product-detail-category">{selectedProductDetail.brand || selectedProductDetail.category || 'Lensique'}</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                  <h2 className="product-detail-name" style={{ margin: 0, width: '100%', lineHeight: '1.2' }}>
                    {toTitleCase(getDisplayName(selectedProductDetail))}
                  </h2>

                  {/* Pastillas de beneficio */}
                  <div className="product-benefit-container">
                    {String(selectedProductDetail.category || '').toLowerCase().includes('contacto') ? (
                      <>
                        <span className="product-benefit-pill">Validacin por optometrista</span>
                        <span className="product-benefit-pill">{calculateDeliveryTime(selectedProductDetail).label}</span>
                        <span className="product-benefit-pill">Devolucin de cajas selladas 15 das</span>
                      </>
                    ) : (
                      <>
                        <span className="product-benefit-pill">Micas antirreflejantes incluidas</span>
                        <span className="product-benefit-pill">Examen de la vista incluido</span>
                        <span className="product-benefit-pill">Garanta de adaptacin 30 das</span>
                      </>
                    )}
                  </div>

                  {/* Precio */}
                  {(() => {
                    const isFrame = !String(selectedProductDetail.category || '').toLowerCase().includes('sol') && !String(selectedProductDetail.category || '').toLowerCase().includes('contacto');
                    const isContactLens = String(selectedProductDetail.category || '').toLowerCase().includes('contacto');
                    const basePrice = selectedProductDetail.price_incl_tax || 0;
                    const finalPrice = isFrame ? basePrice + BASE_LENS_PRICE : basePrice;
                    
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                        {isContactLens ? (
                          <>
                            <div className="product-detail-price">
                              Caja de {selectedProductDetail.name?.includes('1 DAY') || selectedProductDetail.name?.includes('DIARIO') ? '30' : '6'} lentes  <span style={{fontWeight: 700}}>\${finalPrice.toLocaleString('en-US')}</span> / caja
                            </div>
                            
                            {/* Selector de cantidad para lentes de contacto */}
                            <div style={{ width: '100%', marginBottom: '8px' }}>
                              <div className="cl-qty-selector">
                                <span style={{ width: '140px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>Ojo derecho (OD)</span>
                                <div className="cl-qty-controls">
                                  <button className="cl-qty-btn" onClick={() => setClQuantityOD(Math.max(0, clQuantityOD - 1))}>-</button>
                                  <span className="cl-qty-value">{clQuantityOD}</span>
                                  <button className="cl-qty-btn" onClick={() => setClQuantityOD(clQuantityOD + 1)}>+</button>
                                </div>
                              </div>
                              <div className="cl-qty-selector">
                                <span style={{ width: '140px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>Ojo izquierdo (OS)</span>
                                <div className="cl-qty-controls">
                                  <button className="cl-qty-btn" onClick={() => setClQuantityOS(Math.max(0, clQuantityOS - 1))}>-</button>
                                  <span className="cl-qty-value">{clQuantityOS}</span>
                                  <button className="cl-qty-btn" onClick={() => setClQuantityOS(clQuantityOS + 1)}>+</button>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="product-detail-price">
                              <span style={{fontWeight: 700}}>\${finalPrice.toLocaleString('en-US')}</span>  micas incluidas
                            </div>
                            {isFrame && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 400 }}>Armazn \${basePrice.toLocaleString('en-US')}  Micas \$1,200</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
                
                {/* Fecha de Entrega */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#334155', fontSize: '14px', marginBottom: '24px' }}>
                  <Clock size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#64748b' }} />
                  <div>
                    <div style={{ color: '#0f172a' }}>{calculateDeliveryTime(selectedProductDetail).label}  te avisamos por WhatsApp</div>
                    {(!String(selectedProductDetail.category || '').toLowerCase().includes('contacto') && selectedProductDetail.stock != null && selectedProductDetail.stock !== '' && Number(selectedProductDetail.stock) <= 0) && (
                      <div style={{ marginTop: '4px' }}>
                        <a href="/catalogo?disponibilidad=existencia" style={{ fontSize: '12px', color: '#0ea5e9', textDecoration: 'underline' }}>Lo necesitas antes? Ver modelos en existencia  </a>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  className="btn btn-primary full-width product-detail-btn"
                  style={{ marginBottom: '16px' }}
                  onClick={() => {
                    if (String(selectedProductDetail.category || '').toLowerCase().includes('contacto')) {
                      // Total quantity selected
                      if (clQuantityOD === 0 && clQuantityOS === 0) {
                        alert("Por favor selecciona al menos 1 caja.");
                        return;
                      }
                      setContactConfiguratorProduct(selectedProductDetail);
                      setIsProductModalOpen(false);
                      // Tracking
                      if (typeof window.fbq === 'function') {
                        window.fbq('track', 'AddToCart', {
                          content_type: 'product',
                          content_ids: [selectedProductDetail.id],
                          content_name: formatProductTitle(selectedProductDetail, 'Lentes de Contacto'),
                          value: (selectedProductDetail.price_incl_tax || 0) * (clQuantityOD + clQuantityOS),
                          currency: 'MXN'
                        });
                      }
                    } else if (String(selectedProductDetail.category || '').toLowerCase().includes('sol')) {
                      addToCart({
                        type: 'product',
                        title: formatProductTitle(selectedProductDetail, 'Lentes de Sol'),
                        quantity: 1,
                        unit_price: selectedProductDetail.price_incl_tax || 0,
                        product: selectedProductDetail
                      });
                      setIsProductModalOpen(false);
                    } else {
                      setLensConfiguratorProduct(selectedProductDetail);
                      setIsProductModalOpen(false);
                    }
                  }}
                >
                  {String(selectedProductDetail.category || '').toLowerCase().includes('contacto') 
                    ? \`Continuar  \$\${((selectedProductDetail.price_incl_tax || 0) * (clQuantityOD + clQuantityOS || 1)).toLocaleString('en-US')}\` 
                    : String(selectedProductDetail.category || '').toLowerCase().includes('sol') ? 'Agregar al Carrito' : 'Seleccionar micas y comprar'}
                </button>

                <div className="product-trust-row">
                  <div className="product-trust-item"><Stethoscope size={16} /> Validacin por optometrista</div>
                  <div className="product-trust-item"><ShieldCheck size={16} /> Pago seguro con Mercado Pago</div>
                  <div className="product-trust-item"><MapPin size={16} /> Recoge en tienda o envo a domicilio</div>
                </div>
                
                {(!String(selectedProductDetail.category || '').toLowerCase().includes('contacto')) && (
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <p className="product-detail-note" style={{ margin: 0, fontSize: '13px' }}>
                      Prefieres probrtelo? <a href="/agendar-cita" style={{ color: '#0ea5e9', textDecoration: 'underline' }}>Agenda tu cita</a>
                    </p>
                  </div>
                )}
                
                {selectedProductDetail.sku && (
                  <p className="product-detail-sku" style={{ fontSize: '11px', color: '#9ca3af', marginTop: '32px', textAlign: 'center' }}>
                    SKU: {selectedProductDetail.sku}
                  </p>
                )}
              </div>`;

// Replace the old info col block
const oldInfoColRegex = /<div className="product-detail-info-col">[\s\S]*?(?=<\/div>\s*<\/div>\s*<\/motion\.div>\s*<\/div>\s*<\/AnimatePresence>)/;
if (appTsx.match(oldInfoColRegex)) {
  appTsx = appTsx.replace(oldInfoColRegex, newInfoCol);
}

// Pass state to ContactLensConfiguratorModal
const modalRegex = /<ContactLensConfiguratorModal\s*product=\{contactConfiguratorProduct\}\s*onClose=\{.*?\}\s*\/>/s;
if (appTsx.match(modalRegex)) {
  appTsx = appTsx.replace(modalRegex, `<ContactLensConfiguratorModal
          product={contactConfiguratorProduct}
          onClose={() => setContactConfiguratorProduct(null)}
          initialQuantityOD={clQuantityOD}
          initialQuantityOS={clQuantityOS}
        />`);
}

fs.writeFileSync('src/App.tsx', appTsx);
console.log('Updated App.tsx');
