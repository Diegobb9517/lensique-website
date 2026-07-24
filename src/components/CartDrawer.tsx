import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CreditCard, ShoppingBag, MapPin, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../App';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [formError, setFormError] = useState('');

  const maxDeliveryDays = items.length > 0 ? Math.max(...items.map(i => i.maxDeliveryDays || 0)) : 0;
  let maxDelStr = '';
  if (maxDeliveryDays <= 5) maxDelStr = '3 a 5 días hábiles';
  else if (maxDeliveryDays <= 12) maxDelStr = '1 a 2 semanas';
  else if (maxDeliveryDays <= 21) maxDelStr = '2 a 3 semanas';
  else maxDelStr = '3 a 4 semanas';

  const payOnline = async () => {
    if (items.length === 0) return;
    
    if (!showCheckoutForm) {
      setShowCheckoutForm(true);
      return;
    }
    
    // Validate form
    if (!buyerName.trim() || !buyerPhone.trim() || !buyerEmail.trim()) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }
    const phoneClean = buyerPhone.replace(/\D/g, '');
    if (phoneClean.length !== 10) {
      setFormError('El teléfono debe tener 10 dígitos.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(buyerEmail)) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }
    
    setFormError('');
    try {
      setIsProcessing(true);
      // Guardar en localstorage para la página de exito
      localStorage.setItem('lensique_last_order_delivery', maxDelStr);

      const res = await fetch('https://lensique-pos.onrender.com/api/checkout/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: total, 
          // Enviar el carrito enriquecido para que el backend recalcule los precios
          cart: items,
          estimatedDelivery: maxDelStr, // Campo extra limpio para el backend
          buyerInfo: {
            name: buyerName.trim(),
            phone: phoneClean,
            email: buyerEmail.trim()
          }
        })
      });
      const responseData = await res.json();
      if (responseData && responseData.init_point) {
        window.location.href = responseData.init_point;
      } else {
        alert('No se pudo iniciar el pago. Intenta de nuevo.');
        setIsProcessing(false);
      }
    } catch (e) {
      alert('Error al procesar el pago. Intenta de nuevo.');
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 999999
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0, right: 0, bottom: 0,
              width: '100%',
              maxWidth: '400px',
              background: '#fff',
              zIndex: 1000000,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
              boxSizing: 'border-box' as const,
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={20} color="#0f172a" />
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0 }}>Tu Carrito</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={24} color="#64748b" />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {showCheckoutForm ? (
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#0f172a' }}>Tus datos para la orden</h3>
                  
                  {formError && (
                    <div style={{ padding: '10px', background: '#fef2f2', color: '#ef4444', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>
                      {formError}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Nombre completo</label>
                    <input 
                      type="text" 
                      value={buyerName} 
                      onChange={e => setBuyerName(e.target.value)} 
                      placeholder="Ej. Juan Pérez"
                      style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Teléfono / WhatsApp</label>
                    <input 
                      type="tel" 
                      value={buyerPhone} 
                      onChange={e => setBuyerPhone(e.target.value)} 
                      placeholder="10 dígitos"
                      maxLength={10}
                      style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Correo electrónico</label>
                    <input 
                      type="email" 
                      value={buyerEmail} 
                      onChange={e => setBuyerEmail(e.target.value)} 
                      placeholder="ejemplo@correo.com"
                      style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                    />
                  </div>
                  
                  <button 
                    onClick={() => setShowCheckoutForm(false)} 
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', marginTop: '8px', textDecoration: 'underline' }}
                  >
                    Volver al carrito
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: '12px' }}>
                  <ShoppingBag size={48} opacity={0.3} />
                  <p>Tu carrito está vacío</p>
                  <button onClick={() => setIsCartOpen(false)} style={{ padding: '10px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', marginTop: '12px' }}>
                    Explorar productos
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                      {item.image && (
                        <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#f8fafc', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={resolveImageUrl(item.image, '')} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      )}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.3 }}>{item.title}</h4>
                        {item.lensConfig && item.lensConfig.etiqueta && (
                          <div style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px 0', lineHeight: 1.4, background: '#f8fafc', padding: '6px 8px', borderRadius: '6px' }}>
                            <div style={{color: '#0f172a', fontWeight: 500}}>Micas {item.lensConfig.etiqueta}</div>
                            <div style={{ fontSize: '11px', marginTop: '2px' }}>
                              Índice {item.lensConfig.indice} · {item.lensConfig.tipoFab}
                              {(item.lensConfig.esfera || item.lensConfig.cilindro) ? ' · Rx incl.' : ''}
                            </div>
                          </div>
                        )}
                        {item.estimatedDeliveryStr && (
                          <div style={{ fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            <Clock size={12} />
                            <span>Entrega: {item.estimatedDeliveryStr}</span>
                          </div>
                        )}
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a' }}>-</button>
                            <span style={{ fontSize: '13px', fontWeight: 500, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '4px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a' }}>+</button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: 600, fontSize: '15px' }}>${Math.round(item.unit_price * item.quantity).toLocaleString('es-MX')}</span>
                            <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div style={{ padding: '20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', boxSizing: 'border-box' as const, flexShrink: 0, paddingBottom: 'calc(20px + env(safe-area-inset-bottom))' }}>
                <div style={{ display: 'flex', gap: '10px', background: '#dbeafe', color: '#1e40af', padding: '12px', borderRadius: '8px', marginBottom: '16px', alignItems: 'flex-start' }}>
                  <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                    Todas las compras se recogen en tienda (Zapopan).<br/>
                    <strong>Entrega estimada del pedido: {maxDelStr}</strong>
                  </p>
                </div>

                {showCheckoutForm && items.some(i => i.lensConfig || String(i.product?.category || '').toLowerCase().includes('contacto')) && (
                  <div style={{ display: 'flex', gap: '10px', background: '#fef3c7', color: '#92400e', padding: '12px', borderRadius: '8px', marginBottom: '16px', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                      🔍 Tu pedido será validado por nuestro optometrista antes de elaborarse. Si por alguna razón no podemos procesarlo, te contactamos y te reembolsamos el 100%.
                    </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  <span>Subtotal</span>
                  <span>${Math.round(total).toLocaleString('es-MX')}</span>
                </div>
                
                <button 
                  onClick={showCheckoutForm ? payOnline : () => setShowCheckoutForm(true)}
                  disabled={isProcessing}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    background: isProcessing ? '#94a3b8' : '#16a34a', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '50px', 
                    fontWeight: 600, 
                    fontSize: '16px', 
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                >
                  <CreditCard size={20} />
                  {isProcessing ? 'Procesando...' : (showCheckoutForm ? 'Pagar con Mercado Pago' : 'Proceder al pago')}
                </button>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  style={{ width: '100%', padding: '12px', background: 'transparent', color: '#64748b', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginTop: '8px', textDecoration: 'underline' }}
                >
                  Seguir comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
