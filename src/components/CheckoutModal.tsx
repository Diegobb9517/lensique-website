import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, MessageCircle } from 'lucide-react';

export interface CheckoutData {
  title: string;
  total: number;
  waText: string;
  items: any[];
}

interface CheckoutModalProps {
  data: CheckoutData | null;
  onClose: () => void;
  onWhatsApp: () => void;
}

export function CheckoutModal({ data, onClose, onWhatsApp }: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const payOnline = async () => {
    if (!data) return;
    try {
      setIsProcessing(true);
      const res = await fetch('https://lensique-pos.onrender.com/api/checkout/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: data.total, items: data.items })
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

  if (!data) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay" 
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }}
      >
        <motion.div 
          className="booking-modal"
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          style={{ background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '90%', position: 'relative' }}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="#64748b" />
          </button>

          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', marginBottom: '16px', paddingRight: '24px' }}>
            Resumen de tu compra
          </h2>
          
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {data.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#334155' }}>
                  <span style={{ paddingRight: '12px', lineHeight: 1.4 }}>{item.title}</span>
                  <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>${Math.round(item.unit_price).toLocaleString('es-MX')}</span>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '16px', fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
              <span>Total</span>
              <span>${Math.round(data.total).toLocaleString('es-MX')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '16px', background: '#009ee3', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              onClick={payOnline}
              disabled={isProcessing}
            >
              <CreditCard size={20} />
              {isProcessing ? 'Procesando...' : 'Pagar en línea'}
            </button>
            
            <button 
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '16px', background: 'transparent', color: '#1b2436', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              onClick={onWhatsApp}
            >
              <MessageCircle size={20} />
              Enviar por WhatsApp
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', margin: 0, marginTop: '4px' }}>
              *Para envíos fuera de ZMG, usa WhatsApp.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
