import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════
   Explicador Interactivo de Micas — Lensique
   ═══════════════════════════════════════════ */

const css = `
.le-wrap{background:#f7f5f0;padding:80px 24px;font-family:'Inter','Helvetica Neue',sans-serif}
.le-inner{max-width:900px;margin:0 auto}
.le-title{font-family:'Playfair Display',Georgia,serif;font-size:32px;font-weight:500;color:#1b2436;text-align:center;margin:0 0 6px}
.le-sub{text-align:center;color:#8a857b;font-size:15px;margin:0 0 48px;line-height:1.5}

/* Module card */
.le-mod{background:#fff;border:0.5px solid rgba(0,0,0,.1);border-radius:18px;padding:32px 28px;margin-bottom:28px}
.le-mod-title{font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:500;color:#1b2436;margin:0 0 20px;text-align:center}

/* Tabs */
.le-tabs{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:24px}
.le-tab{padding:10px 22px;border:1px solid rgba(0,0,0,.12);border-radius:50px;background:#fff;color:#5f5e5a;font-size:14px;font-weight:500;cursor:pointer;transition:all .18s ease;font-family:inherit}
.le-tab:hover{border-color:rgba(0,0,0,.3);transform:translateY(-1px)}
.le-tab.active{border:2px solid #1e2a5a;background:#f5f6fb;color:#1e2a5a;font-weight:600}

/* Tab content */
.le-tab-body{display:flex;align-items:center;gap:32px;min-height:160px}
@media(max-width:600px){.le-tab-body{flex-direction:column;gap:20px;text-align:center}}
.le-diagram{flex:0 0 auto;display:flex;justify-content:center}
.le-info h4{font-size:16px;font-weight:600;color:#1b2436;margin:0 0 8px}
.le-info p{font-size:14px;color:#5f5e5a;line-height:1.6;margin:0}

/* Slider module */
.le-slider-row{display:flex;align-items:center;gap:36px}
@media(max-width:600px){.le-slider-row{flex-direction:column;gap:24px}}
.le-slider-left{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:12px}
.le-idx-big{font-size:42px;font-weight:700;color:#1e2a5a;line-height:1;font-family:'Playfair Display',Georgia,serif}
.le-slider-track{width:100%}
.le-slider-track input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;border-radius:6px;background:linear-gradient(90deg,#c5d4e8,#1e2a5a);outline:none;cursor:pointer}
.le-slider-track input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:22px;border-radius:50%;background:#1e2a5a;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.2);cursor:pointer}
.le-slider-track input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#1e2a5a;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.2);cursor:pointer}
.le-slider-right{flex:1;min-width:0}
.le-slider-labels{display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:#9a958c}
.le-spec-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-top:16px}
@media(max-width:500px){.le-spec-grid{grid-template-columns:1fr}}
.le-spec{background:#f7f5f0;border-radius:10px;padding:14px;text-align:center}
.le-spec-val{font-size:14px;font-weight:600;color:#1b2436;margin-bottom:2px}
.le-spec-lbl{font-size:11px;color:#8a857b;text-transform:uppercase;letter-spacing:.5px}
.le-slider-hint{font-size:13px;color:#8a857b;text-align:center;margin-top:16px;font-style:italic}

/* Treatments */
.le-treat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
@media(max-width:600px){.le-treat-grid{grid-template-columns:1fr}}
.le-treat{border:1px solid rgba(0,0,0,.1);border-radius:14px;padding:20px 16px;text-align:center;cursor:pointer;transition:all .2s ease;background:#fff}
.le-treat:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.06)}
.le-treat.on{border:2px solid #1e2a5a;background:#f5f6fb;padding:19px 15px}
.le-treat-lens{width:72px;height:72px;border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;transition:all .4s ease;position:relative;overflow:hidden}
.le-treat-name{font-size:14px;font-weight:600;color:#1b2436;margin-bottom:4px}
.le-treat-desc{font-size:12.5px;color:#8a857b;line-height:1.4}
.le-treat-badge{display:inline-block;margin-top:8px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:#e6f7ee;color:#16a34a}
.le-treat-badge.off{background:#fef2f2;color:#dc2626}

/* CTA */
.le-cta-wrap{text-align:center;margin-top:40px}
.le-cta{display:inline-flex;align-items:center;gap:8px;padding:16px 40px;background:#1b2436;color:#fff;border:none;border-radius:50px;font-size:16px;font-weight:600;cursor:pointer;transition:transform .15s,box-shadow .15s;font-family:inherit;text-decoration:none}
.le-cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(27,36,54,.25)}
`;

