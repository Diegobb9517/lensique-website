import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════
   Face Matcher — ¿Qué le queda a tu rostro? (Minimalist)
   ═══════════════════════════════════════════ */

const css = `
.fm-wrap { padding: 80px 24px; background: #ffffff; font-family: 'Inter', sans-serif; }
.fm-inner { max-width: 1100px; margin: 0 auto; }
.fm-header { text-align: center; margin-bottom: 50px; }
.fm-title { font-family: 'Playfair Display', Georgia, serif; font-size: 46px; color: #111; margin: 0 0 16px; font-weight: 400; letter-spacing: -0.5px; }
.fm-sub { color: #666; font-size: 17px; font-weight: 300; max-width: 500px; margin: 0 auto; line-height: 1.6; }

.fm-layout { display: flex; gap: 48px; align-items: flex-start; }
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

.fm-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
@media (max-width: 900px) { .fm-cards { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); } }
.fm-card { background: #fafafa; border-radius: 12px; padding: 24px; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease; border: 1px solid #f0f0f0; display: flex; flex-direction: column; height: 100%; }
.fm-card:hover { transform: translateY(-6px); background: #f4f4f5; }
.fm-card-icon { margin-bottom: 20px; color: #111; display: flex; align-items: center; }
.fm-card-name { font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: #111; margin: 0 0 10px; font-weight: 400; }
.fm-card-why { font-size: 13px; color: #666; line-height: 1.6; margin: 0 0 24px; flex-grow: 1; font-weight: 300; }
.fm-card-link { margin-top: auto; display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #111; text-decoration: none; transition: gap 0.3s ease; }
.fm-card-link:hover { gap: 12px; }

.fm-cta-wrap { display: flex; justify-content: center; margin-top: 80px; }
.fm-cta { display: inline-flex; align-items: center; gap: 12px; padding: 18px 48px; background: transparent; color: #111; border: 1px solid #111; border-radius: 50px; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.fm-cta:hover { background: #111; color: #fff; }
`;

/* ─── Face icons (Minimalist SVG) ─── */
const FACE_ICONS: Record<string, JSX.Element> = {
  oval: <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 3 C18 3, 21 9, 21 16 C21 23, 16 28, 12 28 C8 28, 3 23, 3 16 C3 9, 6 3, 12 3 Z"/></svg>,
  round: <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 4 C19 4, 22 9, 22 15 C22 21, 19 26, 12 26 C5 26, 2 21, 2 15 C2 9, 5 4, 12 4 Z"/></svg>,
  square: <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4 L17 4 C20 4, 21 8, 21 14 L21 18 C21 24, 18 27, 12 27 C6 27, 3 24, 3 18 L3 14 C3 8, 4 4, 7 4 Z"/></svg>,
  heart: <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5 C16 3, 22 4, 22 10 C22 16, 16 22, 12 28 C8 22, 2 16, 2 10 C2 4, 8 3, 12 5 Z"/></svg>,
  diamond: <svg width="24" height="30" viewBox="0 0 24 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 C15 3, 17 7, 19 11 L21 15 L19 19 C17 24, 15 28, 12 28 C9 28, 7 24, 5 19 L3 15 L5 11 C7 7, 9 3, 12 3 Z"/></svg>,
};

/* ─── Frame SVG drawings (Premium Realistic) ─── */
function FrameRect() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="6" width="24" height="16" rx="3" />
      <rect x="46" y="6" width="24" height="16" rx="3" />
      <path d="M34 12 Q40 10 46 12" />
      <line x1="10" y1="10" x2="2" y2="10" />
      <line x1="70" y1="10" x2="78" y2="10" />
    </svg>
  );
}
function FrameRound() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="23" cy="15" r="11" />
      <circle cx="57" cy="15" r="11" />
      <path d="M34 13 Q40 10 46 13" />
      <line x1="12" y1="11" x2="4" y2="11" />
      <line x1="68" y1="11" x2="76" y2="11" />
    </svg>
  );
}
function FrameCatEye() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 12 7 L 22 6 Q 34 7 32 17 Q 30 25 22 25 Q 12 25 10 7 Z" />
      <path d="M 68 7 L 58 6 Q 46 7 48 17 Q 50 25 58 25 Q 68 25 70 7 Z" />
      <path d="M32 13 Q40 11 48 13" />
      <line x1="10" y1="7" x2="4" y2="9" />
      <line x1="70" y1="7" x2="76" y2="9" />
    </svg>
  );
}
function FrameAviador() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 10 9 L 28 9 Q 34 9 32 18 Q 30 26 22 27 Q 10 27 10 9 Z" />
      <path d="M 70 9 L 52 9 Q 46 9 48 18 Q 50 26 58 27 Q 70 27 70 9 Z" />
      <path d="M 24 9 Q 40 7 56 9" />
      <path d="M 28 14 Q 40 12 52 14" />
      <line x1="10" y1="11" x2="4" y2="11" />
      <line x1="70" y1="11" x2="76" y2="11" />
    </svg>
  );
}
function FrameOval() {
  return (
    <svg width="80" height="30" viewBox="0 0 80 30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="23" cy="15" rx="13" ry="9" />
      <ellipse cx="57" cy="15" rx="13" ry="9" />
      <path d="M36 13 Q40 11 44 13" />
      <line x1="10" y1="13" x2="4" y2="13" />
      <line x1="70" y1="13" x2="76" y2="13" />
    </svg>
  );
}

const FRAME_COMPONENTS: Record<string, { icon: JSX.Element; name: string; why: string; searchKeyword: string }> = {
  rect: { icon: <FrameRect/>, name: 'Rectangulares', why: 'Añaden ángulos y definen tus facciones, alargando el rostro.', searchKeyword: 'rectangular' },
  round: { icon: <FrameRound/>, name: 'Redondos / Pantos', why: 'Suavizan líneas fuertes y equilibran la mandíbula.', searchKeyword: 'redondo' },
  cat: { icon: <FrameCatEye/>, name: 'Cat Eye', why: 'Acentúan los pómulos y elevan la mirada.', searchKeyword: 'cat' },
  aviador: { icon: <FrameAviador/>, name: 'Estilo Aviador', why: 'Equilibran una frente amplia con su base ancha.', searchKeyword: 'aviador' },
  oval: { icon: <FrameOval/>, name: 'Ovalados', why: 'De proporción equilibrada, favorecen a casi todos.', searchKeyword: 'oval' },
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
  onOpenCatalog?: (searchKeyword?: string) => void;
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
                      <p className="fm-card-why" style={{ marginBottom: 0 }}>{f.why}</p>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
