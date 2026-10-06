const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Inject State
const stateInjection = `  const [selectedProductDetail, setSelectedProductDetail] = useState<any | null>(null);
  const [clQuantityOD, setClQuantityOD] = useState(1);
  const [clQuantityOS, setClQuantityOS] = useState(0);

  useEffect(() => {
    if (selectedProductDetail) {
      setClQuantityOD(1);
      setClQuantityOS(0);
    }
  }, [selectedProductDetail]);`;

appTsx = appTsx.replace(/  const \[selectedProductDetail, setSelectedProductDetail\] = useState<any \| null>\(null\);/, stateInjection);

// 2. Replace product-detail-info-col
const newRightCol = `              {/* Right: Info */}
              <div className="product-detail-info-col">
                <span className="product-detail-category">{selectedProductDetail.brand || selectedProductDetail.category || 'Lensique'}</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                  <h2 className="product-detail-name" style={{ margin: 0, width: '100%', lineHeight: '1.2' }}>
                    {toTitleCase(getDisplayName(selectedProductDetail))}
                  </h2>

                  {/* Pastillas de beneficio */}
                  <div className="product-benefit-container">
                    {String(selectedProductDetail.category || '').toLowerCase().includes('contacto') ? (
                      <>
                        <span className="product-benefit-pill">Validación por optometrista</span>
                        <span className="product-benefit-pill">{calculateDeliveryTime(selectedProductDetail).label}</span>
                        <span className="product-benefit-pill">Devolución de cajas selladas 15 días</span>
                      </>
                    ) : (
                      <>
                        <span className="product-benefit-pill">Micas antirreflejantes incluidas</span>
                        <span className="product-benefit-pill">Examen de la vista incluido</span>
                        <span className="product-benefit-pill">Garantía de adaptación 30 días</span>
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
                            <div className="product-detail-price" style={{ fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 600, color: '#1d1d1f', marginBottom: '16px' }}>
                              Caja de {selectedProductDetail.name?.includes('1 DAY') || selectedProductDetail.name?.includes('DIARIO') ? '30' : '6'} lentes · <span>\${finalPrice.toLocaleString('en-US')}</span> / caja
                            </div>
                            
                            {/* Selector de cantidad para lentes de contacto */}
                            <div style={{ width: '100%', marginBottom: '8px' }}>
                              <div className="cl-qty-selector">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '160px', cursor: 'pointer' }}>
                                  <input type="checkbox" checked readOnly style={{ accentColor: '#1a4cd2', width: '16px', height: '16px' }} />
                                  <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>Ojo derecho (OD)</span>
                                </label>
                                <div className="cl-qty-controls">
                                  <button className="cl-qty-btn" onClick={() => setClQuantityOD(Math.max(0, clQuantityOD - 1))}>−</button>
                                  <span className="cl-qty-value">{clQuantityOD}</span>
                                  <button className="cl-qty-btn" onClick={() => setClQuantityOD(clQuantityOD + 1)}>+</button>
                                </div>
                              </div>
                              <div className="cl-qty-selector">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '160px', cursor: 'pointer' }}>
                                  <input type="checkbox" checked readOnly style={{ accentColor: '#1a4cd2', width: '16px', height: '16px' }} />
                                  <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>Ojo izquierdo (OS)</span>
                                </label>
                                <div className="cl-qty-controls">
                                  <button className="cl-qty-btn" onClick={() => setClQuantityOS(Math.max(0, clQuantityOS - 1))}>−</button>
                                  <span className="cl-qty-value">{clQuantityOS}</span>
                                  <button className="cl-qty-btn" onClick={() => setClQuantityOS(clQuantityOS + 1)}>+</button>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="product-detail-price" style={{ fontFamily: 'Inter, sans-serif', fontSize: '20px', fontWeight: 600, color: '#1d1d1f', marginBottom: '16px' }}>
                              <span>\${finalPrice.toLocaleString('en-US')}</span> · micas incluidas
                            </div>
                            {isFrame && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 400 }}>Armazón \${basePrice.toLocaleString('en-US')} · Micas $1,200</span>
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
                    <div style={{ color: '#0f172a' }}>{calculateDeliveryTime(selectedProductDetail).label} · te avisamos por WhatsApp</div>
                    {(!String(selectedProductDetail.category || '').toLowerCase().includes('contacto') && selectedProductDetail.stock != null && selectedProductDetail.stock !== '' && Number(selectedProductDetail.stock) <= 0) && (
                      <div style={{ marginTop: '4px' }}>
                        <a href="/catalogo?disponibilidad=existencia" style={{ fontSize: '12px', color: '#0ea5e9', textDecoration: 'underline' }}>¿Lo necesitas antes? Ver modelos en existencia →</a>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  className="btn btn-primary full-width product-detail-btn"
                  style={{ marginBottom: '16px' }}
                  onClick={() => {
                    const category = String(selectedProductDetail.category || '').toLowerCase();
                    if (category.includes('contacto')) {
                      // Total quantity selected
                      if (clQuantityOD === 0 && clQuantityOS === 0) {
                        alert("Por favor selecciona al menos 1 caja.");
                        return;
                      }
                      setContactConfiguratorProduct(selectedProductDetail);
                      
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
                    } else if (category.includes('sol')) {
                      const delTime = calculateDeliveryTime(selectedProductDetail);
                      addItem({
                        type: 'product',
                        title: formatProductTitle(selectedProductDetail, 'Lentes de Sol'),
                        quantity: 1,
                        unit_price: selectedProductDetail.price_incl_tax || 0,
                        product: selectedProductDetail,
                        image: selectedProductDetail.image || (selectedProductDetail.images && selectedProductDetail.images[0]?.image_url),
                        estimatedDeliveryStr: delTime.label,
                        estimatedDeliverySubtitle: delTime.subtitle,
                        maxDeliveryDays: delTime.maxDays,
                        minDeliveryDays: delTime.maxDays
                      });
                      setSelectedProductDetail(null);
                    } else {
                      setConfiguratorProduct(selectedProductDetail);
                    }
                  }}
                >
                  {String(selectedProductDetail.category || '').toLowerCase().includes('contacto') 
                    ? \`Continuar — $\${((selectedProductDetail.price_incl_tax || 0) * (clQuantityOD + clQuantityOS || 1)).toLocaleString('en-US')}\` 
                    : String(selectedProductDetail.category || '').toLowerCase().includes('sol') ? 'Comprar por WhatsApp' : 'Seleccionar micas y comprar'}
                </button>

                <div className="product-trust-row">
                  <div className="product-trust-item"><Stethoscope size={16} /> Validación por optometrista</div>
                  <div className="product-trust-item"><ShieldCheck size={16} /> Pago seguro con Mercado Pago</div>
                  <div className="product-trust-item"><MapPin size={16} /> Recoge en tienda o envío a domicilio</div>
                </div>
                
                {(!String(selectedProductDetail.category || '').toLowerCase().includes('contacto')) && (
                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <p className="product-detail-note" style={{ margin: 0, fontSize: '13px' }}>
                      ¿Prefieres probártelo? <a href="/agendar-cita" style={{ color: '#0ea5e9', textDecoration: 'underline' }}>Agenda tu cita</a>
                    </p>
                  </div>
                )}
                
                {selectedProductDetail.sku && (
                  <p className="product-detail-sku" style={{ fontSize: '11px', color: '#9ca3af', marginTop: '32px', textAlign: 'center' }}>
                    SKU: {selectedProductDetail.sku}
                  </p>
                )}
              </div>`;

const regex = /\{\/\* Right: Info \*\/\}\s*<div className="product-detail-info-col">[\s\S]*?<\/div>\s*<\/div>\s*<\/motion\.div>/;
appTsx = appTsx.replace(regex, newRightCol + '\n            </motion.div>');

fs.writeFileSync('src/App.tsx', appTsx);
console.log('Done!');