/* ─── Data ─── */
const LENS_TYPES = [
  {
    id: 'mono', label: 'Monofocal', subtitle: 'Una sola distancia',
    desc: 'Corrige UNA distancia (lejos, o cerca para leer). Toda la mica se ve igual de nítida. Es la opción más común y sencilla.',
  },
  {
    id: 'bif', label: 'Bifocal', subtitle: 'Lejos y cerca, con línea',
    desc: 'Dos zonas: arriba ves de lejos y en un segmento abajo ves de cerca. Se nota una línea que divide ambas. Para quien necesita las dos distancias.',
  },
  {
    id: 'prog', label: 'Progresivo', subtitle: 'Todo en uno, sin línea',
    desc: 'Lejos, intermedio y cerca en un solo lente, con transición suave y SIN línea visible. La opción más cómoda y estética.',
  },
];

const INDEX_DATA = [
  { idx: '1.50', thickness: 'Estándar', weight: 'Peso normal', use: 'Graduación baja', border: 26 },
  { idx: '1.56', thickness: 'Delgado', weight: 'Ligero', use: 'Baja-media', border: 20 },
  { idx: '1.61', thickness: 'Más delgado', weight: 'Más ligero', use: 'Media', border: 15 },
  { idx: '1.67', thickness: 'Ultra delgado', weight: 'Muy ligero', use: 'Media-alta', border: 10 },
  { idx: '1.74', thickness: 'El más delgado', weight: 'El más ligero', use: 'Graduación alta', border: 6 },
];

/* ─── SVG Diagrams ─── */
function MonofocalSVG() {
  return (
    <svg width="150" height="120" viewBox="0 0 150 120">
      <ellipse cx="75" cy="60" rx="60" ry="48" fill="#B5D4F4" stroke="#0C447C" strokeWidth="2"/>
      <text x="75" y="58" textAnchor="middle" fontSize="13" fill="#0C447C" fontWeight="600">Una</text>
      <text x="75" y="73" textAnchor="middle" fontSize="13" fill="#0C447C" fontWeight="600">distancia</text>
    </svg>
  );
}
function BifocalSVG() {
  return (
    <svg width="150" height="120" viewBox="0 0 150 120">
      <ellipse cx="75" cy="60" rx="60" ry="48" fill="#B5D4F4" stroke="#0C447C" strokeWidth="2"/>
      <path d="M45 82 a20 14 0 0 1 60 0 Z" fill="#85B7EB" stroke="#0C447C" strokeWidth="1"/>
      <text x="75" y="48" textAnchor="middle" fontSize="12" fill="#0C447C" fontWeight="500">Lejos</text>
      <text x="75" y="96" textAnchor="middle" fontSize="11" fill="#0C447C" fontWeight="500">Cerca</text>
      <line x1="35" y1="82" x2="115" y2="82" stroke="#0C447C" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>
    </svg>
  );
}
function ProgresiveSVG() {
  return (
    <svg width="150" height="120" viewBox="0 0 150 120">
      <defs>
        <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B5D4F4"/>
          <stop offset="45%" stopColor="#9AC4EE"/>
          <stop offset="100%" stopColor="#6AA8E0"/>
        </linearGradient>
      </defs>
      <ellipse cx="75" cy="60" rx="60" ry="48" fill="url(#progGrad)" stroke="#0C447C" strokeWidth="2"/>
      <text x="75" y="30" textAnchor="middle" fontSize="11" fill="#0C447C" fontWeight="500">Lejos</text>
      <text x="75" y="63" textAnchor="middle" fontSize="11" fill="#0C447C" fontWeight="500">Intermedio</text>
      <text x="75" y="96" textAnchor="middle" fontSize="11" fill="#0C447C" fontWeight="500">Cerca</text>
      <text x="135" y="60" textAnchor="start" fontSize="9" fill="#8a857b">sin línea</text>
    </svg>
  );
}

