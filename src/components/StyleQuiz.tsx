import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { getInventedName } from '../lib/format';

interface StyleQuizProps {
  catalogData: any[];
  onClose: () => void;
  onViewProduct: (product: any) => void;
  onBookAppointment: (message: string) => void;
}

/* ─── Step Icons ─── */
const FACE_ICONS: Record<string, JSX.Element> = {
  oval: <svg width="46" height="56" viewBox="0 0 42 52" fill="none" stroke="currentColor" strokeWidth="2.2"><ellipse cx="21" cy="26" rx="14" ry="20"/></svg>,
  round: <svg width="46" height="56" viewBox="0 0 42 52" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="21" cy="26" r="18"/></svg>,
  square: <svg width="46" height="56" viewBox="0 0 42 52" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="5" y="9" width="32" height="34" rx="7"/></svg>,
  heart: <svg width="46" height="56" viewBox="0 0 42 52" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M5 12 Q21 6 37 12 Q33 34 21 46 Q9 34 5 12 Z"/></svg>,
  diamond: <svg width="46" height="56" viewBox="0 0 42 52" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"><path d="M21 5 L37 26 L21 47 L5 26 Z"/></svg>,
  unknown: <svg width="46" height="56" viewBox="0 0 42 52" fill="none" stroke="currentColor" strokeWidth="2.2" strokeDasharray="3 3"><ellipse cx="21" cy="26" rx="15" ry="20"/></svg>,
};

const USAGE_ICONS: Record<string, JSX.Element> = {
  daily: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  screens: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  reading: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  sun: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
};

const STYLE_ICONS: Record<string, JSX.Element> = {
  classic: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
  modern: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>,
  bold: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  minimal: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
};

const TONE_COLORS: Record<string, string> = {
  dark: '#1a1a1a',
  light: '#d4cfc8',
  metal: '#b8a88a',
  color: '#c0392b',
};

/* ─── Quiz Data (unchanged logic) ─── */
const QUIZ_STEPS = [
  {
    id: 'faceShape',
    question: '¿Cuál es la forma de tu rostro?',
    options: [
      { id: 'oval', label: 'Ovalado', desc: 'Equilibrado y versátil' },
      { id: 'round', label: 'Redondo', desc: 'Curvas suaves' },
      { id: 'square', label: 'Cuadrado', desc: 'Mandíbula definida' },
      { id: 'heart', label: 'Corazón', desc: 'Frente ancha, mentón fino' },
      { id: 'diamond', label: 'Diamante', desc: 'Pómulos marcados' },
      { id: 'unknown', label: 'No estoy seguro', desc: 'Me gustan todos' }
    ]
  },
  {
    id: 'usage',
    question: '¿Para qué usarás más tus lentes?',
    options: [
      { id: 'daily', label: 'Uso diario', desc: 'Todo el día, todos los días' },
      { id: 'screens', label: 'Computadora / Celular', desc: 'Protección de luz azul' },
      { id: 'reading', label: 'Lectura', desc: 'Para ver de cerca' },
      { id: 'sun', label: 'Lentes de Sol', desc: 'Protección exterior' }
    ]
  },
  {
    id: 'style',
    question: '¿Cómo describirías tu estilo?',
    options: [
      { id: 'classic', label: 'Clásico', desc: 'Elegante y atemporal' },
      { id: 'modern', label: 'Moderno', desc: 'Limpio y actual' },
      { id: 'bold', label: 'Atrevido / Statement', desc: 'Quiero destacar' },
      { id: 'minimal', label: 'Minimalista', desc: 'Sutil y ligero' }
    ]
  },
  {
    id: 'tone',
    question: '¿Qué tonos prefieres en tus armazones?',
    options: [
      { id: 'dark', label: 'Oscuros', desc: 'Negro, carey oscuro, azul marino' },
      { id: 'light', label: 'Claros / Transparentes', desc: 'Cristal, nude, grises claros' },
      { id: 'metal', label: 'Metálicos', desc: 'Dorado, plateado, rose gold' },
      { id: 'color', label: 'Coloridos', desc: 'Rojo, verde, azul brillante' }
    ]
  }
];

