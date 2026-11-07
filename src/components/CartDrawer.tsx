import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CreditCard, ShoppingBag, MapPin, Clock, Check, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../App';
import { priceWithMP } from './ContactLensConfiguratorModal';

interface CartDrawerProps {
  onOpenConfigurator?: (product: any, section?: string) => void;
}

export function CartDrawer({ onOpenConfigurator }: CartDrawerProps = {}) {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, setCartItems, total, clearCart } = useCart();
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
  const [priceNotice, setPriceNotice] = useState<string | null>(null);

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
      setShowCheckoutForm(false);
      setPriceNotice(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Cotizar envío por código postal
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

  // Cálculo de fechas hábiles de entrega
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

  // ============================================================
  // RE-COTIZAR CONTRA PRECIO VIGENTE DEL CATÁLOGO
  // ============================================================
  const recotizarCarrito = async (): Promise<{ updatedItems: typeof items; changed: boolean }> => {
    let catalog: any[] = [];
    try {
      if ((window as any).__fullCatalogData && Array.isArray((window as any).__fullCatalogData) && (window as any).__fullCatalogData.length > 0) {
        catalog = (window as any).__fullCatalogData;
      } else {
        const res = await fetch('/content.json');
        if (res.ok) {
          const text = await res.text();
          const clean = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
          const data = JSON.parse(clean);
          catalog = data.full_catalog_data || data.featured_products || [];
          (window as any).__fullCatalogData = catalog;
        }
      }
    } catch (err) {
      console.warn('No se pudo cargar el catálogo para re-cotizar:', err);
    }

    if (!catalog || catalog.length === 0) {
      return { updatedItems: items, changed: false };
    }

    let changed = false;
    const updatedItems = items.map(item => {
      const prodId = item.product?.id;
      const prodSku = item.product?.sku;
      const prodName = String(item.product?.name || item.title || '').trim().toLowerCase();

      const catalogProd = catalog.find(p => 
        (prodId && p.id === prodId) || 
        (prodSku && p.sku && p.sku === prodSku) ||
        (prodName && String(p.name || '').trim().toLowerCase() === prodName)
      );

      if (!catalogProd) return item;

      const liveBasePrice = Number(catalogProd.price_incl_tax || catalogProd.price || 0);
      if (!liveBasePrice || liveBasePrice <= 0) return item;

      let targetUnitPrice = item.unit_price;

      if (item.type === 'frame_with_lenses') {
        const pvp = Number(item.lensConfig?.pvp || 0);
        targetUnitPrice = pvp + liveBasePrice;
      } else if (item.lensConfig && item.lensConfig.quantityOD !== undefined) {
        // Lentes de contacto: recalcular con precio unitario catálogo
        const totalBoxes = (item.lensConfig.quantityOD || 0) + (item.lensConfig.quantityOS || 0);
        const boxes = totalBoxes > 0 ? totalBoxes : item.quantity;
        const net = liveBasePrice * boxes;
        const pricing = priceWithMP(net);
        targetUnitPrice = Math.round(pricing.price / boxes);
      } else {
        // Armazón o producto individual
        targetUnitPrice = liveBasePrice;
      }

      if (Math.round(targetUnitPrice) !== Math.round(item.unit_price)) {
        changed = true;
        return {
          ...item,
          unit_price: targetUnitPrice,
          product: { ...item.product, price_incl_tax: liveBasePrice, price: liveBasePrice }
        };
      }
      return item;
    });

    return { updatedItems, changed };
  };

  // Re-cotizar automáticamente al abrir el checkout
  useEffect(() => {
    if (showCheckoutForm && items.length > 0) {
      recotizarCarrito().then(({ updatedItems, changed }) => {
        if (changed) {
          setCartItems(updatedItems);
          setPriceNotice('El precio se actualizó al vigente.');
        }
      });
    }
  }, [showCheckoutForm]);

  // ============================================================
  // PAGAR ONLINE (MERCADO PAGO) CON MANEJO SUAVE DE PRECIOS
  // ============================================================
  const payOnline = async () => {
    setPaymentError('');
    setZipError('');
    if (items.length === 0) return;

    const missingRxItem = items.find(i => i.type === 'frame_with_lenses' && (!i.lensConfig || !i.lensConfig.rxMethod));
    if (missingRxItem) {
      setPaymentError(`El producto "${missingRxItem.title}" requiere que selecciones un método de graduación.`);
      return;
    }
    
    // Si estamos en Paso 1, validar CP y pasar a la vista amplia de checkout
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
    
    // Validación de formulario en Paso 2
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
      let responseData: any;
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
        return;
      }

      // MANEJO SUAVE DE CAMBIO DE PRECIO (Sin alerta roja que asuste)
      const errorStr = String(responseData?.error || '');
      const isPriceMismatch = errorStr.toLowerCase().includes('precio') ||
                              errorStr.toLowerCase().includes('catálogo') ||
                              errorStr.toLowerCase().includes('coincide') ||
                              errorStr.toLowerCase().includes('cambiado');

      if (isPriceMismatch) {
        const { updatedItems, changed } = await recotizarCarrito();
        setPaymentError('');
        setPriceNotice('El precio se actualizó al vigente.');

        if (changed) {
          setCartItems(updatedItems);
          localStorage.setItem('lensique_cart', JSON.stringify(updatedItems));

          const newSubtotal = updatedItems.reduce((acc, it) => acc + (it.unit_price * it.quantity), 0);
          const newIsFreeShipping = newSubtotal > 2500;
          const newShippingCost = deliveryMethod === 'HOME_DELIVERY' ? (newIsFreeShipping ? 0 : (shippingQuote?.cost ?? 150)) : 0;
          const newFinalTotal = newSubtotal + newShippingCost;

          localStorage.setItem('lensique_last_order_items', JSON.stringify(updatedItems));
          localStorage.setItem('lensique_last_order_total', newFinalTotal.toString());

          // Re-intentar automáticamente sin frenar la compra
          try {
            const retryRes = await fetch('https://lensique-pos.onrender.com/api/checkout/preference', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: newFinalTotal,
                cart: updatedItems,
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
            const retryText = await retryRes.text();
            let retryData: any;
            try { retryData = JSON.parse(retryText); } catch(e) {}
            if (retryData && retryData.init_point) {
              window.location.href = retryData.init_point;
              return;
            }
          } catch(retryErr) {
            console.warn('Reintento con nuevo precio falló:', retryErr);
          }
        }
        setIsProcessing(false);
        return;
      }

      setPaymentError(responseData.error || 'No se pudo iniciar el pago. Intenta de nuevo.');
      setIsProcessing(false);
    } catch (e: any) {
      setPaymentError('Error de conexión. Si el servidor estaba inactivo, intenta de nuevo. (' + (e.message || 'Error desconocido') + ')');
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* ============================================================ */}
          {/* PASO 2 — VISTA DE CHECKOUT AMPLIA (2 COLUMNAS)                */}
          {/* ============================================================ */}
          {showCheckoutForm ? (
            <motion.div
              className="lsq-checkout-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header de la página de checkout */}
              <header className="lsq-checkout-topbar">
                <div className="lsq-checkout-topbar-inner">
                  <div className="lsq-checkout-brand">
                    <span className="lsq-checkout-brand-title">Óptica Lensique</span>
                    <span className="lsq-checkout-brand-badge">Paso 2 · Datos y pago</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      className="lsq-checkout-back-btn" 
                      onClick={() => setShowCheckoutForm(false)}
                      title="Volver al carrito"
                    >
                      <ChevronLeft size={16} /> <span>Volver a entrega</span>
                    </button>
                    <button 
                      className="cart-close-btn"
                      aria-label="Cerrar checkout"
                      onClick={() => { setShowCheckoutForm(false); setIsCartOpen(false); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b', display: 'flex', alignItems: 'center' }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </header>

              {/* Contenedor amplio de 2 columnas */}
              <div className="lsq-checkout-container">
                {/* COLUMNA IZQUIERDA (ANCHA): Tus datos y Dirección de envío */}
                <div className="lsq-checkout-main">
                  {/* Aviso suave de precio vigente (gris/azul, nunca rojo) */}
                  {priceNotice && (
                    <div className="lsq-checkout-notice-soft">
                      <span>ℹ️</span> <span>{priceNotice}</span>
                    </div>
                  )}

                  {/* Error de validación de formulario */}
                  {formError && (
                    <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', borderRadius: '12px', fontSize: '13px', fontWeight: 500 }}>
                      ⚠️ {formError}
                    </div>
                  )}

                  {/* TARJETA 1: TUS DATOS */}
                  <div className="lsq-checkout-card">
                    <div className="lsq-checkout-card-header">
                      <h2 className="lsq-checkout-card-title">1. Tus datos de contacto</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="lsq-checkout-field">
                        <label className="lsq-checkout-label">Nombre completo *</label>
                        <input 
                          type="text" 
                          value={buyerName} 
                          onChange={e => setBuyerName(e.target.value)} 
                          onFocus={handleInputFocus}
                          placeholder="Ej. Juan Pérez González"
                          className="lsq-checkout-input"
                        />
                      </div>

                      <div className="lsq-checkout-grid-2">
                        <div className="lsq-checkout-field">
                          <label className="lsq-checkout-label">Teléfono / WhatsApp *</label>
                          <input 
                            type="tel" 
                            value={buyerPhone} 
                            onChange={e => setBuyerPhone(e.target.value)} 
                            onFocus={handleInputFocus}
                            placeholder="10 dígitos"
                            maxLength={10}
                            className="lsq-checkout-input"
                          />
                        </div>

                        <div className="lsq-checkout-field">
                          <label className="lsq-checkout-label">Correo electrónico (opcional)</label>
                          <input 
                            type="email" 
                            value={buyerEmail} 
                            onChange={e => setBuyerEmail(e.target.value)} 
                            onFocus={handleInputFocus}
                            placeholder="ejemplo@correo.com"
                            className="lsq-checkout-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TARJETA 2: DIRECCIÓN O MÉTODO DE ENTREGA */}
                  <div className="lsq-checkout-card">
                    <div className="lsq-checkout-card-header">
                      <h2 className="lsq-checkout-card-title">2. Método de entrega y dirección</h2>
                      <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                        {deliveryMethod === 'STORE_PICKUP' ? 'Recoger en tienda' : 'Envío a domicilio'}
                      </span>
                    </div>

                    {/* Selector de método en Paso 2 para facilidad del usuario */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                      <label 
                        onClick={() => setDeliveryMethod('STORE_PICKUP')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                          border: deliveryMethod === 'STORE_PICKUP' ? '2px solid #16223f' : '1px solid #e2e8f0',
                          background: deliveryMethod === 'STORE_PICKUP' ? '#f8fafc' : '#fff',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input type="radio" checked={deliveryMethod === 'STORE_PICKUP'} onChange={() => setDeliveryMethod('STORE_PICKUP')} style={{ display: 'none' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: deliveryMethod === 'STORE_PICKUP' ? 700 : 500, color: '#0f172a' }}>Recoger en tienda</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>Sin costo · Zapopan</div>
                        </div>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: deliveryMethod === 'STORE_PICKUP' ? 'none' : '2px solid #cbd5e1', background: deliveryMethod === 'STORE_PICKUP' ? '#16223f' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {deliveryMethod === 'STORE_PICKUP' && <Check size={12} color="#fff" />}
                        </div>
                      </label>

                      <label 
                        onClick={() => setDeliveryMethod('HOME_DELIVERY')}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                          border: deliveryMethod === 'HOME_DELIVERY' ? '2px solid #16223f' : '1px solid #e2e8f0',
                          background: deliveryMethod === 'HOME_DELIVERY' ? '#f8fafc' : '#fff',
                          transition: 'all 0.15s'
                        }}
                      >
                        <input type="radio" checked={deliveryMethod === 'HOME_DELIVERY'} onChange={() => setDeliveryMethod('HOME_DELIVERY')} style={{ display: 'none' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: deliveryMethod === 'HOME_DELIVERY' ? 700 : 500, color: '#0f172a' }}>Envío a domicilio</div>
                          <div style={{ fontSize: '11.5px', color: isFreeShipping ? '#16a34a' : '#64748b', fontWeight: isFreeShipping ? 600 : 400 }}>
                            {isFreeShipping ? 'Gratis' : (shippingCost > 0 ? `$${shippingCost}` : 'desde $150')}
                          </div>
                        </div>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: deliveryMethod === 'HOME_DELIVERY' ? 'none' : '2px solid #cbd5e1', background: deliveryMethod === 'HOME_DELIVERY' ? '#16223f' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {deliveryMethod === 'HOME_DELIVERY' && <Check size={12} color="#fff" />}
                        </div>
                      </label>
                    </div>

                    {deliveryMethod === 'HOME_DELIVERY' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div className="lsq-checkout-grid-3">
                          <div className="lsq-checkout-field">
                            <label className="lsq-checkout-label">Calle *</label>
                            <input 
                              type="text" 
                              value={addressDetails.street} 
                              onChange={e => setAddressDetails({...addressDetails, street: e.target.value})} 
                              onFocus={handleInputFocus}
                              placeholder="Nombre de la calle"
                              className="lsq-checkout-input"
                            />
                          </div>

                          <div className="lsq-checkout-field">
                            <label className="lsq-checkout-label">Núm. Exterior *</label>
                            <input 
                              type="text" 
                              value={addressDetails.exterior} 
                              onChange={e => setAddressDetails({...addressDetails, exterior: e.target.value})} 
                              onFocus={handleInputFocus}
                              placeholder="Ej. 123"
                              className="lsq-checkout-input"
                            />
                          </div>

                          <div className="lsq-checkout-field">
                            <label className="lsq-checkout-label">Núm. Interior</label>
                            <input 
                              type="text" 
                              value={addressDetails.interior} 
                              onChange={e => setAddressDetails({...addressDetails, interior: e.target.value})} 
                              onFocus={handleInputFocus}
                              placeholder="Opcional"
                              className="lsq-checkout-input"
                            />
                          </div>
                        </div>

                        <div className="lsq-checkout-grid-2">
                          <div className="lsq-checkout-field">
                            <label className="lsq-checkout-label">Colonia *</label>
                            <input 
                              type="text" 
                              value={addressDetails.colony} 
                              onChange={e => setAddressDetails({...addressDetails, colony: e.target.value})} 
                              onFocus={handleInputFocus}
                              placeholder="Colonia o fraccionamiento"
                              className="lsq-checkout-input"
                            />
                          </div>

                          <div className="lsq-checkout-field">
                            <label className="lsq-checkout-label">Código Postal *</label>
                            <input 
                              type="text" 
                              value={addressDetails.zip} 
                              onChange={e => {
                                setAddressDetails({...addressDetails, zip: e.target.value});
                                setZipError('');
                              }} 
                              onFocus={handleInputFocus}
                              placeholder="5 dígitos"
                              maxLength={5}
                              className="lsq-checkout-input"
                            />
                            {zipError && (
                              <span style={{ fontSize: '11.5px', color: '#ef4444', marginTop: '2px' }}>{zipError}</span>
                            )}
                          </div>
                        </div>

                        <div className="lsq-checkout-grid-2">
                          <div className="lsq-checkout-field">
                            <label className="lsq-checkout-label">Ciudad o Municipio *</label>
                            <input 
                              type="text" 
                              value={addressDetails.city} 
                              onChange={e => setAddressDetails({...addressDetails, city: e.target.value})} 
                              onFocus={handleInputFocus}
                              placeholder="Ej. Guadalajara"
                              className="lsq-checkout-input"
                            />
                          </div>

                          <div className="lsq-checkout-field">
                            <label className="lsq-checkout-label">Estado *</label>
                            <input 
                              type="text" 
                              value={addressDetails.state} 
                              onChange={e => setAddressDetails({...addressDetails, state: e.target.value})} 
                              onFocus={handleInputFocus}
                              placeholder="Ej. Jalisco"
                              className="lsq-checkout-input"
                            />
                          </div>
                        </div>

                        <div className="lsq-checkout-field">
                          <label className="lsq-checkout-label">Referencias para la entrega (opcional)</label>
                          <input 
                            type="text" 
                            value={addressDetails.references || ''} 
                            onChange={e => setAddressDetails({...addressDetails, references: e.target.value})} 
                            onFocus={handleInputFocus}
                            placeholder="Ej. Entre calles o color del portón"
                            className="lsq-checkout-input"
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={17} color="#16223f" /> Sucursal Óptica Lensique
                        </div>
                        <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                          Av. Guadalupe 1296, Jardines de San Ignacio, Zapopan, Jal. (C.P. 45040).
                        </p>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                          Te notificaremos por WhatsApp y correo electrónico cuando tu graduación esté montada y lista para recoger.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Aviso de privacidad como línea discreta */}
                  <div className="lsq-checkout-privacy">
                    🔒 Tus datos personales y de salud (receta) están protegidos. Al pagar aceptas el{' '}
                    <a href="#privacidad" onClick={(e) => { e.preventDefault(); setShowCheckoutForm(false); setIsCartOpen(false); document.getElementById('footer-privacy-link')?.click(); }} style={{ color: '#0f172a', textDecoration: 'underline' }}>
                      Aviso de Privacidad
                    </a>.
                  </div>
                </div>

                {/* COLUMNA DERECHA (FIJA / STICKY): Resumen del pedido y botón Pagar */}
                <aside className="lsq-checkout-sidebar">
                  <div className="lsq-checkout-summary-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase' }}>
                        Resumen del pedido
                      </span>
                      <button 
                        onClick={() => setShowCheckoutForm(false)} 
                        style={{ background: 'none', border: 'none', fontSize: '12px', color: '#2563eb', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontWeight: 500 }}
                      >
                        Modificar
                      </button>
                    </div>

                    {/* Lista de productos */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                      {items.map(it => (
                        <div key={it.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          {it.image && (
                            <img 
                              src={resolveImageUrl(it.image, '')} 
                              alt={it.title} 
                              style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#f8fafc', borderRadius: '8px', flexShrink: 0, border: '1px solid #e2e8f0', padding: '2px' }} 
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a', lineHeight: 1.3 }}>
                              {it.quantity > 1 ? `${it.quantity}x ` : ''}{it.title}
                            </div>
                            {it.lensConfig?.etiqueta && (
                              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: 1.35 }}>
                                Micas {it.lensConfig.etiqueta} · índice {it.lensConfig.indice} · {it.lensConfig.tipoFab || 'estándar'}
                              </div>
                            )}
                            <div style={{ fontSize: '11.5px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Clock size={11} /> <span>Llega {deliveryDaysRange}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', flexShrink: 0, paddingTop: '2px' }}>
                            ${Math.round(it.unit_price * it.quantity).toLocaleString('es-MX')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desglose de totales */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px', color: '#475569' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal</span>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>${Math.round(total).toLocaleString('es-MX')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span>
                          {deliveryMethod === 'HOME_DELIVERY' 
                            ? `Envío a domicilio · llega ${deliveryDaysRange}`
                            : 'Recoger en tienda · Zapopan'}
                        </span>
                        <span style={{ fontWeight: 700, color: (deliveryMethod === 'STORE_PICKUP' || isFreeShipping) ? '#16a34a' : '#0f172a' }}>
                          {deliveryMethod === 'STORE_PICKUP' ? 'Sin costo' : (isFreeShipping ? 'Gratis' : `$${shippingCost}`)}
                        </span>
                      </div>
                    </div>

                    {/* Total grande */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '12px', borderTop: '1px solid #e2e8f0', marginBottom: msiMonths > 0 ? '12px' : '16px' }}>
                      <span style={{ fontSize: '16px', color: '#64748b', fontWeight: 600 }}>Total</span>
                      <span className="tabular-nums" style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
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
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.08em', color: '#047857', textTransform: 'uppercase' }}>
                            PÁGALO A MESES
                          </div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#065f46', marginTop: '1px' }}>
                            {msiMonths} meses sin intereses
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '19px', fontWeight: 800, color: '#047857', lineHeight: 1.1 }}>
                            ${msiMonthly.toLocaleString('es-MX')}
                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#065f46', marginLeft: '2px' }}>/mes</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Garantía en una sola línea */}
                    <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748b', marginBottom: '14px', lineHeight: 1.4 }}>
                      🔒 Garantía 30 días · validación por optometrista.{' '}
                      <a href="/devoluciones" target="_blank" rel="noopener noreferrer" style={{ color: '#0f172a', textDecoration: 'underline' }}>
                        Ver política
                      </a>
                    </div>

                    {paymentError && (
                      <div style={{ padding: '10px 12px', background: '#fef2f2', color: '#b91c1c', borderRadius: '10px', fontSize: '12.5px', marginBottom: '12px', border: '1px solid #fecaca' }}>
                        ⚠️ {paymentError}
                      </div>
                    )}

                    {/* Botón Pagar con Mercado Pago (Verde) */}
                    <button 
                      onClick={payOnline}
                      disabled={isProcessing}
                      style={{ 
                        width: '100%', 
                        padding: '15px 20px', 
                        background: isProcessing ? '#94a3b8' : '#16a34a', 
                        color: '#fff', 
                        border: 'none', 
                        borderRadius: '50px', 
                        fontWeight: 700, 
                        fontSize: '15.5px', 
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background 0.2s',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)'
                      }}
                    >
                      <CreditCard size={19} />
                      {isProcessing ? 'Procesando pago...' : 'Pagar con Mercado Pago'}
                    </button>

                    {/* Sello de pago seguro */}
                    <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748b', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <span>🔒</span>
                      <span>Pago 100% seguro · Visa · MasterCard · OXXO · SPEI</span>
                    </div>

                    <button 
                      onClick={() => setShowCheckoutForm(false)}
                      style={{ width: '100%', padding: '10px', background: 'transparent', color: '#64748b', border: 'none', fontSize: '13px', cursor: 'pointer', marginTop: '6px', textDecoration: 'underline' }}
                    >
                      Volver al carrito
                    </button>
                  </div>
                </aside>
              </div>
            </motion.div>
          ) : (
            /* ============================================================ */
            /* PASO 1 — PANEL LATERAL ANGOSTO (~400px)                      */
            /* ============================================================ */
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
                className="cart-drawer-panel"
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
                        <div style={{ flex: 1, height: '100%', borderRadius: '2px', background: '#e2e8f0' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>
                          1. Entrega
                        </span>
                        <span style={{ fontWeight: 500, color: '#94a3b8' }}>
                          2. Datos y pago
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cuerpo del carrito (scroll vertical) */}
                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px' }}>
                  {items.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: '12px', padding: '40px 0' }}>
                      <ShoppingBag size={48} opacity={0.3} />
                      <p style={{ margin: 0, fontSize: '15px' }}>Tu carrito está vacío</p>
                      <button onClick={() => setIsCartOpen(false)} style={{ padding: '10px 20px', background: '#16223f', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', marginTop: '8px', fontSize: '13.5px' }}>
                        Explorar productos
                      </button>
                    </div>
                  ) : (
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
                                  style={{ minWidth: '36px', minHeight: '36px', width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}
                                  aria-label="Disminuir cantidad"
                                >
                                  -
                                </button>
                                <span style={{ fontSize: '12.5px', fontWeight: 600, width: '22px', textAlign: 'center', color: '#0f172a' }}>
                                  {item.quantity}
                                </span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                                  style={{ minWidth: '36px', minHeight: '36px', width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}
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

                {/* Footer fijo del Paso 1 (Totales + MSI destacado + Garantía + CTA) */}
                {items.length > 0 && (
                  <div style={{ 
                    padding: '16px 20px', 
                    background: '#ffffff', 
                    borderTop: '1px solid #e2e8f0', 
                    boxSizing: 'border-box' as const, 
                    flexShrink: 0, 
                    paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' 
                  }}>
                    {(!isFreeShipping && deliveryMethod === 'HOME_DELIVERY' && shippingCost > 0) && (
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
                    )}

                    {/* Total grande */}
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

                    {/* WhatsApp como link discreto */}
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

                    {paymentError && (
                      <div style={{ padding: '10px 12px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '12px', marginBottom: '10px' }}>
                        ⚠️ {paymentError}
                      </div>
                    )}

                    {/* Botón Continuar (Paso 1 = Azul Marino) */}
                    <button 
                      onClick={payOnline}
                      disabled={isProcessing}
                      style={{ 
                        width: '100%', 
                        padding: '14px', 
                        background: isProcessing ? '#94a3b8' : '#16223f', 
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
                      {isProcessing ? 'Procesando...' : 'Continuar al pago'}
                    </button>

                    {/* Seguir comprando */}
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      style={{ width: '100%', padding: '8px', background: 'transparent', color: '#64748b', border: 'none', fontSize: '13px', cursor: 'pointer', marginTop: '4px', textDecoration: 'underline' }}
                    >
                      Seguir comprando
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