function LensCrossSectionSVG({ borderThickness }: { borderThickness: number }) {
  const cx = 75, cy = 60;
  const innerW = 46 - borderThickness * 0.4;
  return (
    <svg width="150" height="120" viewBox="0 0 150 120">
      {/* Outer lens shape */}
      <ellipse cx={cx} cy={cy} rx={innerW + borderThickness} ry="50" fill="#B5D4F4" stroke="#0C447C" strokeWidth="1.5" opacity="0.3"/>
      {/* Inner lens */}
      <ellipse cx={cx} cy={cy} rx={innerW} ry="48" fill="#B5D4F4" stroke="#0C447C" strokeWidth="2"/>
      {/* Edge thickness indicator */}
      <line x1={cx + innerW + borderThickness + 4} y1={cy - 20} x2={cx + innerW + borderThickness + 4} y2={cy + 20} stroke="#1e2a5a" strokeWidth="2" strokeLinecap="round"/>
      <line x1={cx + innerW + borderThickness} y1={cy - 20} x2={cx + innerW + borderThickness + 8} y2={cy - 20} stroke="#1e2a5a" strokeWidth="1.5"/>
      <line x1={cx + innerW + borderThickness} y1={cy + 20} x2={cx + innerW + borderThickness + 8} y2={cy + 20} stroke="#1e2a5a" strokeWidth="1.5"/>
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="12" fill="#0C447C" fontWeight="600">⟵  ⟶</text>
    </svg>
  );
}

