import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════
   Face Matcher — ¿Qué le queda a tu rostro? (Minimalist)
   ═══════════════════════════════════════════ */

const css = `
.fm-wrap { padding: 120px 24px; background: #ffffff; font-family: 'Inter', sans-serif; }
.fm-inner { max-width: 1000px; margin: 0 auto; }
.fm-header { text-align: center; margin-bottom: 70px; }
.fm-title { font-family: 'Playfair Display', Georgia, serif; font-size: 46px; color: #111; margin: 0 0 16px; font-weight: 400; letter-spacing: -0.5px; }
.fm-sub { color: #666; font-size: 17px; font-weight: 300; max-width: 500px; margin: 0 auto; line-height: 1.6; }

.fm-layout { display: flex; gap: 60px; align-items: flex-start; }
@media (max-width: 860px) { .fm-layout { flex-direction: column; gap: 40px; } }

.fm-sidebar { flex: 0 0 240px; display: flex; flex-direction: column; gap: 8px; }
@media (max-width: 860px) { .fm-sidebar { flex: 1; width: 100%; flex-direction: row; flex-wrap: wrap; justify-content: center; } }

.fm-tab { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background: transparent; border: 1px solid transparent; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; text-align: left; }
.fm-tab:hover { background: #f9f9f9; }
.fm-tab.active { background: #111; color: #fff; box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
@media (max-width: 860px) { .fm-tab { padding: 12px 16px; flex-direction: column; gap: 8px; align-items: center; text-align: center; } }

.fm-tab-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; color: #111; transition: color 0.3s; }
.fm-tab.active .fm-tab-icon { color: #fff; }
.fm-tab-label { font-size: 15px; font-weight: 500; letter-spacing: 0.5px; color: #444; transition: color 0.3s; }
.fm-tab.active .fm-tab-label { color: #fff; }

.fm-content { flex: 1; min-width: 0; }
.fm-result-header { margin-bottom: 32px; border-bottom: 1px solid #eee; padding-bottom: 24px; }
.fm-result-subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #888; font-weight: 600; margin: 0 0 12px; }
.fm-result-title { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; color: #111; margin: 0; font-weight: 400; }

.fm-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
.fm-card { background: #fafafa; border-radius: 12px; padding: 36px 32px; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease; border: 1px solid #f0f0f0; display: flex; flex-direction: column; height: 100%; }
.fm-card:hover { transform: translateY(-6px); background: #f4f4f5; }
.fm-card-icon { margin-bottom: 28px; color: #111; display: flex; align-items: center; }
.fm-card-name { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #111; margin: 0 0 12px; font-weight: 400; }
.fm-card-why { font-size: 14px; color: #666; line-height: 1.7; margin: 0 0 32px; flex-grow: 1; font-weight: 300; }
.fm-card-link { margin-top: auto; display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #111; text-decoration: none; transition: gap 0.3s ease; }
.fm-card-link:hover { gap: 12px; }

.fm-cta-wrap { display: flex; justify-content: center; margin-top: 80px; }
.fm-cta { display: inline-flex; align-items: center; gap: 12px; padding: 18px 48px; background: transparent; color: #111; border: 1px solid #111; border-radius: 50px; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.fm-cta:hover { background: #111; color: #fff; }
`;

/* ─── Face icons (Minimalist SVG) ─── */
const FACE_ICONS: Record<string, JSX.Element> = {
  oval: <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="12" cy="15" rx="9" ry="13"/></svg>,
  round: <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="15" r="11"/></svg>,
  square: <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="22" rx="4"/></svg>,
  heart: <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="M12 26 C12 26 3 18 3 10 C3 6 6 4 9 4 C10.5 4 12 5.5 12 5.5 C12 5.5 13.5 4 15 4 C18 4 21 6 21 10 C21 18 12 26 12 26 Z"/></svg>,
  diamond: <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><polygon points="12,3 21,15 12,27 3,15"/></svg>,
};

