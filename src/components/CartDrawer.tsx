import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CreditCard, ShoppingBag, MapPin, Clock, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../App';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, total, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'STORE_PICKUP' | 'HOME_DELIVERY'>('STORE_PICKUP');
  const [addressDetails, setAddressDetails] = useState({
    street: '',
    exterior: '',
    interior: '',
    colony: '',
    zip: '',
    city: '',
    state: ''
  });
  const [formError, setFormError] = useState('');
  const [zipError, setZipError] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const handleInputFocus = (e: React.FocusEvent<HTMLElement>) => {
    setTimeout(() => {
      try {
        e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      } catch(err) {}
    }, 300);
  };
  
  const [shippingQuote, setShippingQuote] = useState<{ cost: number, zone: string, transitDays: number } | null>(null);
  const [shippingQuoteLoading, setShippingQuoteLoading] = useState(false);
  const [shippingQuoteError, setShippingQuoteError] = useState('');
  
  const shippingCost = deliveryMethod === 'HOME_DELIVERY' ? (shippingQuote?.cost ?? 150) : 0;
  const finalTotal = total + shippingCost;

  useEffect(() => {
    const fetchShippingQuote = async () => {
      if (deliveryMethod !== 'HOME_DELIVERY') {
        setShippingQuote(null);
        setShippingQuoteError('');
        return;
      }
      
      const zipClean = addressDetails.zip.replace(/\D/g, '');
      if (zipClean.length !== 5) {
        setShippingQuote(null);
        setShippingQuoteError('Ingresa un CP válido para cotizar');
        return;
      }
      
      setShippingQuoteLoading(true);
      setShippingQuoteError('');
      try {
        const res = await fetch('https://lensique-pos.onrender.com/api/checkout/shipping-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zip: zipClean, subtotal: total })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error cotizando envío');
        setShippingQuote({ cost: data.cost, zone: data.zone, transitDays: data.transitDays });
      } catch (err: any) {
        setShippingQuote(null);
        setShippingQuoteError(err.message);
      } finally {
        setShippingQuoteLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchShippingQuote, 500);
    return () => clearTimeout(timeout);
  }, [deliveryMethod, addressDetails.zip, total]);
  
  // FEATURE FLAG: Mantener oculto del público por solicitud del usuario
  const ENABLE_SHIPPING_FEATURE = true;

  let finalMaxDeliveryDays = items.length > 0 ? Math.max(...items.map(i => i.maxDeliveryDays || 0)) : 0;
  if (deliveryMethod === 'HOME_DELIVERY' && shippingQuote?.transitDays) {
    finalMaxDeliveryDays += shippingQuote.transitDays;
  }
  
  let maxDelStr = '';
  if (finalMaxDeliveryDays <= 5) maxDelStr = '3 a 5 días hábiles';
  else if (finalMaxDeliveryDays <= 12) maxDelStr = '1 a 2 semanas';
  else if (finalMaxDeliveryDays <= 21) maxDelStr = '2 a 3 semanas';
  else maxDelStr = '3 a 4 semanas';

  const payOnline = async () => {
    setPaymentError('');
    setZipError('');
    if (items.length === 0) return;
    
    if (!showCheckoutForm) {
      if (deliveryMethod === 'HOME_DELIVERY') {
        const zipClean = addressDetails.zip.replace(/\D/g, '');
        if (zipClean.length !== 5) {
          setZipError('Ingresa un código postal válido de 5 dígitos.');
          return;
        }
        if (shippingQuoteError || shippingQuote === null) {
          setZipError('No se ha podido calcular el envío para ese CP. Por favor verifica e intenta de nuevo.');
          return;
        }
      }
      import('../lib/analytics').then(({ trackBeginCheckout }) => trackBeginCheckout(total + shippingCost, items));
      setShowCheckoutForm(true);
      return;
    }
    
    // Validate form
    if (!buyerName.trim() || !buyerPhone.trim()) {
      setFormError('Nombre y teléfono son obligatorios.');
      return;
    }
    const phoneClean = buyerPhone.replace(/\D/g, '');
    if (phoneClean.length !== 10) {
      setFormError('El teléfono debe tener 10 dígitos.');
      return;
    }
    if (buyerEmail.trim() && !/^\S+@\S+\.\S+$/.test(buyerEmail)) {
      setFormError('Ingresa un correo electrónico válido.');
      return;
    }
    
    if (deliveryMethod === 'HOME_DELIVERY' && (!addressDetails.street || !addressDetails.exterior || !addressDetails.colony || !addressDetails.zip || !addressDetails.city || !addressDetails.state)) {
      setFormError('Por favor completa todos los campos requeridos de la dirección de envío.');
      return;
    }
    
    setFormError('');
    try {
      setIsProcessing(true);
      // Guardar en localstorage para la página de exito
      localStorage.setItem('lensique_last_order_delivery', maxDelStr);
      localStorage.setItem('lensique_last_order_delivery_method', deliveryMethod);
      if (deliveryMethod === 'HOME_DELIVERY') {
        const fullAddress = `${addressDetails.street} ${addressDetails.exterior} ${addressDetails.interior ? `Int. ${addressDetails.interior}` : ''}, ${addressDetails.colony}, C.P. ${addressDetails.zip}, ${addressDetails.city}, ${addressDetails.state}`.trim();
        localStorage.setItem('lensique_last_order_shipping_address', fullAddress);
      }
      localStorage.setItem('lensique_last_order_items', JSON.stringify(items));
      localStorage.setItem('lensique_last_order_total', (total + shippingCost).toString());

      const res = await fetch('https://lensique-pos.onrender.com/api/checkout/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: finalTotal, 
          // Enviar el carrito enriquecido para que el backend recalcule los precios
          cart: items,
          estimatedDelivery: maxDelStr, // Campo extra limpio para el backend
          buyerInfo: {
            name: buyerName.trim(),
            phone: phoneClean,
            email: buyerEmail.trim(),
            deliveryMethod,
            shippingAddress: deliveryMethod === 'HOME_DELIVERY' ? addressDetails : null
          }
        })
      });
      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (err) {
        console.error("Non-JSON response from server:", responseText);
        setPaymentError('El servidor está iniciando o hubo un error (502). Por favor, espera un momento e intenta de nuevo.');
        setIsProcessing(false);
        return;
      }
      
      if (responseData && responseData.init_point) {
        window.location.href = responseData.init_point;
      } else {
        setPaymentError(responseData.error || 'No se pudo iniciar el pago. Intenta de nuevo.');
        setIsProcessing(false);
      }
    } catch (e: any) {
      setPaymentError('Error de conexión. Si el servidor estaba inactivo, intenta de nuevo. (' + (e.message || 'Error desconocido') + ')');
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
              overflow: 'hidden',
              fontFamily: 'var(--font-body, system-ui, sans-serif)'
            }}
          >
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShoppingBag size={20} color="#0f172a" />
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Tu Carrito</div>
                </div>
                {items.length > 0 && (
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                    {!showCheckoutForm ? 'Paso 1 de 2 · Entrega' : 'Paso 2 de 2 · Datos y pago'}
                  </div>
                )}
              </div>
              <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={24} color="#64748b" />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: showCheckoutForm ? '35vh' : '20px' }}>
              {showCheckoutForm ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {formError && (
                    <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '13px', fontWeight: 500, border: '1px solid #fecaca' }}>
                      {formError}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ fontSize: '18px', color: '#0f172a', fontWeight: 700 }}>Tus datos</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Nombre completo *</label>
                      <input 
                        type="text" 
                        value={buyerName} 
                        onChange={e => setBuyerName(e.target.value)} 
                        onFocus={handleInputFocus}
                        placeholder="Ej. Juan Pérez"
                        style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Teléfono / WhatsApp *</label>
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
                      <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Correo electrónico (Opcional)</label>
                      <input 
                        type="email" 
                        value={buyerEmail} 
                        onChange={e => setBuyerEmail(e.target.value)} 
                        onFocus={handleInputFocus}
                        placeholder="ejemplo@correo.com"
                        style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {ENABLE_SHIPPING_FEATURE && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                      {deliveryMethod === 'HOME_DELIVERY' ? (
                        <>
                          <div style={{ fontSize: '16px', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={18} className="text-indigo-600" /> Dirección de envío
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Calle *</label>
                                <input type="text" value={addressDetails.street} onChange={e => setAddressDetails({...addressDetails, street: e.target.value})} onFocus={handleInputFocus} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>No. Ext *</label>
                                <input type="text" value={addressDetails.exterior} onChange={e => setAddressDetails({...addressDetails, exterior: e.target.value})} onFocus={handleInputFocus} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>No. Int</label>
                                <input type="text" value={addressDetails.interior} onChange={e => setAddressDetails({...addressDetails, interior: e.target.value})} onFocus={handleInputFocus} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Colonia *</label>
                                <input type="text" value={addressDetails.colony} onChange={e => setAddressDetails({...addressDetails, colony: e.target.value})} onFocus={handleInputFocus} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>C.P. *</label>
                                <input type="text" value={addressDetails.zip} onChange={e => setAddressDetails({...addressDetails, zip: e.target.value})} onFocus={handleInputFocus} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Ciudad *</label>
                                <input type="text" value={addressDetails.city} onChange={e => setAddressDetails({...addressDetails, city: e.target.value})} onFocus={handleInputFocus} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                              </div>
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Estado *</label>
                                <input type="text" value={addressDetails.state} onChange={e => setAddressDetails({...addressDetails, state: e.target.value})} onFocus={handleInputFocus} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e3a8a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={16} /> Recoger en tienda
                          </div>
                          <p style={{ fontSize: '13px', color: '#1e40af', margin: 0, lineHeight: 1.5 }}>
                            <strong>Recoges en:</strong> Av. Guadalupe 1296, Jardines de San Ignacio, Zapopan, Jal. 45040.<br/>
                            <strong>Horario:</strong> Lun-Vie 10:00-20:00, Sáb 10:00-17:00.<br/><br/>
                            Te avisaremos por WhatsApp o correo cuando tu pedido esté listo.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '10px', background: '#dbeafe', color: '#1e40af', padding: '12px', borderRadius: '8px', alignItems: 'center' }}>
                    <Clock size={18} style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', margin: 0, fontWeight: 500 }}>
                      Entrega estimada del pedido: {maxDelStr}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setShowCheckoutForm(false)} 
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '14px', cursor: 'pointer', marginTop: '8px', textDecoration: 'underline' }}
                  >
                    Volver al carrito
                  </button>
                  <div style={{ height: '35vh', width: '100%', flexShrink: 0 }} />
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
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.3 }}>{item.title}</div>
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
                {!showCheckoutForm && (
                  <div style={{ background: '#f8fafc', borderRadius: '12px', fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {ENABLE_SHIPPING_FEATURE ? (
                      <div className="checkout-section" style={{ margin: 0, padding: 0, background: 'transparent', border: 'none' }}>
                        <h3 className="checkout-section-title" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={16} /> ¿Cómo quieres recibir tu pedido?
                        </h3>
                        <div className="delivery-options-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: deliveryMethod === 'STORE_PICKUP' ? '2px solid #3b82f6' : '1px solid #cbd5e1', borderRadius: '12px', background: deliveryMethod === 'STORE_PICKUP' ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <input type="radio" name="deliveryMethodStep1" value="STORE_PICKUP" checked={deliveryMethod === 'STORE_PICKUP'} onChange={() => setDeliveryMethod('STORE_PICKUP')} style={{ display: 'none' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '15px', fontWeight: deliveryMethod === 'STORE_PICKUP' ? 700 : 500, color: deliveryMethod === 'STORE_PICKUP' ? '#1e3a8a' : '#0f172a' }}>Recoger en tienda</div>
                              <div style={{ fontSize: '13px', color: deliveryMethod === 'STORE_PICKUP' ? '#2563eb' : '#64748b', marginTop: '2px' }}>Gratis</div>
                            </div>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: deliveryMethod === 'STORE_PICKUP' ? 'none' : '2px solid #cbd5e1', background: deliveryMethod === 'STORE_PICKUP' ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {deliveryMethod === 'STORE_PICKUP' && <Check size={14} color="#fff" />}
                            </div>
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: deliveryMethod === 'HOME_DELIVERY' ? '2px solid #3b82f6' : '1px solid #cbd5e1', borderRadius: '12px', background: deliveryMethod === 'HOME_DELIVERY' ? '#eff6ff' : '#fff', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <input type="radio" name="deliveryMethodStep1" value="HOME_DELIVERY" checked={deliveryMethod === 'HOME_DELIVERY'} onChange={() => setDeliveryMethod('HOME_DELIVERY')} style={{ display: 'none' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '15px', fontWeight: deliveryMethod === 'HOME_DELIVERY' ? 700 : 500, color: deliveryMethod === 'HOME_DELIVERY' ? '#1e3a8a' : '#0f172a' }}>Envío a domicilio</div>
                              <div style={{ fontSize: '13px', color: deliveryMethod === 'HOME_DELIVERY' ? '#2563eb' : '#64748b', marginTop: '2px' }}>desde $150</div>
                            </div>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: deliveryMethod === 'HOME_DELIVERY' ? 'none' : '2px solid #cbd5e1', background: deliveryMethod === 'HOME_DELIVERY' ? '#3b82f6' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {deliveryMethod === 'HOME_DELIVERY' && <Check size={14} color="#fff" />}
                            </div>
                          </label>
                        </div>
                        
                        {deliveryMethod === 'HOME_DELIVERY' && (
                          <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Código Postal *</label>
                            <input 
                              type="text" 
                              value={addressDetails.zip} 
                              onChange={e => {
                                setAddressDetails({...addressDetails, zip: e.target.value});
                                setZipError('');
                              }} 
                              onFocus={handleInputFocus} 
                              placeholder="Ej. 45040"
                              maxLength={5}
                              style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box' }} 
                            />
                            {zipError && (
                              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                                {zipError}
                              </div>
                            )}
                            {shippingQuoteError && !zipError && (
                              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                                {shippingQuoteError}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        Todas las compras se recogen en tienda (Zapopan).
                      </div>
                    )}
                  </div>
                )}

                {showCheckoutForm && items.some(i => i.lensConfig || String(i.product?.category || '').toLowerCase().includes('contacto')) && (
                  <div style={{ display: 'flex', gap: '10px', background: '#fef3c7', color: '#92400e', padding: '12px', borderRadius: '8px', marginBottom: '16px', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                      🔍 Tu pedido será validado por nuestro optometrista antes de elaborarse. Si por alguna razón no podemos procesarlo, te contactamos y te reembolsamos el 100%.
                    </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px', color: '#475569' }}>
                  <span>Subtotal</span>
                  <span>${Math.round(total).toLocaleString('es-MX')}</span>
                </div>
                {deliveryMethod === 'HOME_DELIVERY' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '15px', color: '#475569' }}>
                    <span>Envío a domicilio {shippingQuote?.zone && `(${shippingQuote.zone})`}</span>
                    {shippingQuoteLoading ? (
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>Calculando...</span>
                    ) : shippingQuote?.cost === 0 ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>Gratis</span>
                    ) : (
                      <span>${Math.round(shippingQuote?.cost ?? 150).toLocaleString('es-MX')}</span>
                    )}
                  </div>
                )}
                <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  <span>Total</span>
                  <span>${Math.round(finalTotal).toLocaleString('es-MX')}</span>
                </div>
                
                {showCheckoutForm && (
                  <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginBottom: '12px', lineHeight: '1.4' }}>
                    Tus datos personales y de salud (receta) están protegidos. Al continuar, aceptas nuestro{' '}
                    <a href="#privacidad" onClick={(e) => { e.preventDefault(); setIsCartOpen(false); document.getElementById('footer-privacy-link')?.click(); }} style={{ color: '#16a34a', textDecoration: 'underline' }}>
                      Aviso de Privacidad
                    </a>.
                  </p>
                )}
                
                {paymentError && (
                  <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '13px', fontWeight: 500, border: '1px solid #fecaca', marginBottom: '12px' }}>
                    {paymentError}
                  </div>
                )}
                
                <button 
                  onClick={payOnline}
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
                  {isProcessing ? 'Procesando...' : (showCheckoutForm ? 'Pagar con Mercado Pago' : 'Continuar')}
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