const PRODUCT_METADATA_MAP: Record<string, { shape?: string, tone?: string, style?: string }> = {
  "Fiona": { shape: 'round', tone: 'dark', style: 'classic' },
  "Micah": { shape: 'square', tone: 'metal', style: 'minimal' },
  "June": { shape: 'round', tone: 'metal', style: 'classic' },
  "Hazel": { shape: 'square', tone: 'dark', style: 'bold' }
};

/* ─── Helper: get icon for a step+option ─── */
function getOptionIcon(stepId: string, optionId: string): JSX.Element | null {
  if (stepId === 'faceShape') return FACE_ICONS[optionId] || null;
  if (stepId === 'usage') return USAGE_ICONS[optionId] || null;
  if (stepId === 'style') return STYLE_ICONS[optionId] || null;
  if (stepId === 'tone') {
    const c = TONE_COLORS[optionId] || '#999';
    return (
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="12" fill={c} opacity="0.85"/>
        <circle cx="14" cy="14" r="12" fill="none" stroke={c} strokeWidth="1" opacity="0.4"/>
      </svg>
    );
  }
  return null;
}

/* ─── Inline CSS ─── */
const quizCSS = `
  .sq-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:#f7f5f0;z-index:9999;overflow-y:auto;font-family:'Inter','Helvetica Neue',sans-serif}
  .sq-header{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;background:rgba(247,245,240,.92);backdrop-filter:blur(8px);border-bottom:1px solid rgba(0,0,0,.06);position:sticky;top:0;z-index:10}
  .sq-close{background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;font-weight:500;color:#5f5e5a;font-size:14px;padding:6px 10px;border-radius:8px;transition:background .15s}
  .sq-close:hover{background:rgba(0,0,0,.05)}
  .sq-progress-wrap{flex:1;margin:0 24px;display:flex;flex-direction:column;align-items:center;gap:6px}
  .sq-step-label{font-size:12px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#9a958c}
  .sq-progress-bar{width:100%;max-width:300px;height:4px;background:rgba(0,0,0,.06);border-radius:4px;overflow:hidden}
  .sq-progress-fill{height:100%;background:#1e2a5a;border-radius:4px;transition:width .4s ease}
  .sq-content{padding:48px 24px 80px;max-width:880px;margin:0 auto;min-height:calc(100vh - 64px);display:flex;flex-direction:column;justify-content:center}
  .sq-question{font-size:40px;color:#1b2436;margin:0 0 48px;font-family:'Playfair Display',Georgia,serif;text-align:center;font-weight:500;line-height:1.2}
  .sq-options{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  @media(max-width:640px){.sq-options{grid-template-columns:1fr; gap: 16px;} .sq-question{font-size:32px;margin:0 0 32px;}}
  .sq-opt{display:flex;align-items:center;gap:20px;background:#fff;border:2px solid transparent;border-radius:16px;padding:24px 20px;cursor:pointer;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease,background .2s ease;text-align:left;outline:none;font-family:inherit;box-shadow:0 2px 8px rgba(0,0,0,.04)}
  .sq-opt:hover{transform:translateY(-3px);border-color:rgba(0,0,0,.15);box-shadow:0 8px 24px rgba(0,0,0,.08)}
  .sq-opt.selected{border-color:#1e2a5a;background:#f5f6fb;}
  .sq-opt-ico{color:#5f5e5a;flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:60px;height:60px;background:#f7f5f0;border-radius:50%}
  .sq-opt-text{display:flex;flex-direction:column}
  .sq-opt-lbl{font-size:18px;font-weight:600;color:#1b2436;line-height:1.3}
  .sq-opt-desc{font-size:14px;color:#64748b;margin-top:4px;line-height:1.4}
  .sq-opt-check{margin-left:auto;color:#1e2a5a;flex:0 0 auto}
  .sq-spinner{width:48px;height:48px;border:4px solid rgba(0,0,0,.08);border-top-color:#1e2a5a;border-radius:50%;animation:sq-spin .8s linear infinite;margin:0 auto 32px}
  @keyframes sq-spin{to{transform:rotate(360deg)}}
  .sq-results-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:24px;margin-bottom:48px}
  .sq-cta-box{background:#fff;padding:36px;border-radius:16px;text-align:center;border:1px solid rgba(0,0,0,.06);box-shadow:0 4px 12px rgba(0,0,0,.03)}
  .sq-cta-btn{width:100%;padding:18px;border:none;border-radius:50px;font-size:16px;font-weight:600;cursor:pointer;transition:transform .15s,opacity .15s}
  .sq-cta-btn:hover{transform:translateY(-2px)}
  .sq-cta-btn.primary{background:#1e7d34;color:#fff}
  .sq-cta-btn.ghost{background:transparent;color:#1e2a5a;text-decoration:underline;margin-top:12px}
`;

