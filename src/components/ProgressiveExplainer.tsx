import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const css = `
.pe-wrap { padding: 80px 20px; background: #faf9f6; overflow: hidden; }
.pe-inner { max-width: 1200px; margin: 0 auto; }
.pe-title { text-align: center; font-family: 'Playfair Display', Georgia, serif; font-size: 42px; color: #111827; margin: 0 0 12px; letter-spacing: -0.5px; }
.pe-sub { text-align: center; font-size: 17px; color: #6B7280; max-width: 700px; margin: 0 auto 24px; }
.pe-tagline { text-align: center; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #1e2a5a; margin-bottom: 48px; }

/* The Main Layout (Side by side on desktop) */
.pe-layout { display: flex; gap: 48px; align-items: stretch; margin-bottom: 40px; }
@media(max-width: 1000px) { .pe-layout { flex-direction: column; gap: 32px; } }

/* The Simulator Container (Left Side) */
.pe-sim-box { flex: 1; position: relative; min-height: 500px; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.06); background: #000; }
.pe-sim-bg { position: absolute; top: -10px; left: -10px; right: -10px; bottom: -10px; background: url('/images/cafe-view2.jpg') no-repeat center center; background-size: cover; z-index: 1; filter: saturate(1.2); }

/* Frosted glass outside the lens */
.pe-lens-overlay { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 280px; height: 360px; border-radius: 40% 40% 50% 50% / 30% 30% 55% 55%; border: 3px solid rgba(255,255,255,0.4); box-shadow: 0 0 0 2000px rgba(255,255,255,0.7), inset 0 0 20px rgba(255,255,255,0.5); z-index: 2; }
@media(max-width: 768px) { .pe-lens-overlay { width: 220px; height: 280px; } .pe-sim-box { min-height: 400px; } }

/* The blurred mask that covers the lens except the active zone */
.pe-lens-blur { position: absolute; top: 0; left: 0; width: 100%; height: 100%; backdrop-filter: blur(12px) brightness(0.9); z-index: 3; pointer-events: none; border-radius: inherit; transition: -webkit-mask-image 0.6s ease, mask-image 0.6s ease; }

/* Linear gradient masks to create the clear corridor */
.pe-lens-blur.far { -webkit-mask-image: linear-gradient(to bottom, transparent 0%, transparent 35%, black 55%, black 100%); mask-image: linear-gradient(to bottom, transparent 0%, transparent 35%, black 55%, black 100%); }
.pe-lens-blur.mid { -webkit-mask-image: linear-gradient(to bottom, black 0%, black 25%, transparent 45%, transparent 55%, black 75%, black 100%); mask-image: linear-gradient(to bottom, black 0%, black 25%, transparent 45%, transparent 55%, black 75%, black 100%); }
.pe-lens-blur.near { -webkit-mask-image: linear-gradient(to bottom, black 0%, black 45%, transparent 65%, transparent 100%); mask-image: linear-gradient(to bottom, black 0%, black 45%, transparent 65%, transparent 100%); }

/* Labels on lens */
.pe-lens-label { position: absolute; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,0.6); transition: all 0.4s ease; text-shadow: 0 1px 4px rgba(0,0,0,0.5); z-index: 4; pointer-events: none; }
.pe-lens-label.far { top: 15%; }
.pe-lens-label.mid { top: 50%; transform: translate(-50%, -50%); }
.pe-lens-label.near { bottom: 15%; }
.pe-lens-label.active { color: #fff; font-size: 13px; text-shadow: 0 2px 8px rgba(0,0,0,0.8); }
.pe-lens-label.active::after { content: ''; position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 24px; height: 2px; background: #fff; border-radius: 2px; }

/* Permanent Aberration Zones (Smoky grey blur in lower corners) */
.pe-lens-aberrations { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(140, 150, 160, 0.45); backdrop-filter: blur(14px) grayscale(0.5); z-index: 3; pointer-events: none; border-radius: inherit; -webkit-mask-image: radial-gradient(ellipse 130px 180px at -5% 85%, black 0%, black 40%, transparent 80%), radial-gradient(ellipse 130px 180px at 105% 85%, black 0%, black 40%, transparent 80%); mask-image: radial-gradient(ellipse 130px 180px at -5% 85%, black 0%, black 40%, transparent 80%), radial-gradient(ellipse 130px 180px at 105% 85%, black 0%, black 40%, transparent 80%); }

/* Aberration labels */
.pe-aberration-label { position: absolute; top: 65%; transform: translateY(-50%); font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.95); text-shadow: 0 2px 6px rgba(0,0,0,0.9); pointer-events: none; z-index: 4; text-align: center; line-height: 1.3; opacity: 1; }
.pe-aberration-label.left { left: 10px; }
.pe-aberration-label.right { right: 10px; }

/* Controls layout (Right Side) */
.pe-controls { flex: 0 0 380px; display: flex; flex-direction: column; gap: 24px; }
@media(max-width: 1000px) { .pe-controls { flex: auto; } }

/* Button list */
.pe-btn-list { display: flex; flex-direction: column; gap: 12px; }
.pe-zone-btn { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: #fff; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; text-align: left; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
.pe-zone-btn:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); transform: translateY(-2px); }
.pe-zone-btn.active { background: #111827; color: #fff; box-shadow: 0 8px 24px rgba(17,24,39,0.15); transform: translateX(8px); }
@media(max-width: 768px) { .pe-zone-btn.active { transform: translateX(0) scale(1.02); } }
.pe-zone-title { font-size: 17px; font-weight: 600; margin-bottom: 4px; }
.pe-zone-desc { font-size: 13px; color: #6B7280; transition: color 0.3s; line-height: 1.4; }
.pe-zone-btn.active .pe-zone-desc { color: rgba(255,255,255,0.7); }
.pe-zone-icon { opacity: 0; transform: translateX(-10px); transition: all 0.3s; color: #fff; }
.pe-zone-btn.active .pe-zone-icon { opacity: 1; transform: translateX(0); }

/* Info panel */
.pe-info-panel { flex: 1; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
.pe-info-panel::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #111827; }
.pe-info-icon-wrap { width: 48px; height: 48px; border-radius: 12px; background: #F3F4F6; display: flex; align-items: center; justify-content: center; color: #111827; margin-bottom: 20px; }
.pe-info-label { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 12px; }
.pe-info-text { font-size: 15px; color: #4B5563; line-height: 1.6; margin: 0; }

/* CTA */
.pe-cta-wrap { text-align: center; margin-top: 16px; }
.pe-cta { display: inline-flex; align-items: center; gap: 8px; padding: 14px 36px; background: #111827; color: #fff; border: none; border-radius: 50px; font-size: 15px; font-weight: 600; cursor: pointer; transition: transform .15s,box-shadow .15s; font-family: inherit; }
.pe-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(17,24,39,.25); }
`;

