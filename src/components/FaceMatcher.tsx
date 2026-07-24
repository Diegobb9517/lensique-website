import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════
   Face Matcher — ¿Qué le queda a tu rostro?
   ═══════════════════════════════════════════ */

const css = `
.fm-wrap{background:#f7f5f0;padding:80px 24px;font-family:'Inter','Helvetica Neue',sans-serif}
.fm-inner{max-width:960px;margin:0 auto}
.fm-title{font-family:'Playfair Display',Georgia,serif;font-size:32px;font-weight:500;color:#1b2436;text-align:center;margin:0 0 6px}
.fm-sub{text-align:center;color:#8a857b;font-size:15px;margin:0 0 40px;line-height:1.5}

/* Face selector */
.fm-faces{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:40px}
.fm-face{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 18px;border:1px solid rgba(0,0,0,.1);border-radius:14px;background:#fff;cursor:pointer;transition:all .18s ease;min-width:90px}
.fm-face:hover{transform:translateY(-2px);border-color:rgba(0,0,0,.25);box-shadow:0 4px 16px rgba(0,0,0,.05)}
.fm-face.active{border:2px solid #1e2a5a;background:#f5f6fb;padding:13px 17px}
.fm-face-ico{color:#5f5e5a;display:flex;align-items:center;justify-content:center;height:48px}
.fm-face.active .fm-face-ico{color:#1e2a5a}
.fm-face-lbl{font-size:13px;font-weight:500;color:#5f5e5a}
.fm-face.active .fm-face-lbl{color:#1e2a5a;font-weight:600}

/* Results */
.fm-result-title{text-align:center;font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#9a958c;margin-bottom:24px}
.fm-result-title strong{color:#1e2a5a}
.fm-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
@media(max-width:600px){.fm-cards{grid-template-columns:1fr}}
.fm-card{background:#fff;border:0.5px solid rgba(0,0,0,.1);border-radius:16px;padding:28px 24px;display:flex;align-items:flex-start;gap:20px;transition:transform .18s ease,box-shadow .18s ease}
.fm-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.06)}
.fm-card-ico{flex:0 0 auto;color:#1e2a5a;display:flex;align-items:center;justify-content:center}
.fm-card-body{flex:1}
.fm-card-name{font-family:'Playfair Display',Georgia,serif;font-size:17px;font-weight:500;color:#1b2436;margin:0 0 6px}
.fm-card-why{font-size:13px;color:#8a857b;line-height:1.5;margin:0 0 12px}
.fm-card-link{font-size:13px;font-weight:600;color:#1e2a5a;text-decoration:none;display:inline-flex;align-items:center;gap:4px;transition:gap .15s}
.fm-card-link:hover{gap:8px}

/* CTA */
.fm-cta-wrap{text-align:center;margin-top:40px}
.fm-cta{display:inline-flex;align-items:center;gap:8px;padding:16px 40px;background:#1b2436;color:#fff;border:none;border-radius:50px;font-size:16px;font-weight:600;cursor:pointer;transition:transform .15s,box-shadow .15s;font-family:inherit;text-decoration:none}
.fm-cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(27,36,54,.25)}
`;

/* ─── Face icons (SVG stroke) ─── */
const FACE_ICONS: Record<string, JSX.Element> = {
  oval: <svg width="36" height="44" viewBox="0 0 42 52" fill="none" stroke="currentColor" strokeWidth="2.2"><ellipse cx="21" cy="26" rx="14" ry="20"/></svg>,
  round: <svg width="36" height="44" viewBox="0 0 42 52" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="21" cy="26" r="18"/></svg>,
  square: <svg width="36" height="44" viewBox="0 0 42 52" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="5" y="9" width="32" height="34" rx="6"/></svg>,
  heart: <svg width="36" height="44" viewBox="0 0 42 52" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M5 12 Q21 6 37 12 Q33 34 21 46 Q9 34 5 12 Z"/></svg>,
  diamond: <svg width="36" height="44" viewBox="0 0 42 52" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M21 5 L37 26 L21 47 L5 26 Z"/></svg>,
};