export const StyleQuiz: React.FC<StyleQuizProps> = ({ catalogData, onClose, onViewProduct, onBookAppointment }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSelectOption = (stepId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [stepId]: optionId }));
    
    if (currentStepIndex < QUIZ_STEPS.length - 1) {
      setTimeout(() => setCurrentStepIndex(currentStepIndex + 1), 300);
    } else {
      calculateResults({ ...answers, [stepId]: optionId });
    }
  };

  const calculateResults = (finalAnswers: Record<string, string>) => {
    setIsCalculating(true);
    
    setTimeout(() => {
      const framesOnly = catalogData.filter(p => {
        const isOptic = !String(p.category || 'vista').toLowerCase().includes('contacto');
        const url = (p.images && p.images.length > 0) ? p.images[0].image_url : p.image_url;
        const fallback = p.image;
        const isValid = (val: any) => val && val !== 'undefined' && val !== 'null' && val.trim() !== '';
        return isOptic && (isValid(url) || isValid(fallback));
      });

      const scoredProducts = framesOnly.map(product => {
        let score = 0;
        const searchString = `${product.name} ${product.brand} ${product.category} ${product.description || ''}`.toLowerCase();
        const meta = PRODUCT_METADATA_MAP[product.name] || {};

        if (finalAnswers.faceShape === 'round' && (meta.shape === 'square' || searchString.includes('cuadrad') || searchString.includes('rectangul'))) score += 4;
        if (finalAnswers.faceShape === 'square' && (meta.shape === 'round' || searchString.includes('redond') || searchString.includes('panto') || searchString.includes('oval'))) score += 4;
        if (meta.shape === finalAnswers.faceShape) score += 2;

        if (finalAnswers.usage === 'sun' && searchString.includes('sol')) score += 5;
        if (finalAnswers.usage !== 'sun' && searchString.includes('sol')) score -= 5;

        if (finalAnswers.tone === meta.tone) score += 4;
        if (finalAnswers.tone === 'dark' && (searchString.includes('negro') || searchString.includes('carey') || searchString.includes('havana') || searchString.includes('black') || searchString.includes('oscuro'))) score += 3;
        if (finalAnswers.tone === 'light' && (searchString.includes('transparente') || searchString.includes('cristal') || searchString.includes('clear') || searchString.includes('gris') || searchString.includes('nude'))) score += 3;
        if (finalAnswers.tone === 'metal' && (searchString.includes('metal') || searchString.includes('dorado') || searchString.includes('oro') || searchString.includes('plata') || searchString.includes('gold') || searchString.includes('silver'))) score += 3;
        if (finalAnswers.tone === 'color' && (searchString.includes('rojo') || searchString.includes('azul') || searchString.includes('verde') || searchString.includes('rosa') || searchString.includes('pink') || searchString.includes('blue') || searchString.includes('red'))) score += 3;

        if (finalAnswers.style === meta.style) score += 4;
        if (finalAnswers.style === 'classic' && (searchString.includes('cuadrado') || searchString.includes('rectangular') || searchString.includes('clásico'))) score += 2;
        if (finalAnswers.style === 'bold' && (searchString.includes('grueso') || searchString.includes('acetato') || searchString.includes('oversize') || searchString.includes('grande'))) score += 2;
        if (finalAnswers.style === 'minimal' && (searchString.includes('metal') || searchString.includes('delgado') || searchString.includes('fino') || searchString.includes('ligero') || searchString.includes('al aire') || searchString.includes('ranurado'))) score += 2;

        score += Math.random() * 0.5;
        return { ...product, quizScore: score };
      });

      const topResults = scoredProducts.sort((a, b) => b.quizScore - a.quizScore).slice(0, 3);
      setResults(topResults);
      setIsCalculating(false);
    }, 1500);
  };

  const progressPercentage = ((currentStepIndex) / QUIZ_STEPS.length) * 100;

  return (
    <div className="sq-overlay">
      <style>{quizCSS}</style>

      {/* ── Header ── */}
      <div className="sq-header">
        <button className="sq-close" onClick={onClose}>
          <X size={18} /> Cancelar
        </button>
        <div className="sq-progress-wrap">
          <span className="sq-step-label">
            {results.length > 0 ? '¡Listo!' : `Paso ${currentStepIndex + 1} de ${QUIZ_STEPS.length}`}
          </span>
          <div className="sq-progress-bar">
            <div className="sq-progress-fill" style={{ width: `${results.length > 0 ? 100 : progressPercentage}%` }} />
          </div>
        </div>
        <div style={{ width: '80px' }} /> {/* spacer for centering */}
      </div>

      {/* ── Content ── */}
      <div className="sq-content">
        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            /* ── Results ── */
            <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <Sparkles size={36} color="#1e2a5a" style={{ margin: '0 auto 16px' }} />
                <h2 className="sq-question">Tus matches perfectos</h2>
                <p style={{ color: '#8a857b', fontSize: '15px', margin: 0 }}>Analizamos tu perfil y estos armazones están hechos para ti.</p>
              </div>

              <div className="sq-results-grid">
                {results.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onClick={() => onViewProduct(product)}
                    style={{ width: '100%', minWidth: 'unset', border: '1px solid rgba(0,0,0,.08)', padding: '12px', borderRadius: '14px' }}
                  />
                ))}
              </div>

              <div className="sq-cta-box">
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#1b2436', marginBottom: '8px', marginTop: 0 }}>¿Te gustaron tus recomendaciones?</h3>
                <p style={{ fontSize: '13.5px', color: '#8a857b', marginBottom: '20px' }}>Agenda una cita para venir a probártelos a la óptica sin compromiso.</p>
                <button 
                  className="sq-cta-btn primary"
                  onClick={() => {
                    const modelNames = results.map(r => getInventedName(r.name, r.category)).join(', ');
                    onBookAppointment(`Hola, hice el Quiz de Estilo y me interesan probarme estos modelos: ${modelNames}. ¿Tienen citas disponibles?`);
                  }}
                >
                  Agendar cita por WhatsApp
                </button>
                <button 
                  className="sq-cta-btn ghost"
                  onClick={() => { setResults([]); setCurrentStepIndex(0); setAnswers({}); }}
                >
                  Volver a intentar
                </button>
              </div>
            </motion.div>

          ) : isCalculating ? (
            /* ── Calculating ── */
            <motion.div key="calculating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="sq-spinner" />
              <h3 style={{ fontSize: '20px', color: '#1b2436', fontFamily: "'Playfair Display', Georgia, serif", margin: '0 0 8px' }}>Analizando tu estilo...</h3>
              <p style={{ color: '#8a857b', margin: 0 }}>Buscando los armazones perfectos en nuestro catálogo.</p>
            </motion.div>

          ) : (
            /* ── Quiz Step ── */
            <motion.div 
              key={currentStepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="sq-question">
                {QUIZ_STEPS[currentStepIndex].question}
              </h2>
              <div className="sq-options">
                {QUIZ_STEPS[currentStepIndex].options.map(option => {
                  const isSelected = answers[QUIZ_STEPS[currentStepIndex].id] === option.id;
                  const icon = getOptionIcon(QUIZ_STEPS[currentStepIndex].id, option.id);
                  return (
                    <button
                      key={option.id}
                      className={`sq-opt${isSelected ? ' selected' : ''}`}
                      onClick={() => handleSelectOption(QUIZ_STEPS[currentStepIndex].id, option.id)}
                    >
                      {icon && <div className="sq-opt-ico">{icon}</div>}
                      <div className="sq-opt-text">
                        <div className="sq-opt-lbl">{option.label}</div>
                        <div className="sq-opt-desc">{option.desc}</div>
                      </div>
                      {isSelected && <div className="sq-opt-check"><Check size={18} /></div>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
