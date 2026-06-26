import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, Sparkles, Check } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { getInventedName } from '../lib/format';

interface StyleQuizProps {
  catalogData: any[];
  onClose: () => void;
  onViewProduct: (product: any) => void;
  onBookAppointment: (message: string) => void;
}

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

// Diccionario de metadatos manuales.
// Como el backend (POS) no devuelve la forma o estilo exacto del armazón, 
// puedes agregar aquí los nombres de tus modelos para asignarles atributos manualmente
// y que el algoritmo del Quiz sea mucho más exacto.
const PRODUCT_METADATA_MAP: Record<string, { shape?: string, tone?: string, style?: string }> = {
  "Fiona": { shape: 'round', tone: 'dark', style: 'classic' },
  "Micah": { shape: 'square', tone: 'metal', style: 'minimal' },
  "June": { shape: 'round', tone: 'metal', style: 'classic' },
  "Hazel": { shape: 'square', tone: 'dark', style: 'bold' }
};

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
      // Filtrar los lentes de contacto, solo queremos armazones de vista o de sol
      const framesOnly = catalogData.filter(p => !String(p.category || 'vista').toLowerCase().includes('contacto'));

      // Basic scoring algorithm based on keywords and manual metadata
      const scoredProducts = framesOnly.map(product => {
        let score = 0;
        const searchString = `${product.name} ${product.brand} ${product.category} ${product.description || ''}`.toLowerCase();
        
        // Intentar leer la metadata manual si existe
        const meta = PRODUCT_METADATA_MAP[product.name] || {};

        // Face Shape (regla general: rostros redondos -> lentes cuadrados, etc.)
        if (finalAnswers.faceShape === 'round' && (meta.shape === 'square' || searchString.includes('cuadrad') || searchString.includes('rectangul'))) score += 4;
        if (finalAnswers.faceShape === 'square' && (meta.shape === 'round' || searchString.includes('redond') || searchString.includes('panto') || searchString.includes('oval'))) score += 4;
        if (meta.shape === finalAnswers.faceShape) score += 2; // Si coinciden directamente (ej. buscan redondo y es redondo)

        // Sun usage
        if (finalAnswers.usage === 'sun' && searchString.includes('sol')) score += 5;
        if (finalAnswers.usage !== 'sun' && searchString.includes('sol')) score -= 5;

        // Tone
        if (finalAnswers.tone === meta.tone) score += 4;
        if (finalAnswers.tone === 'dark' && (searchString.includes('negro') || searchString.includes('carey') || searchString.includes('havana') || searchString.includes('black') || searchString.includes('oscuro'))) score += 3;
        if (finalAnswers.tone === 'light' && (searchString.includes('transparente') || searchString.includes('cristal') || searchString.includes('clear') || searchString.includes('gris') || searchString.includes('nude'))) score += 3;
        if (finalAnswers.tone === 'metal' && (searchString.includes('metal') || searchString.includes('dorado') || searchString.includes('oro') || searchString.includes('plata') || searchString.includes('gold') || searchString.includes('silver'))) score += 3;
        if (finalAnswers.tone === 'color' && (searchString.includes('rojo') || searchString.includes('azul') || searchString.includes('verde') || searchString.includes('rosa') || searchString.includes('pink') || searchString.includes('blue') || searchString.includes('red'))) score += 3;

        // Style
        if (finalAnswers.style === meta.style) score += 4;
        if (finalAnswers.style === 'classic' && (searchString.includes('cuadrado') || searchString.includes('rectangular') || searchString.includes('clásico'))) score += 2;
        if (finalAnswers.style === 'bold' && (searchString.includes('grueso') || searchString.includes('acetato') || searchString.includes('oversize') || searchString.includes('grande'))) score += 2;
        if (finalAnswers.style === 'minimal' && (searchString.includes('metal') || searchString.includes('delgado') || searchString.includes('fino') || searchString.includes('ligero') || searchString.includes('al aire') || searchString.includes('ranurado'))) score += 2;

        // Random jitter to keep recommendations fresh when tags are missing
        score += Math.random() * 0.5;

        return { ...product, quizScore: score };
      });

      // Sort by score and take top 4
      const topResults = scoredProducts.sort((a, b) => b.quizScore - a.quizScore).slice(0, 4);
      setResults(topResults);
      setIsCalculating(false);
    }, 1500); // Fake processing time for UX
  };

  const progressPercentage = ((currentStepIndex) / QUIZ_STEPS.length) * 100;

  return (
    <div className="style-quiz-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#fff', zIndex: 9999, overflowY: 'auto' }}>
      <div className="style-quiz-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#1F3864' }}>
          <X size={20} /> Cancelar
        </button>
        <div style={{ flex: 1, margin: '0 20px', backgroundColor: '#e2e8f0', height: '4px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${results.length > 0 ? 100 : progressPercentage}%`, height: '100%', backgroundColor: '#1F3864', transition: 'width 0.3s ease' }}></div>
        </div>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
          {results.length > 0 ? '¡Listo!' : `Paso ${currentStepIndex + 1}/${QUIZ_STEPS.length}`}
        </span>
      </div>

      <div className="style-quiz-content" style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="quiz-results">
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <Sparkles size={40} color="#1F3864" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: '28px', color: '#1F3864', marginBottom: '12px', fontFamily: 'Georgia, serif' }}>Tus matches perfectos</h2>
                <p style={{ color: '#475569', fontSize: '16px' }}>Analizamos tu perfil y estos armazones están hechos para ti.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {results.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onClick={() => onViewProduct(product)}
                    style={{ width: '100%', minWidth: 'unset', border: '1px solid #e2e8f0', padding: '12px' }}
                  />
                ))}
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1F3864', marginBottom: '12px' }}>¿Te gustaron tus recomendaciones?</h3>
                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>Agenda una cita para venir a probártelos a la óptica sin compromiso.</p>
                <button 
                  onClick={() => {
                    const modelNames = results.map(r => getInventedName(r.name, r.category)).join(', ');
                    onBookAppointment(`Hola, hice el Quiz de Estilo y me interesan probarme estos modelos: ${modelNames}. ¿Tienen citas disponibles?`);
                  }}
                  style={{ width: '100%', padding: '16px', backgroundColor: '#1e7d34', color: '#fff', border: 'none', borderRadius: '30px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Agendar cita por WhatsApp
                </button>
                <button 
                  onClick={() => {
                    setResults([]);
                    setCurrentStepIndex(0);
                    setAnswers({});
                  }}
                  style={{ width: '100%', padding: '16px', backgroundColor: 'transparent', color: '#1F3864', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}
                >
                  Volver a intentar
                </button>
              </div>
            </motion.div>
          ) : isCalculating ? (
            <motion.div key="calculating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 0' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#1F3864', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <h3 style={{ fontSize: '20px', color: '#1F3864', fontFamily: 'Georgia, serif' }}>Analizando tu estilo...</h3>
              <p style={{ color: '#64748b', marginTop: '8px' }}>Buscando los armazones perfectos en nuestro catálogo.</p>
            </motion.div>
          ) : (
            <motion.div key={currentStepIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 style={{ fontSize: '28px', color: '#1F3864', marginBottom: '32px', fontFamily: 'Georgia, serif', textAlign: 'center' }}>
                {QUIZ_STEPS[currentStepIndex].question}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {QUIZ_STEPS[currentStepIndex].options.map(option => {
                  const isSelected = answers[QUIZ_STEPS[currentStepIndex].id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(QUIZ_STEPS[currentStepIndex].id, option.id)}
                      style={{
                        padding: '20px',
                        backgroundColor: isSelected ? '#f1f5f9' : '#fff',
                        border: `2px solid ${isSelected ? '#1F3864' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '16px', color: '#1e293b', marginBottom: '4px' }}>{option.label}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{option.desc}</div>
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '20px', right: '20px', color: '#1F3864' }}>
                          <Check size={20} />
                        </div>
                      )}
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
