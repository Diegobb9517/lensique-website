import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════
   Así funcionan los progresivos — Visual interactivo
   ═══════════════════════════════════════════════ */

const css = `
.pe-wrap{background:#fff;padding:80px 24px;font-family:'Inter','Helvetica Neue',sans-serif}
.pe-inner{max-width:800px;margin:0 auto}
.pe-title{font-family:'Playfair Display',Georgia,serif;font-size:32px;font-weight:500;color:#1b2436;text-align:center;margin:0 0 6px}
.pe-sub{text-align:center;color:#8a857b;font-size:15px;margin:0 0 8px;line-height:1.5}
.pe-tagline{text-align:center;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#1e2a5a;margin:0 0 40px}

.pe-body{display:flex;align-items:center;gap:48px;justify-content:center}
@media(max-width:680px){.pe-body{flex-direction:column;gap:28px}}
.pe-lens-col{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:16px}
.pe-info-col{flex:1;min-width:0;max-width:380px}

/* Buttons */
.pe-btns{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:24px}
.pe-btn{padding:10px 20px;border:1px solid rgba(0,0,0,.12);border-radius:50px;background:#fff;color:#5f5e5a;font-size:14px;font-weight:500;cursor:pointer;transition:all .18s ease;font-family:inherit}
.pe-btn:hover{border-color:rgba(0,0,0,.3);transform:translateY(-1px)}
.pe-btn.active{border:2px solid #1e2a5a;background:#f5f6fb;color:#1e2a5a;font-weight:600;padding:9px 19px}

/* Info card */
.pe-info-card{background:#f7f5f0;border:0.5px solid rgba(0,0,0,.08);border-radius:16px;padding:28px 24px}
.pe-info-icon{margin-bottom:12px;color:#1e2a5a}
.pe-info-label{font-family:'Playfair Display',Georgia,serif;font-size:19px;font-weight:500;color:#1b2436;margin:0 0 10px}
.pe-info-text{font-size:14px;color:#5f5e5a;line-height:1.6;margin:0}

/* CTA */
.pe-cta-wrap{text-align:center;margin-top:40px}
.pe-cta{display:inline-flex;align-items:center;gap:8px;padding:14px 36px;background:#1b2436;color:#fff;border:none;border-radius:50px;font-size:15px;font-weight:600;cursor:pointer;transition:transform .15s,box-shadow .15s;font-family:inherit;text-decoration:none}
.pe-cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(27,36,54,.25)}
`;

const ZONES = [
  {
    id: 'far',
    label: 'Mirar de lejos',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    title: 'Visión de lejos',
    text: 'Miras al frente y ves nítido a la distancia — como al manejar o ver la tele.',
  },
  {
    id: 'mid',
    label: 'Intermedio',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    title: 'Visión intermedia',
    text: 'Bajas un poco la mirada y enfocas la compu o el celular, sin cansarte.',
  },
  {
    id: 'near',
    label: 'De cerca',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    title: 'Visión de cerca',
    text: 'Miras hacia abajo y lees de cerca con claridad. Todo en el mismo lente, sin línea que se note.',
  },
];