const ZONES = [
  {
    id: 'far',
    title: 'Visión de lejos',
    desc: 'Manejar, ver la tele o admirar paisajes.',
    text: 'Miras al frente a través de la parte superior del lente y ves nítido a la distancia. El campo visual es súper amplio para que disfrutes de tu entorno sin restricciones.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
  },
  {
    id: 'mid',
    title: 'Visión intermedia',
    desc: 'Trabajar en la computadora o cocinar.',
    text: 'Bajas un poco la mirada y entras al corredor intermedio. Enfocas perfectamente la pantalla de la compu o el tablero del auto sin forzar el cuello ni cansarte.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
  },
  {
    id: 'near',
    title: 'Visión de cerca',
    desc: 'Leer, usar el celular o manualidades.',
    text: 'Miras hacia abajo y utilizas la zona inferior del lente. Lees tu celular o un libro con absoluta claridad. Todo en el mismo lente, sin la molesta línea de los bifocales.',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  },
];

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

        <div className="pe-layout">
          {/* Dynamic Simulator */}
          <div className="pe-sim-box">
            <div className="pe-sim-bg" />
            
            <div className="pe-lens-overlay">
              {/* Permanent smoky aberration zones on the sides */}
              <div className="pe-lens-aberrations" />
              
              <div className={`pe-lens-blur ${activeZone}`} />
              
              <div className={`pe-lens-label far ${activeZone === 'far' ? 'active' : ''}`}>Lejos</div>
              <div className={`pe-lens-label mid ${activeZone === 'mid' ? 'active' : ''}`}>Intermedio</div>
              <div className={`pe-lens-label near ${activeZone === 'near' ? 'active' : ''}`}>Cerca</div>
              
              <div className="pe-aberration-label left">Aberración<br/>(Borroso)</div>
              <div className="pe-aberration-label right">Aberración<br/>(Borroso)</div>
            </div>
          </div>

          {/* Controls and Info */}
          <div className="pe-controls">
            <div className="pe-btn-list">
              {ZONES.map(z => (
                <div 
                  key={z.id} 
                  className={`pe-zone-btn ${activeZone === z.id ? 'active' : ''}`}
                  onClick={() => setActiveZone(z.id)}
                >
                  <div>
                    <div className="pe-zone-title">{z.title}</div>
                    <div className="pe-zone-desc">{z.desc}</div>
                  </div>
                  <div className="pe-zone-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeZone}

              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="pe-info-panel"
            >
              <div className="pe-info-icon-wrap">{currentZone.icon}</div>
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