/* ─── Frame SVG drawings ─── */
function FrameRect() {
  return (
    <svg width="100" height="50" viewBox="0 0 160 60" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="10" width="56" height="36" rx="7"/>
      <rect x="96" y="10" width="56" height="36" rx="7"/>
      <path d="M64 28 Q80 20 96 28"/>
      <line x1="8" y1="22" x2="1" y2="18"/><line x1="152" y1="22" x2="159" y2="18"/>
    </svg>
  );
}
function FrameRound() {
  return (
    <svg width="100" height="50" viewBox="0 0 160 60" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="40" cy="30" r="22"/>
      <circle cx="120" cy="30" r="22"/>
      <path d="M62 28 Q80 20 98 28"/>
      <line x1="18" y1="20" x2="4" y2="14"/><line x1="142" y1="20" x2="156" y2="14"/>
    </svg>
  );
}
function FrameCatEye() {
  return (
    <svg width="100" height="50" viewBox="0 0 160 60" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 42 Q10 12 38 10 Q62 8 66 28 Q68 42 40 46 Q14 48 12 42 Z"/>
      <path d="M148 42 Q150 12 122 10 Q98 8 94 28 Q92 42 120 46 Q146 48 148 42 Z"/>
      <path d="M66 28 Q80 22 94 28"/>
      <line x1="12" y1="20" x2="2" y2="12"/><line x1="148" y1="20" x2="158" y2="12"/>
    </svg>
  );
}
function FrameAviador() {
  return (
    <svg width="100" height="50" viewBox="0 0 160 60" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14 Q10 14 10 20 L8 44 Q8 50 16 50 L56 48 Q66 46 66 30 L66 16 Q64 12 56 12 Z"/>
      <path d="M146 14 Q150 14 150 20 L152 44 Q152 50 144 50 L104 48 Q94 46 94 30 L94 16 Q96 12 104 12 Z"/>
      <path d="M66 22 Q80 16 94 22"/>
      <line x1="14" y1="14" x2="4" y2="10"/><line x1="146" y1="14" x2="156" y2="10"/>
    </svg>
  );
}
function FrameOval() {
  return (
    <svg width="100" height="50" viewBox="0 0 160 60" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="40" cy="30" rx="28" ry="20"/>
      <ellipse cx="120" cy="30" rx="28" ry="20"/>
      <path d="M68 26 Q80 20 92 26"/>
      <line x1="12" y1="22" x2="2" y2="16"/><line x1="148" y1="22" x2="158" y2="16"/>
    </svg>
  );
}

const FRAME_COMPONENTS: Record<string, { icon: JSX.Element; name: string; why: string }> = {
  rect: { icon: <FrameRect/>, name: 'Rectangulares', why: 'Añaden ángulos y definen tus facciones, alargando el rostro.' },
  round: { icon: <FrameRound/>, name: 'Redondos o Pantos', why: 'Suavizan líneas fuertes y equilibran la mandíbula.' },
  cat: { icon: <FrameCatEye/>, name: 'Cat Eye', why: 'Acentúan los pómulos y suben la mirada.' },
  aviador: { icon: <FrameAviador/>, name: 'Aviador', why: 'Equilibran una frente amplia con su base ancha.' },
  oval: { icon: <FrameOval/>, name: 'Ovalados', why: 'Proporción equilibrada, favorecen casi a todos.' },
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
        <h2 className="fm-title">¿Qué le queda a tu rostro?</h2>
        <p className="fm-sub">Elige tu forma de rostro y descubre qué armazones te favorecen.</p>

        {/* Face selector */}
        <div className="fm-faces">
          {Object.entries(FACE_ICONS).map(([id, icon]) => (
            <button key={id} className={`fm-face${face === id ? ' active' : ''}`} onClick={() => setFace(id)}>
              <div className="fm-face-ico">{icon}</div>
              <span className="fm-face-lbl">{FACE_LABELS[id]}</span>
            </button>
          ))}
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          <motion.div
            key={face}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <p className="fm-result-title">Para rostro <strong>{FACE_LABELS[face]}</strong> te favorecen:</p>
            <div className="fm-cards">
              {recs.map(fk => {
                const f = FRAME_COMPONENTS[fk];
                return (
                  <div key={fk} className="fm-card">
                    <div className="fm-card-ico">{f.icon}</div>
                    <div className="fm-card-body">
                      <h4 className="fm-card-name">{f.name}</h4>
                      <p className="fm-card-why">{f.why}</p>
                      <a href="#catalogo" className="fm-card-link" onClick={(e) => { e.preventDefault(); onOpenCatalog?.(); }}>
                        Ver armazones ›
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="fm-cta-wrap">
          <button className="fm-cta" onClick={onOpenCatalog}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/>
            </svg>
            Ver catálogo completo
          </button>
        </div>
      </div>
    </section>
  );
}