function ProgressiveLensSVG({ activeZone }: { activeZone: string }) {
  const farColor = activeZone === 'far' ? '#85B7EB' : '#E6F1FB';
  const midColor = activeZone === 'mid' ? '#85B7EB' : '#E6F1FB';
  const nearColor = activeZone === 'near' ? '#85B7EB' : '#E6F1FB';

  const farLabelWeight = activeZone === 'far' ? '700' : '400';
  const midLabelWeight = activeZone === 'mid' ? '700' : '400';
  const nearLabelWeight = activeZone === 'near' ? '700' : '400';

  const farLabelColor = activeZone === 'far' ? '#0C447C' : '#8a9bb5';
  const midLabelColor = activeZone === 'mid' ? '#0C447C' : '#8a9bb5';
  const nearLabelColor = activeZone === 'near' ? '#0C447C' : '#8a9bb5';

  return (
    <svg width="180" height="220" viewBox="0 0 180 220">
      <defs>
        <clipPath id="lensClip">
          <ellipse cx="90" cy="110" rx="72" ry="90"/>
        </clipPath>
      </defs>
      {/* Lens outline */}
      <ellipse cx="90" cy="110" rx="72" ry="90" fill="none" stroke="#0C447C" strokeWidth="2.5"/>
      
      {/* Zones clipped to lens */}
      <g clipPath="url(#lensClip)">
        {/* Far zone (top) */}
        <rect x="0" y="20" width="180" height="73" fill={farColor} style={{ transition: 'fill 0.4s ease' }}/>
        {/* Mid zone (center) */}
        <rect x="0" y="93" width="180" height="55" fill={midColor} style={{ transition: 'fill 0.4s ease' }}/>
        {/* Near zone (bottom) */}
        <rect x="0" y="148" width="180" height="72" fill={nearColor} style={{ transition: 'fill 0.4s ease' }}/>
        
        {/* Zone dividers - subtle gradient lines */}
        <line x1="20" y1="93" x2="160" y2="93" stroke="#0C447C" strokeWidth="0.5" opacity="0.25"/>
        <line x1="20" y1="148" x2="160" y2="148" stroke="#0C447C" strokeWidth="0.5" opacity="0.25"/>
      </g>

      {/* Labels */}
      <text x="90" y="65" textAnchor="middle" fontSize="14" fill={farLabelColor} fontWeight={farLabelWeight} style={{ transition: 'all 0.3s ease' }}>Lejos</text>
      <text x="90" y="124" textAnchor="middle" fontSize="14" fill={midLabelColor} fontWeight={midLabelWeight} style={{ transition: 'all 0.3s ease' }}>Intermedio</text>
      <text x="90" y="178" textAnchor="middle" fontSize="14" fill={nearLabelColor} fontWeight={nearLabelWeight} style={{ transition: 'all 0.3s ease' }}>Cerca</text>

      {/* Arrow indicator on active zone */}
      {activeZone === 'far' && <polygon points="170,55 180,65 170,75" fill="#0C447C" opacity="0.6" style={{ transition: 'all 0.3s ease' }}/>}
      {activeZone === 'mid' && <polygon points="170,110 180,120 170,130" fill="#0C447C" opacity="0.6" style={{ transition: 'all 0.3s ease' }}/>}
      {activeZone === 'near' && <polygon points="170,165 180,175 170,185" fill="#0C447C" opacity="0.6" style={{ transition: 'all 0.3s ease' }}/>}

      {/* "Sin línea" label */}
      <text x="90" y="215" textAnchor="middle" fontSize="10" fill="#8a857b" fontStyle="italic">Sin línea visible</text>
    </svg>
  );
}

interface ProgressiveExplainerProps {
  onOpenCotizador?: () => void;
}

export default function ProgressiveExplainer({ onOpenCotizador }: ProgressiveExplainerProps) {
  const [activeZone, setActiveZone] = useState('far');
  const currentZone = ZONES.find(z => z.id === activeZone)!;

  return (
    <section className="pe-wrap" id="progresivos-explainer">
      <style>{css}</style>
      <div className="pe-inner">
        <h2 className="pe-title">Así funcionan los progresivos</h2>
        <p className="pe-sub">La tecnología más cómoda y estética para ver a todas las distancias.</p>
        <p className="pe-tagline">Un solo lente, tres distancias, sin línea.</p>

        {/* Buttons */}
        <div className="pe-btns">
          {ZONES.map(z => (
            <button
              key={z.id}
              className={`pe-btn${activeZone === z.id ? ' active' : ''}`}
              onClick={() => setActiveZone(z.id)}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* Body: Lens + Info */}
        <div className="pe-body">
          <div className="pe-lens-col">
            <ProgressiveLensSVG activeZone={activeZone} />
          </div>

          <div className="pe-info-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeZone}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="pe-info-card"
              >
                <div className="pe-info-icon">{currentZone.icon}</div>
                <h3 className="pe-info-label">{currentZone.title}</h3>
                <p className="pe-info-text">{currentZone.text}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="pe-cta-wrap">
          <button className="pe-cta" onClick={onOpenCotizador}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Cotiza tus micas en línea
          </button>
        </div>
      </div>
    </section>
  );
}