/* ─── Treatment lens preview ─── */
function TreatmentLens({ type, active }: { type: string; active: boolean }) {
  if (type === 'ar') {
    return (
      <div className="le-treat-lens" style={{
        background: active ? '#e8f0f8' : '#e8f0f8',
        border: `2px solid ${active ? '#0C447C' : '#c5d0db'}`,
      }}>
        {!active && (
          <>
            <div style={{ position: 'absolute', width: '50px', height: '3px', background: 'rgba(255,255,255,0.8)', transform: 'rotate(-30deg)', top: '22px', left: '8px', borderRadius: '2px' }}/>
            <div style={{ position: 'absolute', width: '30px', height: '2px', background: 'rgba(255,255,255,0.6)', transform: 'rotate(-30deg)', top: '34px', left: '20px', borderRadius: '2px' }}/>
          </>
        )}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? '#0C447C' : '#8a857b'} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          {active && <path d="M8 12l3 3 5-6"/>}
        </svg>
      </div>
    );
  }
  if (type === 'blue') {
    return (
      <div className="le-treat-lens" style={{
        background: active ? 'rgba(59,130,246,0.12)' : '#e8f0f8',
        border: `2px solid ${active ? '#3b82f6' : '#c5d0db'}`,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? '#3b82f6' : '#8a857b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
          {active && <>
            <line x1="7" y1="8" x2="7" y2="13" opacity="0.5"/>
            <line x1="10" y1="6" x2="10" y2="13" opacity="0.5"/>
            <line x1="13" y1="9" x2="13" y2="13" opacity="0.5"/>
            <line x1="16" y1="7" x2="16" y2="13" opacity="0.5"/>
          </>}
        </svg>
      </div>
    );
  }
  // Photochromic
  return (
    <div className="le-treat-lens" style={{
      background: active ? 'rgba(30,42,90,0.6)' : '#e8f0f8',
      border: `2px solid ${active ? '#1e2a5a' : '#c5d0db'}`,
      transition: 'all 0.6s ease',
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#8a857b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════ */

interface LensExplainerProps {
  onOpenCotizador?: () => void;
}

export default function LensExplainer({ onOpenCotizador }: LensExplainerProps) {
  const [lensType, setLensType] = useState('mono');
  const [indexStep, setIndexStep] = useState(0);
  const [treatments, setTreatments] = useState<Record<string, boolean>>({ ar: false, blue: false, photo: false });

  const currentLens = LENS_TYPES.find(l => l.id === lensType)!;
  const currentIndex = INDEX_DATA[indexStep];

  const toggleTreat = (key: string) => setTreatments(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="le-wrap" id="micas-explicador">
      <style>{css}</style>
      <div className="le-inner">
        <h2 className="le-title">Entiende tus micas</h2>
        <p className="le-sub">Descubre qué tipo de lente, material y tratamiento es ideal para ti.</p>

        {/* ── Module 1: Lens Type ── */}
        <div className="le-mod">
          <h3 className="le-mod-title">Tipo de lente</h3>
          <div className="le-tabs">
            {LENS_TYPES.map(lt => (
              <button
                key={lt.id}
                className={`le-tab${lensType === lt.id ? ' active' : ''}`}
                onClick={() => setLensType(lt.id)}
              >
                {lt.label}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={lensType}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="le-tab-body"
            >
              <div className="le-diagram">
                {lensType === 'mono' && <MonofocalSVG />}
                {lensType === 'bif' && <BifocalSVG />}
                {lensType === 'prog' && <ProgresiveSVG />}
              </div>
              <div className="le-info">
                <h4>{currentLens.subtitle}</h4>
                <p>{currentLens.desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Module 2: Material / Index ── */}
        <div className="le-mod">
          <h3 className="le-mod-title">Material y grosor</h3>
          <div className="le-slider-row">
            <div className="le-slider-left">
              <LensCrossSectionSVG borderThickness={currentIndex.border} />
              <div className="le-idx-big">{currentIndex.idx}</div>
            </div>
            <div className="le-slider-right">
              <div className="le-slider-track">
                <input
                  type="range"
                  min={0}
                  max={INDEX_DATA.length - 1}
                  value={indexStep}
                  onChange={e => setIndexStep(Number(e.target.value))}
                />
                <div className="le-slider-labels">
                  <span>Estándar</span>
                  <span>Ultra delgado</span>
                </div>
              </div>
              <div className="le-spec-grid">
                <div className="le-spec">
                  <div className="le-spec-val">{currentIndex.thickness}</div>
                  <div className="le-spec-lbl">Grosor</div>
                </div>
                <div className="le-spec">
                  <div className="le-spec-val">{currentIndex.weight}</div>
                  <div className="le-spec-lbl">Peso</div>
                </div>
                <div className="le-spec">
                  <div className="le-spec-val">{currentIndex.use}</div>
                  <div className="le-spec-lbl">Ideal para</div>
                </div>
              </div>
              <p className="le-slider-hint">A mayor índice, el lente es más delgado y ligero — ideal si tu graduación es alta.</p>
            </div>
          </div>
        </div>

        {/* ── Module 3: Treatments ── */}
        <div className="le-mod">
          <h3 className="le-mod-title">Tratamientos</h3>
          <div className="le-treat-grid">
            {/* Antirreflejante */}
            <div className={`le-treat${treatments.ar ? ' on' : ''}`} onClick={() => toggleTreat('ar')}>
              <TreatmentLens type="ar" active={treatments.ar} />
              <div className="le-treat-name">Antirreflejante</div>
              <div className="le-treat-desc">Elimina los reflejos molestos; ves más claro y tus lentes se ven más limpios.</div>
              <div className={`le-treat-badge${treatments.ar ? '' : ' off'}`}>
                {treatments.ar ? '✓ Activado' : 'Toca para ver'}
              </div>
            </div>

            {/* Luz Azul */}
            <div className={`le-treat${treatments.blue ? ' on' : ''}`} onClick={() => toggleTreat('blue')}>
              <TreatmentLens type="blue" active={treatments.blue} />
              <div className="le-treat-name">Filtro Luz Azul</div>
              <div className="le-treat-desc">Filtra la luz azul de pantallas; reduce el cansancio visual.</div>
              <div className={`le-treat-badge${treatments.blue ? '' : ' off'}`}>
                {treatments.blue ? '✓ Activado' : 'Toca para ver'}
              </div>
            </div>

            {/* Fotocromático */}
            <div className={`le-treat${treatments.photo ? ' on' : ''}`} onClick={() => toggleTreat('photo')}>
              <TreatmentLens type="photo" active={treatments.photo} />
              <div className="le-treat-name">Fotocromático</div>
              <div className="le-treat-desc">Se oscurece automáticamente con el sol y se aclara en interiores.</div>
              <div className={`le-treat-badge${treatments.photo ? '' : ' off'}`}>
                {treatments.photo ? '☀ Con sol' : '🏠 Interior'}
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="le-cta-wrap">
          <button className="le-cta" onClick={onOpenCotizador}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Cotiza tus micas en línea
          </button>
        </div>
      </div>
    </section>
  );
}
