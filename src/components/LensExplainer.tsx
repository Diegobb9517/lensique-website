import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════
   Explicador Interactivo de Micas — Lensique
   ═══════════════════════════════════════════ */

const css = `
.le-wrap{background:#FFFFFF;padding:100px 0;font-family:'Outfit','Inter',sans-serif}
.le-inner{max-width:900px;margin:0 auto;padding:0 24px}
.le-title{font-family:'Playfair Display',Georgia,serif;font-size:38px;font-weight:500;color:#111827;text-align:center;margin:0 0 12px;letter-spacing:-0.5px;padding:0 24px}
.le-sub{text-align:center;color:#6B7280;font-size:16px;margin:0 auto 60px;line-height:1.6;max-width:600px;padding:0 24px}

/* Module card */
.le-mod{background:#FFFFFF;border:1px solid rgba(0,0,0,0.04);border-radius:24px;padding:40px;margin-bottom:32px;box-shadow:0 12px 40px rgba(0,0,0,0.03);transition:transform 0.3s ease,box-shadow 0.3s ease}
@media(max-width:600px){.le-mod{padding:30px 20px}}
.le-mod:hover{box-shadow:0 16px 50px rgba(0,0,0,0.05);transform:translateY(-2px)}
.le-mod-title{font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:500;color:#111827;margin:0 0 28px;text-align:center}

/* Tabs */
.le-tabs{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:36px}
.le-tab{padding:12px 28px;border:1px solid rgba(0,0,0,0.08);border-radius:50px;background:#FFFFFF;color:#6B7280;font-size:15px;font-weight:400;cursor:pointer;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);font-family:inherit}
.le-tab:hover{border-color:rgba(0,0,0,0.2);color:#111827}
.le-tab.active{border:1px solid #111827;background:#111827;color:#FFFFFF;font-weight:500;box-shadow:0 8px 20px rgba(17,24,39,0.15)}

/* Tab content */
.le-tab-body{display:flex;align-items:center;gap:48px;min-height:180px}
@media(max-width:600px){.le-tab-body{flex-direction:column;gap:24px;text-align:center}}
.le-diagram{flex:0 0 auto;display:flex;justify-content:center;width:180px}
.le-info h4{font-size:18px;font-weight:500;color:#111827;margin:0 0 10px;font-family:'Playfair Display',serif}
.le-info p{font-size:15px;color:#4B5563;line-height:1.7;margin:0;font-weight:300}

/* Slider module */
.le-slider-row{display:flex;align-items:center;gap:48px}
@media(max-width:600px){.le-slider-row{flex-direction:column;gap:32px}}
.le-slider-left{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:16px;width:180px}
.le-idx-big{font-size:48px;font-weight:400;color:#111827;line-height:1;font-family:'Playfair Display',Georgia,serif}
.le-slider-track{width:100%;position:relative;padding:10px 0}
.le-slider-track input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:2px;background:rgba(0,0,0,0.1);outline:none;cursor:pointer;border-radius:2px}
.le-slider-track input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:24px;height:24px;border-radius:50%;background:#FFFFFF;border:2px solid #111827;box-shadow:0 4px 12px rgba(0,0,0,0.1);cursor:pointer;transition:transform 0.2s}
.le-slider-track input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.1)}
.le-slider-track input[type=range]::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#FFFFFF;border:2px solid #111827;box-shadow:0 4px 12px rgba(0,0,0,0.1);cursor:pointer}
.le-slider-labels{display:flex;justify-content:space-between;margin-top:12px;font-size:12px;color:#9CA3AF;letter-spacing:0.5px;text-transform:uppercase}
.le-spec-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:32px}
@media(max-width:500px){.le-spec-grid{grid-template-columns:1fr}}
.le-spec{background:#F9FAFB;border-radius:16px;padding:20px 16px;text-align:center;border:1px solid rgba(0,0,0,0.02)}
.le-spec-val{font-size:15px;font-weight:500;color:#111827;margin-bottom:4px}
.le-spec-lbl{font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:1px;font-weight:400}
.le-slider-hint{font-size:14px;color:#6B7280;text-align:center;margin-top:24px;font-style:italic;font-weight:300}

/* Simulator */
.le-sim-wrap{width:100%;height:600px;overflow:hidden;position:relative;margin-bottom:48px;background:#000}
@media(max-width:600px){.le-sim-wrap{height:400px}}
.le-sim-bg{width:100%;height:100%;background:url('/images/cafe-pov.jpg') no-repeat center center;background-size:cover;position:absolute;top:0;left:0}

/* The blurry outside */
.le-sim-blur-overlay{position:absolute;top:0;left:0;right:0;bottom:0;backdrop-filter:blur(6px) brightness(1.1);-webkit-mask-image:radial-gradient(ellipse 240px 170px at center,transparent 98%,black 100%);mask-image:radial-gradient(ellipse 240px 170px at center,transparent 98%,black 100%);pointer-events:none;z-index:1}
@media(max-width:600px){.le-sim-blur-overlay{-webkit-mask-image:radial-gradient(ellipse 150px 110px at center,transparent 98%,black 100%);mask-image:radial-gradient(ellipse 150px 110px at center,transparent 98%,black 100%)}}

/* Center Container */
.le-sim-center{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;z-index:2;pointer-events:none}

.le-sim-lens{width:480px;height:340px;border-radius:40% 40% 50% 50% / 30% 30% 55% 55%;border:4px solid rgba(255,255,255,0.15);box-shadow:0 10px 40px rgba(0,0,0,0.4),inset 0 0 20px rgba(255,255,255,0.2);position:relative;overflow:hidden;transition:all 0.5s cubic-bezier(0.4,0,0.2,1)}
@media(max-width:600px){.le-sim-lens{width:300px;height:220px}}

/* Base glare when AR is OFF */
.le-sim-glare{position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,rgba(255,255,255,0.6) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 70%,rgba(255,255,255,0.4) 100%);transition:opacity 0.6s ease;pointer-events:none}
.le-sim-glare.off{opacity:0}

/* Blue Light Filter ON */
.le-sim-blue{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,220,180,0.15);backdrop-filter:sepia(40%) hue-rotate(-10deg) saturate(1.2);opacity:0;transition:opacity 0.6s ease;pointer-events:none}
.le-sim-blue.on{opacity:1}

/* Photochromic ON */
.le-sim-photo{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(17,24,39,0.7);opacity:0;transition:opacity 1.5s ease;pointer-events:none}
.le-sim-photo.on{opacity:1}

/* Treatments */
.le-treat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
@media(max-width:600px){.le-treat-grid{grid-template-columns:1fr}}
.le-treat{border:1px solid rgba(0,0,0,0.06);border-radius:20px;padding:28px 20px;text-align:center;cursor:pointer;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);background:#FFFFFF}
.le-treat:hover{transform:translateY(-4px);box-shadow:0 12px 30px rgba(0,0,0,0.04);border-color:rgba(0,0,0,0.1)}
.le-treat.on{border:1px solid #111827;background:#FAFAFA;box-shadow:0 8px 24px rgba(17,24,39,0.05)}
.le-treat-lens{width:80px;height:80px;border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;transition:all 0.4s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden}
.le-treat-name{font-size:16px;font-weight:500;color:#111827;margin-bottom:8px;font-family:'Playfair Display',serif}
.le-treat-desc{font-size:13px;color:#6B7280;line-height:1.5;font-weight:300}
.le-treat-badge{display:inline-block;margin-top:16px;font-size:11px;font-weight:500;padding:4px 12px;border-radius:20px;background:#111827;color:#FFFFFF;letter-spacing:0.5px;transition:all 0.3s}
.le-treat-badge.off{background:#F3F4F6;color:#6B7280}

/* CTA */
.le-cta-wrap{text-align:center;margin-top:56px}
.le-cta{display:inline-flex;align-items:center;gap:10px;padding:18px 48px;background:#111827;color:#fff;border:1px solid #111827;border-radius:50px;font-size:16px;font-weight:400;cursor:pointer;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);font-family:inherit;text-decoration:none;letter-spacing:0.5px}
.le-cta:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(17,24,39,0.2);background:#FFFFFF;color:#111827}
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
      <ellipse cx="75" cy="60" rx="55" ry="45" fill="none" stroke="#111827" strokeWidth="1.5"/>
      <ellipse cx="75" cy="60" rx="45" ry="35" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
      <text x="75" y="58" textAnchor="middle" fontSize="13" fill="#111827" fontWeight="400">Una</text>
      <text x="75" y="74" textAnchor="middle" fontSize="13" fill="#111827" fontWeight="400">distancia</text>
    </svg>
  );
}
function BifocalSVG() {
  return (
    <svg width="150" height="120" viewBox="0 0 150 120">
      <ellipse cx="75" cy="60" rx="55" ry="45" fill="none" stroke="#111827" strokeWidth="1.5"/>
      <path d="M35 80 Q75 80 115 80" fill="none" stroke="#111827" strokeWidth="1" strokeDasharray="3 3"/>
      <path d="M45 80 a20 14 0 0 1 60 0 Z" fill="#F3F4F6" stroke="#111827" strokeWidth="1" opacity="0.8"/>
      <text x="75" y="48" textAnchor="middle" fontSize="13" fill="#111827" fontWeight="400">Lejos</text>
      <text x="75" y="96" textAnchor="middle" fontSize="12" fill="#6B7280" fontWeight="400">Cerca</text>
    </svg>
  );
}
function ProgresiveSVG() {
  return (
    <svg width="150" height="120" viewBox="0 0 150 120">
      <defs>
        <linearGradient id="progGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0"/>
          <stop offset="100%" stopColor="#F3F4F6" stopOpacity="1"/>
        </linearGradient>
      </defs>
      <ellipse cx="75" cy="60" rx="55" ry="45" fill="url(#progGrad)" stroke="#111827" strokeWidth="1.5"/>
      <text x="75" y="35" textAnchor="middle" fontSize="12" fill="#111827" fontWeight="400">Lejos</text>
      <text x="75" y="64" textAnchor="middle" fontSize="12" fill="#6B7280" fontWeight="400">Intermedio</text>
      <text x="75" y="93" textAnchor="middle" fontSize="12" fill="#111827" fontWeight="400">Cerca</text>
    </svg>
  );
}

function LensCrossSectionSVG({ borderThickness }: { borderThickness: number }) {
  const cx = 75, cy = 60;
  const innerW = 46 - borderThickness * 0.4;
  return (
    <svg width="150" height="120" viewBox="0 0 150 120">
      <ellipse cx={cx} cy={cy} rx={innerW + borderThickness} ry="50" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
      <ellipse cx={cx} cy={cy} rx={innerW} ry="48" fill="#F9FAFB" stroke="#111827" strokeWidth="1.5"/>
      <line x1={cx + innerW + borderThickness + 4} y1={cy - 20} x2={cx + innerW + borderThickness + 4} y2={cy + 20} stroke="#111827" strokeWidth="1"/>
      <line x1={cx + innerW + borderThickness} y1={cy - 20} x2={cx + innerW + borderThickness + 8} y2={cy - 20} stroke="#111827" strokeWidth="1"/>
      <line x1={cx + innerW + borderThickness} y1={cy + 20} x2={cx + innerW + borderThickness + 8} y2={cy + 20} stroke="#111827" strokeWidth="1"/>
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fill="#6B7280" fontWeight="400" letterSpacing="1">⟵ ⟶</text>
    </svg>
  );
}

/* ─── Treatment lens preview ─── */
function TreatmentLens({ type, active }: { type: string; active: boolean }) {
  if (type === 'ar') {
    return (
      <div className="le-treat-lens" style={{
        background: active ? '#F9FAFB' : '#F3F4F6',
        border: `2px solid ${active ? '#111827' : '#D1D5DB'}`,
        boxShadow: active ? 'inset 0 0 20px rgba(255,255,255,1)' : 'inset 0 0 10px rgba(0,0,0,0.05)',
      }}>
        {!active && (
          <>
            <div style={{ position: 'absolute', width: '70px', height: '12px', background: '#FFFFFF', transform: 'rotate(-40deg)', top: '20px', left: '-5px', filter: 'blur(2px)', opacity: 0.9 }}/>
            <div style={{ position: 'absolute', width: '70px', height: '4px', background: '#FFFFFF', transform: 'rotate(-40deg)', top: '40px', left: '15px', filter: 'blur(1px)', opacity: 0.9 }}/>
          </>
        )}
        {active && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', top: '8px', right: '8px', opacity: 0.2 }}>
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
          </svg>
        )}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? '#111827' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" style={{ position: 'relative', zIndex: 2 }}>
          <circle cx="12" cy="12" r="10"/>
          {active && <path d="M8 12l3 3 5-6" strokeWidth="2.5"/>}
        </svg>
      </div>
    );
  }
  if (type === 'blue') {
    return (
      <div className="le-treat-lens" style={{
        background: active ? '#EFF6FF' : '#FFFFFF',
        border: `2px solid ${active ? '#3B82F6' : '#E5E7EB'}`,
      }}>
        {active && (
          <div style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '2px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '6px', background: '#3B82F6', borderRadius: '4px', boxShadow: '0 0 12px #3B82F6', opacity: 0.8 }}/>
            <div style={{ width: '4px', height: '40px', background: '#3B82F6', borderRadius: '4px', boxShadow: '0 0 12px #3B82F6' }}/>
          </div>
        )}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? '#3B82F6' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 2 }}>
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      </div>
    );
  }
  // Photochromic
  return (
    <div className="le-treat-lens" style={{
      background: active ? '#111827' : '#FFFFFF',
      border: `2px solid ${active ? '#111827' : '#E5E7EB'}`,
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? '#FBBF24' : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {active ? (
          <>
            <path d="M2 14s1.5-2 4-2 4 2 4 2 1.5-2 4-2 4 2 4 2" stroke="#FFFFFF" strokeWidth="2"/>
            <circle cx="6" cy="14" r="3" fill="#FFFFFF" stroke="none"/>
            <circle cx="18" cy="14" r="3" fill="#FFFFFF" stroke="none"/>
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="#FBBF24"/>
          </>
        ) : (
          <circle cx="12" cy="12" r="10" stroke="#9CA3AF"/>
        )}
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
        </div> {/* End of Module 2 */}
        </div> {/* End le-inner */}

        {/* ── Module 3: Treatments (FULL WIDTH) ── */}
        <div style={{ paddingBottom: '40px' }}>
          <div className="le-inner" style={{ marginBottom: '24px' }}>
            <h3 className="le-mod-title">Tratamientos (Simulador Visual)</h3>
          </div>
          
          {/* ── Simulator Window ── */}
          <div className="le-sim-wrap">
            <div className="le-sim-bg" />
            <div className="le-sim-blur-overlay" />
            <div className="le-sim-center">
              <div className="le-sim-lens">
                <div className={`le-sim-glare ${treatments.ar ? 'off' : ''}`} />
                <div className={`le-sim-blue ${treatments.blue ? 'on' : ''}`} />
                <div className={`le-sim-photo ${treatments.photo ? 'on' : ''}`} />
              </div>
            </div>
          </div>

          <div className="le-inner">
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
                {treatments.photo ? '☀️ Con sol' : '🏠 Interior'}
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="le-inner">
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