/* ─── Frame SVG drawings (Minimalist) ─── */
function FrameRect() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="30" height="18" rx="3"/>
      <rect x="46" y="6" width="30" height="18" rx="3"/>
      <path d="M34 14 Q40 10 46 14"/>
      <line x1="4" y1="12" x2="0" y2="10"/><line x1="76" y1="12" x2="80" y2="10"/>
    </svg>
  );
}
function FrameRound() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="19" cy="15" r="12"/>
      <circle cx="61" cy="15" r="12"/>
      <path d="M31 14 Q40 10 49 14"/>
      <line x1="7" y1="11" x2="1" y2="8"/><line x1="73" y1="11" x2="79" y2="8"/>
    </svg>
  );
}
function FrameCatEye() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22 Q4 8 20 6 Q32 5 34 15 Q36 24 22 26 Q8 27 6 22 Z"/>
      <path d="M74 22 Q76 8 60 6 Q48 5 46 15 Q44 24 58 26 Q72 27 74 22 Z"/>
      <path d="M34 14 Q40 10 46 14"/>
      <line x1="6" y1="12" x2="1" y2="8"/><line x1="74" y1="12" x2="79" y2="8"/>
    </svg>
  );
}
function FrameAviador() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8 Q4 8 4 12 L3 24 Q3 27 8 27 L28 26 Q34 25 34 16 L34 9 Q33 7 28 7 Z"/>
      <path d="M73 8 Q76 8 76 12 L77 24 Q77 27 72 27 L52 26 Q46 25 46 16 L46 9 Q47 7 52 7 Z"/>
      <path d="M34 12 Q40 9 46 12"/>
      <line x1="7" y1="8" x2="2" y2="6"/><line x1="73" y1="8" x2="78" y2="6"/>
    </svg>
  );
}
function FrameOval() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="20" cy="15" rx="15" ry="10"/>
      <ellipse cx="60" cy="15" rx="15" ry="10"/>
      <path d="M35 13 Q40 10 45 13"/>
      <line x1="5" y1="12" x2="1" y2="9"/><line x1="75" y1="12" x2="79" y2="9"/>
    </svg>
  );
}

const FRAME_COMPONENTS: Record<string, { icon: JSX.Element; name: string; why: string }> = {
  rect: { icon: <FrameRect/>, name: 'Rectangulares', why: 'Añaden ángulos y definen tus facciones, alargando el rostro.' },
  round: { icon: <FrameRound/>, name: 'Redondos / Pantos', why: 'Suavizan líneas fuertes y equilibran la mandíbula.' },
  cat: { icon: <FrameCatEye/>, name: 'Cat Eye', why: 'Acentúan los pómulos y elevan la mirada.' },
  aviador: { icon: <FrameAviador/>, name: 'Estilo Aviador', why: 'Equilibran una frente amplia con su base ancha.' },
  oval: { icon: <FrameOval/>, name: 'Ovalados', why: 'De proporción equilibrada, favorecen a casi todos.' },
};

const FACE_RECS: Record<string, string[]> = {
  oval: ['rect', 'cat', 'aviador'],
  round: ['rect', 'cat'],
  square: ['round', 'aviador'],
  heart: ['aviador', 'round'],
  diamond: ['cat', 'oval'],
};

const FACE_LABELS: Record<string, string> = {
  oval: 'Ovalado', round: 'Redondo', square: 'Cuadrado', heart: 'Corazón', diamond: 'Diamante'
};

interface FaceMatcherProps {
  onOpenCatalog?: () => void;
}

export default function FaceMatcher({ onOpenCatalog }: FaceMatcherProps) {
  const [face, setFace] = useState('oval');
  const recs = FACE_RECS[face];

  return (
    <section className="fm-wrap" id="face-matcher">
      <style>{css}</style>
      <div className="fm-inner">
        <div className="fm-header">
          <h2 className="fm-title">¿Qué le queda a tu rostro?</h2>
          <p className="fm-sub">Descubre los estilos que mejor armonizan con tus facciones.</p>
        </div>

        <div className="fm-layout">
          {/* Sidebar Face selector */}
          <div className="fm-sidebar">
            {Object.entries(FACE_ICONS).map(([id, icon]) => (
              <button key={id} className={`fm-tab ${face === id ? 'active' : ''}`} onClick={() => setFace(id)}>
                <div className="fm-tab-icon">{icon}</div>
                <span className="fm-tab-label">{FACE_LABELS[id]}</span>
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="fm-content">
            <div className="fm-result-header">
              <p className="fm-result-subtitle">Recomendaciones para</p>
              <h3 className="fm-result-title">Rostro {FACE_LABELS[face]}</h3>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={face}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fm-cards"
              >
                {recs.map(fk => {
                  const f = FRAME_COMPONENTS[fk];
                  return (
                    <div key={fk} className="fm-card">
                      <div className="fm-card-icon">{f.icon}</div>
                      <h4 className="fm-card-name">{f.name}</h4>
                      <p className="fm-card-why">{f.why}</p>
                      <a href="#catalogo" className="fm-card-link" onClick={(e) => { e.preventDefault(); onOpenCatalog?.(); }}>
                        Ver armazones <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </a>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="fm-cta-wrap">
          <button className="fm-cta" onClick={onOpenCatalog}>
            Explorar catálogo completo
          </button>
        </div>
      </div>
    </section>
  );
}
