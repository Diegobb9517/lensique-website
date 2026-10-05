import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

import './MicaDetailModal.css';

interface MicaDetailModalProps {
  mica: {
    id: string;
    title: string;
    image: string;
  };
  onClose: () => void;
  onOpenCotizador: () => void;
}

const micaContent: Record<string, any> = {
  m1: {
    title: "Monofocales",
    summary: "Una sola distancia (lejos o cerca).",
    who: ["Una sola distancia (lejos o cerca).", "Menores de 40 sin presbicia."],
    know: ["Cero adaptación.", "Campo completo.", "La opción más accesible."],
    priceLine: "Incluido en el precio del armazón"
  },
  m2: {
    title: "Bifocales",
    summary: "Lejos y cerca con solución práctica, no molesta la línea.",
    who: ["Lejos y cerca con solución práctica.", "No molesta la línea."],
    know: ["Línea visible.", "Sin distancia intermedia (computadora).", "Adaptación rápida."],
    priceLine: "desde +$1,090 sobre el precio base"
  },
  m4: {
    title: "Progresivos",
    summary: "Lejos, intermedio y cerca en un solo lente, sin línea.",
    who: ["Lejos, intermedio y cerca sin línea.", "Un solo par."],
    know: ["Adaptación de días a 2 semanas.", "Mover la cabeza para enfocar.", "Diseños de entrada vs. amplios.", "Garantía de adaptación 30 días."],
    priceLine: "desde +$1,990 sobre el precio base"
  },
  m5: {
    title: "Fotocromático",
    summary: "Lentes que se adaptan a la luz solar.",
    who: ["Pasas de interior a exterior seguido.", "Quieres sol y vista en uno."],
    know: ["Se oscurece con luz UV (en el auto oscurece poco por el parabrisas).", "Tarda unos segundos en aclarar.", "Combinable con progresivo/monofocal."],
    priceLine: "desde +$1,720 sobre el precio base"
  }
};

export default function MicaDetailModal({ mica, onClose, onOpenCotizador }: MicaDetailModalProps) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const content = micaContent[mica.id];
  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000 }}
    >
      <motion.div
        className="product-detail-modal mica-modal-override"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', width: '100%', maxWidth: '1100px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}
      >
        <button className="product-detail-close" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.8)', border: 'none', cursor: 'pointer', zIndex: 10, width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', overflowY: 'auto', flex: 1 }} className="mica-modal-grid-inner">
          {/* Left Column: Image */}
          <div className="product-detail-img-col" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
            <img src={mica.image} alt={content.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Right Column: Info */}
          <div className="product-detail-info-col" style={{ padding: '40px' }}>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', margin: '0 0 8px', color: '#1d1d1f' }}>{content.title}</h2>
            <p style={{ fontSize: '18px', color: '#6e6e73', margin: '0 0 32px' }}>{content.summary}</p>

            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px', color: '#1d1d1f' }}>Para quién es</h3>
            <ul style={{ paddingLeft: '20px', margin: '0 0 32px', color: '#4a4a4f', lineHeight: 1.6 }}>
              {content.who.map((item: string, i: number) => (
                <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
              ))}
            </ul>

            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px', color: '#1d1d1f' }}>Lo que debes saber</h3>
            <ul style={{ paddingLeft: '20px', margin: '0 0 32px', color: '#4a4a4f', lineHeight: 1.6 }}>
              {content.know.map((item: string, i: number) => (
                <li key={i} style={{ marginBottom: '8px' }}>{item}</li>
              ))}
            </ul>

            <p style={{ fontSize: '15px', color: '#6e6e73', margin: '0 0 32px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {content.priceLine}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                onClick={() => {
                  onClose();
                  onOpenCotizador();
                }}
                style={{ width: '100%', padding: '16px', borderRadius: '980px', background: '#1d1d1f', color: '#fff', fontSize: '16px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Cotizar con este tipo
              </button>
              <a 
                href="/catalogo?tipo=armazones"
                style={{ width: '100%', padding: '16px', borderRadius: '980px', background: '#f5f5f7', color: '#1d1d1f', fontSize: '16px', fontWeight: 600, textDecoration: 'none', textAlign: 'center', display: 'inline-block', boxSizing: 'border-box' }}
              >
                Ver armazones
              </a>
            </div>

            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <a href="/blog/monofocales-bifocales-o-progresivos" style={{ color: '#0066cc', fontSize: '15px', textDecoration: 'none' }}>Leer la guía completa</a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
