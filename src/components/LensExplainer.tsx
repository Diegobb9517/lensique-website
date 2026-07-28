import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════
   Explicador Interactivo de Micas — Lensique
   ═══════════════════════════════════════════ */

const css = `
.le-wrap{background:#FFFFFF;padding:100px 0;font-family:'Outfit','Inter',sans-serif;overflow-x:hidden}
.le-inner{max-width:900px;margin:0 auto;padding:0 24px}
.le-title{font-family:'Playfair Display',Georgia,serif;font-size:38px;font-weight:500;color:#111827;text-align:center;margin:0 0 12px;letter-spacing:-0.5px}
.le-sub{text-align:center;color:#6B7280;font-size:16px;margin:0 auto 60px;line-height:1.6;max-width:600px}

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

/* Simulator FULL WIDTH PARALLAX */
.le-sim-wrap{width:100vw;height:420px;position:relative;margin:0 0 32px calc(50% - 50vw);background:#000;overflow:hidden}
@media(max-width:600px){.le-sim-wrap{height:300px}}

.le-sim-bg{position:absolute;top:-10px;left:-10px;right:-10px;bottom:-10px;background:url('/images/cafe-view2.jpg') no-repeat center center;background-size:cover;background-attachment:fixed;filter:blur(8px) brightness(1.1);z-index:1}

.le-sim-center{position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;gap:40px;z-index:2;pointer-events:none}
@media(max-width:768px){.le-sim-center{gap:16px}}

.le-sim-bridge{width:36px;height:8px;background:rgba(255,255,255,0.15);border-top:1px solid rgba(255,255,255,0.4);border-bottom:1px solid rgba(0,0,0,0.3);border-radius:10px;box-shadow:0 4px 10px rgba(0,0,0,0.4);margin:0 -20px;position:relative;z-index:3}
@media(max-width:768px){.le-sim-bridge{width:20px;height:4px;margin:0 -10px}}

.le-sim-lens{width:320px;height:240px;border-radius:40% 40% 50% 50% / 30% 30% 55% 55%;border:4px solid rgba(255,255,255,0.15);box-shadow:0 20px 60px rgba(0,0,0,0.6),inset 0 0 20px rgba(255,255,255,0.2);position:relative;overflow:hidden;transition:all 0.5s cubic-bezier(0.4,0,0.2,1);background:url('/images/cafe-view2.jpg') no-repeat center center;background-size:cover;background-attachment:fixed;z-index:4}
@media(max-width:768px){.le-sim-lens{width:160px;height:120px;border-width:2px}}

/* Washout for AR OFF */
.le-sim-washout{position:absolute;top:0;left:0;right:0;bottom:0;backdrop-filter:saturate(0.5) contrast(0.85);background:rgba(255,255,255,0.05);transition:opacity 0.6s ease;pointer-events:none}
.le-sim-washout.off{opacity:0}

/* Base glare when AR is OFF */
.le-sim-glare{position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,rgba(255,255,255,0.6) 0%,rgba(255,255,255,0) 30%,rgba(255,255,255,0) 70%,rgba(255,255,255,0.4) 100%);transition:opacity 0.6s ease;pointer-events:none}
.le-sim-glare.off{opacity:0}

/* Blue Light Filter ON */
.le-sim-blue{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255,235,210,0.12);backdrop-filter:sepia(15%) brightness(0.95);opacity:0;transition:opacity 0.6s ease;pointer-events:none}
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

/* Wizard Steps */
.le-wizard-header{display:flex;justify-content:space-between;margin-bottom:40px;position:relative}
.le-wizard-header::before{content:'';position:absolute;top:20px;left:40px;right:40px;height:2px;background:#E5E7EB;z-index:0}
@media(max-width:600px){.le-wizard-header::before{left:20px;right:20px}}
.le-step-indicator{position:relative;z-index:1;background:#FFFFFF;padding:0 10px;display:flex;flex-direction:column;align-items:center;gap:8px;color:#9CA3AF;font-weight:500;font-size:13px;flex:1}
.le-step-indicator.active{color:#111827}
.le-step-circle{width:40px;height:40px;border-radius:50%;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:16px;transition:all 0.3s;border:2px solid transparent;margin:0 auto}
.le-step-indicator.active .le-step-circle{background:#111827;color:#fff}
.le-step-indicator.completed .le-step-circle{background:#fff;border-color:#111827;color:#111827}
.le-step-label{text-align:center;line-height:1.2}
@media(max-width:600px){.le-step-label{font-size:11px}}

/* Step Content */
.le-step-content{animation:fadeIn 0.4s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

.le-nav-btns{display:flex;justify-content:flex-end;gap:16px;margin-top:40px;border-top:1px solid #F3F4F6;padding-top:24px}
.le-btn-back{padding:12px 24px;border:1px solid #E5E7EB;border-radius:50px;background:#fff;color:#4B5563;cursor:pointer;font-weight:500;transition:all 0.2s}
.le-btn-back:hover{background:#F9FAFB}
.le-btn-next{padding:12px 32px;border:none;border-radius:50px;background:#111827;color:#fff;cursor:pointer;font-weight:500;transition:all 0.2s}
.le-btn-next:hover{background:#1F2937;transform:translateY(-1px)}

/* Lifestyle */
.le-life-grid{display:flex;flex-direction:column;gap:16px;margin-bottom:40px}
.le-life-opt{display:flex;align-items:center;gap:16px;padding:20px;border:1px solid #E5E7EB;border-radius:16px;cursor:pointer;transition:all 0.2s}
.le-life-opt:hover{border-color:#111827;background:#F9FAFB}
.le-life-opt.active{border-color:#111827;background:#111827;color:#fff}
.le-life-opt.active .le-life-desc{color:#E5E7EB}
.le-life-title{font-size:16px;font-weight:500;margin-bottom:4px}
.le-life-desc{font-size:14px;color:#6B7280;transition:all 0.2s}

/* Summary */
.le-summary-card{background:#F9FAFB;border-radius:24px;padding:40px;border:1px solid rgba(0,0,0,0.04);margin-bottom:32px}
.le-summary-item{display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(0,0,0,0.05);align-items:center}
.le-summary-item:last-child{border:none}
.le-sum-lbl{font-weight:500;color:#4B5563;font-size:15px}
.le-sum-val{font-weight:500;color:#111827;font-size:16px;text-align:right}
.le-summary-total{font-size:28px;font-family:'Playfair Display',serif;font-weight:bold;color:#111827;text-align:center;margin-top:24px;padding-top:24px;border-top:2px dashed rgba(0,0,0,0.1)}
\n`;

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
  const [step, setStep] = useState(1);
  const [lensType, setLensType] = useState('mono');
  const [indexStep, setIndexStep] = useState(0);
  const [treatments, setTreatments] = useState<Record<string, boolean>>({ ar: true, blue: false, photo: false });

  const currentLens = LENS_TYPES.find(l => l.id === lensType)!;
  const currentIndex = INDEX_DATA[indexStep];

  const toggleTreat = (key: string) => setTreatments(prev => ({ ...prev, [key]: !prev[key] }));

  // Cost calculation
  let totalCost = 0;
  if (lensType === 'mono') totalCost += 990;
  if (lensType === 'bif') totalCost += 1490;
  if (lensType === 'prog') totalCost += 2490;
  
  if (indexStep === 1) totalCost += 400;
  if (indexStep === 2) totalCost += 800;
  if (indexStep === 3) totalCost += 1200;
  if (indexStep === 4) totalCost += 1800;
  
  if (treatments.ar) totalCost += 300;
  if (treatments.blue) totalCost += 400;
  if (treatments.photo) totalCost += 700;

  const nextStep = () => { window.scrollTo({ top: document.getElementById('micas-explicador')?.offsetTop! - 80, behavior: 'smooth' }); setStep(s => Math.min(4, s + 1)); };
  const prevStep = () => { window.scrollTo({ top: document.getElementById('micas-explicador')?.offsetTop! - 80, behavior: 'smooth' }); setStep(s => Math.max(1, s - 1)); };

  return (
    <section className="le-wrap" id="micas-explicador">
      <style>{css}</style>
      <div className="le-inner">
        <h2 className="le-title">Descubre tu lente ideal</h2>
        <p className="le-sub">Responde 3 simples preguntas y te recomendaremos la configuración perfecta para tus ojos, junto con un costo estimado.</p>

        <div className="le-wizard-header">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className={`le-step-indicator ${step === num ? 'active' : ''} ${step > num ? 'completed' : ''}`}>
              <div className="le-step-circle">
                {step > num ? '✓' : num}
              </div>
              <div className="le-step-label">
                {num === 1 && 'Visión'}
                {num === 2 && 'Graduación'}
                {num === 3 && 'Estilo de vida'}
                {num === 4 && 'Resultado'}
              </div>
            </div>
          ))}
        </div>

        <div className="le-mod">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" className="le-step-content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="le-mod-title">¿A qué distancia necesitas ayuda para ver bien?</h3>
                <div className="le-tabs">
                  {LENS_TYPES.map(lt => (
                    <button
                      key={lt.id}
                      className={`le-tab${lensType === lt.id ? ' active' : ''}`}
                      onClick={() => setLensType(lt.id)}
                    >
                      {lt.subtitle}
                    </button>
                  ))}
                </div>
                <div className="le-tab-body" style={{ background: '#F9FAFB', padding: '30px', borderRadius: '16px' }}>
                  <div className="le-diagram">
                    {lensType === 'mono' && <MonofocalSVG />}
                    {lensType === 'bif' && <BifocalSVG />}
                    {lensType === 'prog' && <ProgresiveSVG />}
                  </div>
                  <div className="le-info">
                    <h4>Mica recomendada: {currentLens.label}</h4>
                    <p>{currentLens.desc}</p>
                  </div>
                </div>
                <div className="le-nav-btns">
                  <button className="le-btn-next" onClick={nextStep}>Siguiente: Graduación →</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" className="le-step-content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="le-mod-title">¿Cómo es tu graduación actual?</h3>
                <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: '32px' }}>Selecciona el rango de tu receta (si no la sabes, elige Baja).</p>
                
                <div className="le-slider-row" style={{ alignItems: 'center' }}>
                  <div className="le-slider-right" style={{ flex: 1, width: '100%' }}>
                    <div className="le-life-grid" style={{ marginBottom: 0 }}>
                      <div className={`le-life-opt ${indexStep === 0 ? 'active' : ''}`} onClick={() => setIndexStep(0)}>
                        <div style={{ flex: 1 }}>
                          <div className="le-life-title">Baja (0 a ±2.00)</div>
                          <div className="le-life-desc">Material recomendado: Estándar</div>
                        </div>
                        <div style={{ fontSize: '24px' }}>{indexStep === 0 ? '✓' : '○'}</div>
                      </div>
                      <div className={`le-life-opt ${indexStep === 2 ? 'active' : ''}`} onClick={() => setIndexStep(2)}>
                        <div style={{ flex: 1 }}>
                          <div className="le-life-title">Media (±2.25 a ±4.00)</div>
                          <div className="le-life-desc">Material recomendado: Delgado y Ligero</div>
                        </div>
                        <div style={{ fontSize: '24px' }}>{indexStep === 2 ? '✓' : '○'}</div>
                      </div>
                      <div className={`le-life-opt ${indexStep === 4 ? 'active' : ''}`} onClick={() => setIndexStep(4)}>
                        <div style={{ flex: 1 }}>
                          <div className="le-life-title">Alta (Más de ±4.00)</div>
                          <div className="le-life-desc">Material recomendado: Ultra Delgado (Máxima estética)</div>
                        </div>
                        <div style={{ fontSize: '24px' }}>{indexStep === 4 ? '✓' : '○'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="le-slider-left" style={{ background: '#F9FAFB', padding: '32px 16px', borderRadius: '24px', flex: '0 0 200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontWeight: '500' }}>Perfil de Mica</div>
                    <LensCrossSectionSVG borderThickness={currentIndex.border} />
                    <div className="le-idx-big" style={{ marginTop: '16px' }}>{currentIndex.idx}</div>
                    <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '8px', textAlign: 'center', fontWeight: '500' }}>{currentIndex.thickness}</div>
                  </div>
                </div>
                
                <div className="le-nav-btns">
                  <button className="le-btn-back" onClick={prevStep}>← Atrás</button>
                  <button className="le-btn-next" onClick={nextStep}>Siguiente: Estilo de vida →</button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" className="le-step-content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="le-mod-title">Selecciona lo que describa mejor tu día a día</h3>
                
                <div className="le-life-grid">
                  <div className={`le-life-opt ${treatments.ar ? 'active' : ''}`} onClick={() => toggleTreat('ar')}>
                    <div style={{ flex: 1 }}>
                      <div className="le-life-title">Manejo de noche o me deslumbran las luces</div>
                      <div className="le-life-desc">Sugerimos: Antirreflejante (Mejora nitidez y elimina reflejos)</div>
                    </div>
                    <div style={{ fontSize: '24px' }}>{treatments.ar ? '✓' : '○'}</div>
                  </div>
                  
                  <div className={`le-life-opt ${treatments.blue ? 'active' : ''}`} onClick={() => toggleTreat('blue')}>
                    <div style={{ flex: 1 }}>
                      <div className="le-life-title">Paso más de 4 horas al día frente a pantallas</div>
                      <div className="le-life-desc">Sugerimos: Filtro Luz Azul (Reduce cansancio visual)</div>
                    </div>
                    <div style={{ fontSize: '24px' }}>{treatments.blue ? '✓' : '○'}</div>
                  </div>

                  <div className={`le-life-opt ${treatments.photo ? 'active' : ''}`} onClick={() => toggleTreat('photo')}>
                    <div style={{ flex: 1 }}>
                      <div className="le-life-title">Paso mucho tiempo al aire libre y me molesta el sol</div>
                      <div className="le-life-desc">Sugerimos: Fotocromático (Se oscurece con el sol)</div>
                    </div>
                    <div style={{ fontSize: '24px' }}>{treatments.photo ? '✓' : '○'}</div>
                  </div>
                </div>

                <div style={{ marginTop: '40px', marginBottom: '24px', textAlign: 'center' }}>
                  <h4 style={{ fontFamily: 'Playfair Display', fontSize: '20px', marginBottom: '8px' }}>Simulador en tiempo real</h4>
                  <p style={{ color: '#6B7280', fontSize: '14px' }}>Así se verá el mundo a través de tus micas.</p>
                </div>
                
                {/* ── Simulator Window ── */}
                <div className="le-sim-wrap" style={{ borderRadius: '16px', margin: '0 auto', maxWidth: '100%', height: '320px' }}>
                  <div className="le-sim-bg" />
                  <div className="le-sim-center" style={{ gap: '20px' }}>
                    <div className="le-sim-lens" style={{ width: '220px', height: '160px', borderRadius: '40% 40% 50% 50% / 30% 30% 55% 55%', borderWidth: '3px' }}>
                      <div className={`le-sim-washout ${treatments.ar ? 'off' : ''}`} />
                      <div className={`le-sim-glare ${treatments.ar ? 'off' : ''}`} />
                      <div className={`le-sim-blue ${treatments.blue ? 'on' : ''}`} />
                      <div className={`le-sim-photo ${treatments.photo ? 'on' : ''}`} />
                    </div>
                    <div className="le-sim-bridge" style={{ width: '20px' }} />
                    <div className="le-sim-lens" style={{ width: '220px', height: '160px', borderRadius: '40% 40% 50% 50% / 30% 30% 55% 55%', borderWidth: '3px' }}>
                      <div className={`le-sim-washout ${treatments.ar ? 'off' : ''}`} />
                      <div className={`le-sim-glare ${treatments.ar ? 'off' : ''}`} />
                      <div className={`le-sim-blue ${treatments.blue ? 'on' : ''}`} />
                      <div className={`le-sim-photo ${treatments.photo ? 'on' : ''}`} />
                    </div>
                  </div>
                </div>

                <div className="le-nav-btns">
                  <button className="le-btn-back" onClick={prevStep}>← Atrás</button>
                  <button className="le-btn-next" onClick={nextStep}>Ver mi resultado y costo →</button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" className="le-step-content" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <div className="le-summary-card">
                  <h3 className="le-mod-title">Tu configuración ideal</h3>
                  
                  <div className="le-summary-item">
                    <span className="le-sum-lbl">Visión recomendada</span>
                    <span className="le-sum-val">{currentLens.label}</span>
                  </div>
                  
                  <div className="le-summary-item">
                    <span className="le-sum-lbl">Material sugerido</span>
                    <span className="le-sum-val">{currentIndex.thickness} (Índice {currentIndex.idx})</span>
                  </div>

                  <div className="le-summary-item" style={{ alignItems: 'flex-start' }}>
                    <span className="le-sum-lbl">Tratamientos</span>
                    <span className="le-sum-val" style={{ textAlign: 'right' }}>
                      {treatments.ar && <div>✓ Antirreflejante</div>}
                      {treatments.blue && <div>✓ Filtro Luz Azul</div>}
                      {treatments.photo && <div>✓ Fotocromático</div>}
                      {!treatments.ar && !treatments.blue && !treatments.photo && 'Ninguno'}
                    </span>
                  </div>

                  <div className="le-summary-total">
                    Costo estimado: ${totalCost.toLocaleString()} MXN
                    <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 'normal', fontFamily: 'Inter, sans-serif', marginTop: '12px', lineHeight: '1.5' }}>
                      *Precio base de micas sugerido. El precio final puede variar según promociones vigentes, el armazón elegido y la graduación exacta.
                    </div>
                  </div>
                </div>

                <div className="le-cta-wrap" style={{ marginTop: '0' }}>
                  <button className="le-cta" onClick={() => {
                    const text = `Hola, usé el asistente web y me sugirió:\n\n- Visión: ${currentLens.label}\n- Material: ${currentIndex.thickness}\n- Tratamientos: ${treatments.ar?'Antirreflejante':''} ${treatments.blue?', Luz Azul':''} ${treatments.photo?', Fotocromático':''}\n\nMe gustaría confirmar la cotización con mi graduación exacta.`;
                    window.open(`https://wa.me/5213329244036?text=${encodeURIComponent(text)}`, '_blank');
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Enviar por WhatsApp
                  </button>
                  <div style={{ marginTop: '24px' }}>
                    <button className="le-btn-back" onClick={() => setStep(1)} style={{ border: 'none', background: 'transparent', textDecoration: 'underline', padding: 0 }}>Volver a empezar</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
