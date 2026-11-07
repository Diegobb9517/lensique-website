import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CreditCard, ShoppingBag, MapPin, Clock, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../App';

interface CartDrawerProps {
  onOpenConfigurator?: (product: any, section?: string) => void;
}

export function CartDrawer({ onOpenConfigurator }: CartDrawerProps = {}) {
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
    state: '',
    references: ''
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
  
  const isFreeShipping = total > 2500;
  const shippingCost = deliveryMethod === 'HOME_DELIVERY' ? (isFreeShipping ? 0 : (shippingQuote?.cost ?? 150)) : 0;
  const finalTotal = total + shippingCost;

  const msiMonths = finalTotal >= 4000 ? 6 : (finalTotal >= 2500 ? 3 : 0);
  const msiMonthly = msiMonths > 0 ? Math.round(finalTotal / msiMonths) : 0;

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

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
        setShippingQuote({ cost: isFreeShipping ? 0 : data.cost, zone: data.zone, transitDays: data.transitDays });
      } catch (err: any) {
        setShippingQuote(null);
        setShippingQuoteError(err.message);
      } finally {
        setShippingQuoteLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchShippingQuote, 500);
    return () => clearTimeout(timeout);
  }, [deliveryMethod, addressDetails.zip, total, isFreeShipping]);

  let finalMaxDeliveryDays = items.length > 0 ? Math.max(...items.map(i => i.maxDeliveryDays || 0)) : 0;
  let minDelDays = items.length > 0 ? Math.max(...items.map(i => (i as any).minDeliveryDays || Math.max(0, (i.maxDeliveryDays||3)-3))) : 0;
  if (deliveryMethod === 'HOME_DELIVERY' && shippingQuote?.transitDays) {
    finalMaxDeliveryDays += shippingQuote.transitDays;
    minDelDays += Math.max(1, shippingQuote.transitDays - 2);
  } else if (deliveryMethod === 'HOME_DELIVERY') {
    finalMaxDeliveryDays += 5;
    minDelDays += 3;
  }
  
  function addBizDays(start: Date, days: number): Date {
    const d = new Date(start.getTime());
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d;
  }
  const today = new Date();
  const dMin = addBizDays(today, minDelDays);
  const dMax = addBizDays(today, finalMaxDeliveryDays);
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  
  let deliveryDaysRange = '';
  if (dMin.getMonth() === dMax.getMonth()) {
    deliveryDaysRange = `${dMin.getDate()} – ${dMax.getDate()} ${months[dMax.getMonth()]}`;
  } else {
    deliveryDaysRange = `${dMin.getDate()} ${months[dMin.getMonth()]} – ${dMax.getDate()} ${months[dMax.getMonth()]}`;
  }
  const maxDelStr = `Llega ${deliveryDaysRange}`;

  const payOnline = async () => {
    setPaymentError('');
    setZipError('');
    if (items.length === 0) return;

    const missingRxItem = items.find(i => i.type === 'frame_with_lenses' && (!i.lensConfig || !i.lensConfig.rxMethod));
    if (missingRxItem) {
      setPaymentError(`El producto "${missingRxItem.title}" requiere que selecciones un método de graduación.`);
      return;
    }
    
    if (!showCheckoutForm) {
      if (deliveryMethod === 'HOME_DELIVERY') {
        const zipClean = addressDetails.zip.replace(/\D/g, '');
        if (zipClean.length !== 5) {
          setZipError('Ingresa un código postal válido de 5 dígitos.');
          return;
        }
        if (!isFreeShipping && (shippingQuoteError || shippingQuote === null)) {
          setZipError('No se ha podido calcular el envío para ese CP. Por favor verifica e intenta de nuevo.');
          return;
        }
      }
      import('../lib/analytics').then(({ trackBeginCheckout }) => trackBeginCheckout(finalTotal, items));
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
      localStorage.setItem('lensique_last_order_delivery', maxDelStr);
      localStorage.setItem('lensique_last_order_delivery_method', deliveryMethod);
      if (deliveryMethod === 'HOME_DELIVERY') {
        const fullAddress = `${addressDetails.street} ${addressDetails.exterior} ${addressDetails.interior ? `Int. ${addressDetails.interior}` : ''}, ${addressDetails.colony}, C.P. ${addressDetails.zip}, ${addressDetails.city}, ${addressDetails.state}${addressDetails.references ? ` (Ref: ${addressDetails.references})` : ''}`.trim();
        localStorage.setItem('lensique_last_order_shipping_address', fullAddress);
      }
      localStorage.setItem('lensique_last_order_items', JSON.stringify(items));
      localStorage.setItem('lensique_last_order_total', finalTotal.toString());

      const res = await fetch('https://lensique-pos.onrender.com/api/checkout/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: finalTotal, 
          cart: items,
          estimatedDelivery: maxDelStr,
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
            className="cart-overlay"
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
            {/* Header del carrito con barra de progreso de 2 segmentos */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={20} color="#0f172a" />
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Tu Carrito</div>
                  {items.length > 0 && (
                    <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                      {items.reduce((acc, i) => acc + i.quantity, 0)}
                    </span>
                  )}
                </div>
                <button 
                  className="cart-close-btn"
                  aria-label="Cerrar carrito"
                  onClick={() => setIsCartOpen(false)} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={22} color="#64748b" />
                </button>
              </div>

              {/* Barra de progreso de 2 segmentos */}
              {items.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', height: '4px', marginBottom: '8px' }}>
                    <div style={{ flex: 1, height: '100%', borderRadius: '2px', background: '#16223f' }} />
                    <div style={{ flex: 1, height: '100%', borderRadius: '2px', background: showCheckoutForm ? '#16223f' : '#e2e8f0', transition: 'background 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                    <span style={{ fontWeight: !showCheckoutForm ? 700 : 500, color: !showCheckoutForm ? '#0f172a' : '#64748b' }}>
                      1. Entrega
                    </span>
                    <span style={{ fontWeight: showCheckoutForm ? 700 : 500, color: showCheckoutForm ? '#0f172a' : '#94a3b8' }}>
                      2. Datos y pago
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Cuerpo del carrito (scroll vertical, sin scroll horizontal) */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px' }}>
              {showCheckoutForm ? (
                /* ============================================================ */
                /* PASO 2 — DATOS Y PAGO                                       */
                /* ============================================================ */
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Botón Volver a entrega */}
                  <button 
                    onClick={() => setShowCheckoutForm(false)} 
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12.5px', cursor: 'pointer', padding: 0, marginBottom: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start', fontWeight: 500 }}
                  >
                    <span>&larr;</span> <span>Volver a entrega</span>
                  </button>

                  {/* Resumen compacto del pedido */}
                  <div style={{ paddingBottom: '14px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>
                        Resumen del pedido
                      </span>
                      <button 
                        onClick={() => setShowCheckoutForm(false)} 
                        style={{ background: 'none', border: 'none', fontSize: '11.5px', color: '#2563eb', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                      >
                        Modificar
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {items.map(it => (
                        <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {it.image && (
                            <img src={resolveImageUrl(it.image, '')} alt={it.title} style={{ width: '42px', height: '42px', objectFit: 'contain', background: '#f8fafc', borderRadius: '6px', flexShrink: 0, border: '1px solid #e2e8f0' }} />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {it.quantity > 1 ? `${it.quantity}x ` : ''}{it.title}
                            </div>
                            {it.lensConfig?.etiqueta && (
                              <div style={{ fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Micas {it.lensConfig.etiqueta} · {it.lensConfig.indice} · {it.lensConfig.tipoFab || 'estándar'}
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', flexShrink: 0 }}>
                            ${Math.round(it.unit_price * it.quantity).toLocaleString('es-MX')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formError && (
                    <div style={{ padding: '10px 12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '12.5px', fontWeight: 500, border: '1px solid #fecaca', marginBottom: '16px' }}>
                      {formError}
                    </div>
                  )}

                  {/* SECCIÓN: TUS DATOS */}
                  <div style={{ marginBottom: '22px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Tus datos
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Nombre completo *
                        </label>
                        <input 
                          type="text" 
                          value={buyerName} 
                          onChange={e => setBuyerName(e.target.value)} 
                          onFocus={handleInputFocus}
                          placeholder="Ej. Juan Pérez"
                          style={{ width: '100%', boxSizing: 'border-box', minWidth: 0, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Teléfono / WhatsApp *
                        </label>
                        <input 
                          type="tel" 
                          value={buyerPhone} 
                          onChange={e => setBuyerPhone(e.target.value)} 
                          placeholder="10 dígitos"
                          maxLength={10}
                          style={{ width: '100%', boxSizing: 'border-box', minWidth: 0, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                          Correo electrónico (opcional)
                        </label>
                        <input 
                          type="email" 
                          value={buyerEmail} 
                          onChange={e => setBuyerEmail(e.target.value)} 
                          onFocus={handleInputFocus}
                          placeholder="ejemplo@correo.com"
                          style={{ width: '100%', boxSizing: 'border-box', minWidth: 0, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN: DIRECCIÓN DE ENVÍO */}
                  {deliveryMethod === 'HOME_DELIVERY' ? (
                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>
                        Dirección de envío
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            Calle y número *
                          </label>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text" 
                              value={addressDetails.street} 
                              onChange={e => setAddressDetails({...addressDetails, street: e.target.value})} 
                              onFocus={handleInputFocus} 
                              placeholder="Calle" 
                              style={{ flex: 2, minWidth: 0, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} 
                            />
                            <input 
                              type="text" 
                              value={addressDetails.exterior} 
                              onChange={e => setAddressDetails({...addressDetails, exterior: e.target.value})} 
                              onFocus={handleInputFocus} 
                              placeholder="Ext *" 
                              style={{ flex: 1, minWidth: 0, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} 
                            />
                            <input 
                              type="text" 
                              value={addressDetails.interior} 
                              onChange={e => setAddressDetails({...addressDetails, interior: e.target.value})} 
                              onFocus={handleInputFocus} 
                              placeholder="Int" 
                              style={{ flex: 1, minWidth: 0, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} 
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1.3, minWidth: 0 }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Colonia *</label>
                            <input 
                              type="text" 
                              value={addressDetails.colony} 
                              onChange={e => setAddressDetails({...addressDetails, colony: e.target.value})} 
                              onFocus={handleInputFocus} 
                              style={{ width: '100%', minWidth: 0, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} 
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>C.P. *</label>
                            <input 
                              type="text" 
                              value={addressDetails.zip} 
                              onChange={e => setAddressDetails({...addressDetails, zip: e.target.value})} 
                              onFocus={handleInputFocus} 
                              maxLength={5}
                              style={{ width: '100%', minWidth: 0, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} 
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Ciudad *</label>
                            <input 
                              type="text" 
                              value={addressDetails.city} 
                              onChange={e => setAddressDetails({...addressDetails, city: e.target.value})} 
                              onFocus={handleInputFocus} 
                              style={{ width: '100%', minWidth: 0, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} 
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Estado *</label>
                            <input 
                              type="text" 
                              value={addressDetails.state} 
                              onChange={e => setAddressDetails({...addressDetails, state: e.target.value})} 
                              onFocus={handleInputFocus} 
                              style={{ width: '100%', minWidth: 0, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }} 
                            />
                          </div>
                        </div>

                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                            Referencias (opcional)
                          </label>
                          <input 
                            type="text" 
                            value={addressDetails.references || ''} 
                            onChange={e => setAddressDetails({...addressDetails, references: e.target.value})} 
                            onFocus={handleInputFocus} 
                            placeholder="Ej. Entre calles o color del portón"
                            style={{ width: '100%', boxSizing: 'border-box', minWidth: 0, padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13.5px', outline: 'none' }} 
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: '18px', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={15} color="#16223f" /> Recoger en tienda (sin costo)
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                        Av. Guadalupe 1296, Zapopan, Jal. Te notificaremos por WhatsApp o correo en cuanto tu pedido esté listo para entrega.
                      </p>
                    </div>
                  )}

                  {/* Aviso de privacidad en una línea chica */}
                  <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.4, marginTop: '2px', marginBottom: '8px' }}>
                    🔒 Tus datos personales y de salud (receta) están protegidos. Al pagar aceptas el{' '}
                    <a href="#privacidad" onClick={(e) => { e.preventDefault(); setIsCartOpen(false); document.getElementById('footer-privacy-link')?.click(); }} style={{ color: '#0f172a', textDecoration: 'underline' }}>
                      Aviso de Privacidad
                    </a>.
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: '12px', padding: '40px 0' }}>
                  <ShoppingBag size={48} opacity={0.3} />
                  <p style={{ margin: 0, fontSize: '15px' }}>Tu carrito está vacío</p>
                  <button onClick={() => setIsCartOpen(false)} style={{ padding: '10px 20px', background: '#16223f', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', marginTop: '8px', fontSize: '13.5px' }}>
                    Explorar productos
                  </button>
                </div>
              ) : (
                /* ============================================================ */
                /* PASO 1 — ENTREGA                                            */
                /* ============================================================ */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Lista de artículos: UNA sola tarjeta por artículo */}
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px', 
                        padding: '14px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                      }}
                    >
                      {item.image && (
                        <div style={{ width: '68px', height: '68px', borderRadius: '8px', background: '#f8fafc', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                          <img src={resolveImageUrl(item.image, '')} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      )}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0f172a', margin: '0 0 2px 0', lineHeight: 1.3 }}>
                          {item.title}
                        </div>
                        
                        {/* Línea puntual de mica en gris */}
                        {item.lensConfig && item.lensConfig.etiqueta && (
                          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.35, margin: '1px 0' }}>
                            Micas {item.lensConfig.etiqueta} · índice {item.lensConfig.indice} · {item.lensConfig.tipoFab || 'estándar'}
                            {(item.lensConfig.esfera || item.lensConfig.cilindro) ? ' · Rx incl.' : ''}
                            {(item.lensConfig.montaje && item.lensConfig.montaje !== 'completo') ? ` · Montaje: ${item.lensConfig.montaje === 'al_aire' ? 'Al aire' : 'Semi al aire'}` : (item.product?.montaje && item.product.montaje !== 'completo' ? ` · Montaje: ${item.product.montaje === 'al_aire' ? 'Al aire' : 'Semi al aire'}` : '')}
                          </div>
                        )}

                        {/* Aviso sutil de falta de graduación */}
                        {item.type === 'frame_with_lenses' && (!item.lensConfig || !item.lensConfig.rxMethod) && (
                          <div 
                            onClick={() => {
                              if (onOpenConfigurator && item.product) {
                                setIsCartOpen(false);
                                onOpenConfigurator(item.product, '3');
                              }
                            }}
                            style={{ fontSize: '11.5px', color: '#b91c1c', marginTop: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>⚠️ Falta elegir graduación ·</span>
                            <span style={{ textDecoration: 'underline', fontWeight: 600 }}>Elegir ahora &rarr;</span>
                          </div>
                        )}

                        {/* Nota de receta como texto chico */}
                        {item.lensConfig && item.lensConfig.prescriptionPending && (
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>📋</span>
                            <span>Receta pendiente — la envías por WhatsApp</span>
                          </div>
                        )}

                        {/* Entrega como línea chica verde */}
                        <div style={{ fontSize: '11.5px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                          <Clock size={12} />
                          <span>Llega {deliveryDaysRange}</span>
                        </div>

                        {/* Fila inferior: stepper · precio · eliminar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #f8fafc' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc' }}>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                              style={{ width: '26px', height: '26px', background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}
                              aria-label="Disminuir cantidad"
                            >
                              -
                            </button>
                            <span style={{ fontSize: '12.5px', fontWeight: 600, width: '22px', textAlign: 'center', color: '#0f172a' }}>
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                              style={{ width: '26px', height: '26px', background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}
                              aria-label="Aumentar cantidad"
                            >
                              +
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
                              ${Math.round(item.unit_price * item.quantity).toLocaleString('es-MX')}
                            </span>
                            <button 
                              onClick={() => removeItem(item.id)} 
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              title="Eliminar producto"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Sección: ¿Cómo quieres recibir tu pedido? */}
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                      ¿Cómo lo recibes?
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label 
                        onClick={() => setDeliveryMethod('STORE_PICKUP')}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          padding: '12px 14px', 
                          border: deliveryMethod === 'STORE_PICKUP' ? '2px solid #16223f' : '1px solid #e2e8f0', 
                          borderRadius: '10px', 
                          background: deliveryMethod === 'STORE_PICKUP' ? '#f8fafc' : '#fff', 
                          cursor: 'pointer', 
                          transition: 'all 0.15s' 
                        }}
                      >
                        <input type="radio" name="deliveryMethodStep1" value="STORE_PICKUP" checked={deliveryMethod === 'STORE_PICKUP'} onChange={() => setDeliveryMethod('STORE_PICKUP')} style={{ display: 'none' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: deliveryMethod === 'STORE_PICKUP' ? 700 : 500, color: '#0f172a' }}>Recoger en tienda</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Sin costo · Zapopan</div>
                        </div>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: deliveryMethod === 'STORE_PICKUP' ? 'none' : '2px solid #cbd5e1', background: deliveryMethod === 'STORE_PICKUP' ? '#16223f' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {deliveryMethod === 'STORE_PICKUP' && <Check size={12} color="#fff" />}
                        </div>
                      </label>

                      <label 
                        onClick={() => setDeliveryMethod('HOME_DELIVERY')}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          padding: '12px 14px', 
                          border: deliveryMethod === 'HOME_DELIVERY' ? '2px solid #16223f' : '1px solid #e2e8f0', 
                          borderRadius: '10px', 
                          background: deliveryMethod === 'HOME_DELIVERY' ? '#f8fafc' : '#fff', 
                          cursor: 'pointer', 
                          transition: 'all 0.15s' 
                        }}
                      >
                        <input type="radio" name="deliveryMethodStep1" value="HOME_DELIVERY" checked={deliveryMethod === 'HOME_DELIVERY'} onChange={() => setDeliveryMethod('HOME_DELIVERY')} style={{ display: 'none' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: deliveryMethod === 'HOME_DELIVERY' ? 700 : 500, color: '#0f172a' }}>Envío a domicilio</div>
                          <div style={{ fontSize: '12px', color: isFreeShipping ? '#16a34a' : '#64748b', fontWeight: isFreeShipping ? 600 : 400, marginTop: '2px' }}>
                            {isFreeShipping ? 'Gratis' : 'desde $150'}
                          </div>
                        </div>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: deliveryMethod === 'HOME_DELIVERY' ? 'none' : '2px solid #cbd5e1', background: deliveryMethod === 'HOME_DELIVERY' ? '#16223f' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {deliveryMethod === 'HOME_DELIVERY' && <Check size={12} color="#fff" />}
                        </div>
                      </label>
                    </div>

                    {deliveryMethod === 'HOME_DELIVERY' && (
                      <div style={{ marginTop: '10px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                          Código Postal de entrega *
                        </label>
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
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }} 
                        />
                        {zipError && (
                          <div style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '6px', fontWeight: 500 }}>
                            {zipError}
                          </div>
                        )}
                        {shippingQuoteError && !zipError && !isFreeShipping && (
                          <div style={{ color: '#ef4444', fontSize: '11.5px', marginTop: '6px', fontWeight: 500 }}>
                            {shippingQuoteError}
                          </div>
                        )}
                        {isFreeShipping && addressDetails.zip.replace(/\D/g, '').length === 5 && (
                          <div style={{ color: '#16a34a', fontSize: '11.5px', marginTop: '6px', fontWeight: 600 }}>
                            ✓ Envío gratis aplicado (pedido mayor a $2,500)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer fijo (Totales + MSI destacado + Garantía + CTA) */}
            {items.length > 0 && (
              <div style={{ 
                padding: '16px 20px', 
                background: '#ffffff', 
                borderTop: '1px solid #e2e8f0', 
                boxSizing: 'border-box' as const, 
                flexShrink: 0, 
                paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' 
              }}>
                {/* Desglose puntual en Paso 2 o cuando hay costo de envío en Paso 1 */}
                {showCheckoutForm ? (
                  <div style={{ marginBottom: '10px', fontSize: '13px', color: '#475569' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Subtotal</span>
                      <span>${Math.round(total).toLocaleString('es-MX')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>
                        {deliveryMethod === 'HOME_DELIVERY' 
                          ? `Envío a domicilio · llega ${deliveryDaysRange}`
                          : 'Recoger en tienda · Zapopan'}
                      </span>
                      <span style={{ fontWeight: 600, color: (deliveryMethod === 'STORE_PICKUP' || isFreeShipping) ? '#16a34a' : '#0f172a' }}>
                        {deliveryMethod === 'STORE_PICKUP' ? 'Sin costo' : (isFreeShipping ? 'Gratis' : `$${shippingCost}`)}
                      </span>
                    </div>
                    <div style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0' }} />
                  </div>
                ) : (
                  (!isFreeShipping && deliveryMethod === 'HOME_DELIVERY' && shippingCost > 0) && (
                    <div style={{ marginBottom: '8px', fontSize: '13px', color: '#475569' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Subtotal</span>
                        <span>${Math.round(total).toLocaleString('es-MX')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Envío a domicilio</span>
                        <span>${shippingCost}</span>
                      </div>
                      <div style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0' }} />
                    </div>
                  )
                )}

                {/* Total grande (no repite Subtotal idéntico) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: msiMonths > 0 ? '10px' : '14px' }}>
                  <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>Total</span>
                  <span className="tabular-nums" style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>
                    ${Math.round(finalTotal).toLocaleString('es-MX')}
                  </span>
                </div>

                {/* Mensualidad destacada: bloque verde */}
                {msiMonths > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#047857', textTransform: 'uppercase' }}>
                        PÁGALO A MESES
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#065f46', marginTop: '1px' }}>
                        {msiMonths} meses sin intereses
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '17px', fontWeight: 800, color: '#047857', lineHeight: 1.1 }}>
                        ${msiMonthly.toLocaleString('es-MX')}
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#065f46', marginLeft: '2px' }}>/mes</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Garantía en una sola línea */}
                <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748b', marginBottom: '10px', lineHeight: 1.35 }}>
                  🔒 Garantía 30 días · validación por optometrista.{' '}
                  <a href="/devoluciones" target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', textDecoration: 'underline' }}>
                    Ver política
                  </a>
                </div>

                {/* En Paso 1: WhatsApp como link discreto */}
                {!showCheckoutForm && (
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <a 
                      href="https://wa.me/523316929111?text=Hola,%20tengo%20una%20duda%20con%20mi%20pedido%20de%20lentes." 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '12.5px', color: '#047857', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}
                    >
                      <span style={{ color: '#25d366', fontSize: '14px' }}>💬</span>
                      <span>¿Dudas con tu graduación? <u>Escríbenos por WhatsApp</u></span>
                    </a>
                  </div>
                )}

                {paymentError && (
                  <div style={{ padding: '10px 12px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '12px', marginBottom: '10px' }}>
                    ⚠️ {paymentError}
                  </div>
                )}

                {/* Botón CTA principal */}
                <button 
                  onClick={payOnline}
                  disabled={isProcessing}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    background: isProcessing ? '#94a3b8' : (!showCheckoutForm ? '#16223f' : '#16a34a'), 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '50px', 
                    fontWeight: 600, 
                    fontSize: '15px', 
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s'
                  }}
                >
                  <CreditCard size={18} />
                  {isProcessing ? 'Procesando...' : (!showCheckoutForm ? 'Continuar' : 'Pagar con Mercado Pago')}
                </button>

                {/* En Paso 2: Sello de pago seguro debajo del botón */}
                {showCheckoutForm && (
                  <div style={{ textAlign: 'center', fontSize: '11px', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <span>🔒</span>
                    <span>Pago 100% seguro · Visa · MasterCard · OXXO · SPEI</span>
                  </div>
                )}

                {/* Seguir comprando / Volver */}
                <button 
                  onClick={() => {
                    if (showCheckoutForm) {
                      setShowCheckoutForm(false);
                    } else {
                      setIsCartOpen(false);
                    }
                  }}
                  style={{ width: '100%', padding: '8px', background: 'transparent', color: '#64748b', border: 'none', fontSize: '13px', cursor: 'pointer', marginTop: '4px', textDecoration: 'underline' }}
                >
                  {showCheckoutForm ? 'Volver a entrega' : 'Seguir comprando'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
