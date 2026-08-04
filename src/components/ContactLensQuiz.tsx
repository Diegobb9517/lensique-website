import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { getContactLensUsage } from '../lib/format';
import { WPSelect } from './WPSelect';
import { RxGuide } from './RxGuide';
import './ContactLensQuiz.css';
import eyeExamImg from '../assets/eye_exam_1.jpg'; // We can use the existing exam image

interface ContactLensQuizProps {
  catalogData: any[];
  onClose: () => void;
  onViewProduct: (product: any) => void;
  onBookAppointment: (message: string) => void;
}

export function ContactLensQuiz({ catalogData, onClose, onViewProduct, onBookAppointment }: ContactLensQuizProps) {
  const [step, setStep] = useState(1);
  const [knowsPrescription, setKnowsPrescription] = useState<boolean | null>(null);
  
  // Prescription state
  const [prescriptionOD, setPrescriptionOD] = useState({ sph: '', cyl: '', axis: '', add: '' });
  const [prescriptionOS, setPrescriptionOS] = useState({ sph: '', cyl: '', axis: '', add: '' });
  const [samePrescription, setSamePrescription] = useState(true);
  const [showRxGuide, setShowRxGuide] = useState(false);

  // Usage state
  const [usage, setUsage] = useState<string>(''); // 'Diario' or 'Mensual'

  // Helper arrays for selects
  const getSpmOptions = () => {
    const opts = [];
    for (let i = -12; i <= -6.5; i += 0.5) opts.push(i.toFixed(2));
    for (let i = -6; i <= 6; i += 0.25) opts.push(i > 0 ? `+${i.toFixed(2)}` : i.toFixed(2));
    for (let i = 6.5; i <= 8; i += 0.5) opts.push(`+${i.toFixed(2)}`);
    return opts;
  };

  const getCylOptions = () => {
    const opts = [];
    for (let i = -0.75; i >= -2.75; i -= 0.5) opts.push(i.toFixed(2));
    return opts;
  };

  const getAxisOptions = () => {
    const opts = [];
    for (let i = 10; i <= 180; i += 10) opts.push(i.toString());
    return opts;
  };

  const getAddOptions = () => ['LOW', 'MED', 'HIGH'];

  // Validation
  const isPrescriptionComplete = () => {
    const checkEye = (eye: any) => eye.sph !== '';
    if (samePrescription) return checkEye(prescriptionOD);
    return checkEye(prescriptionOD) && checkEye(prescriptionOS);
  };

  const isToric = () => {
    return (prescriptionOD.cyl !== '' && prescriptionOD.axis !== '') || 
           (prescriptionOS.cyl !== '' && prescriptionOS.axis !== '');
  };

  const isMultifocal = () => {
    return prescriptionOD.add !== '' || prescriptionOS.add !== '';
  };

  const handleNext = () => {
    if (step === 1) {
      if (knowsPrescription) {
        setStep(2); // Rx Input
      } else {
        setStep(5); // Eye Exam CTA
      }
    } else if (step === 2) {
      setStep(3); // Usage
    } else if (step === 3) {
      setStep(4); // Results
    }
  };

  const handleBack = () => {
    if (step === 2 || step === 5) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
  };

  // Get recommendations
  const getRecommendations = () => {
    let contacts = catalogData.filter(p => (p.category || 'vista').toLowerCase().includes('contacto'));
    
    // Filter by Toric / Multifocal / Esferico
    const toric = isToric();
    const multi = isMultifocal();

    contacts = contacts.filter(p => {
      const name = (p.name || '').toLowerCase();
      if (multi) return name.includes('multifocal') || name.includes('presbicia');
      if (toric) return name.includes('astigmatism') || name.includes('toric');
      // If spherical, exclude toric and multifocal
      return !name.includes('astigmatism') && !name.includes('toric') && !name.includes('multifocal');
    });

    // Filter by usage (if selected and applicable)
    if (usage === 'Diario') {
      contacts = contacts.filter(p => getContactLensUsage(p.name) === 'Diario' || getContactLensUsage(p.name) === 'Todos');
    } else if (usage === 'Mensual') {
      contacts = contacts.filter(p => getContactLensUsage(p.name) === 'Mensual' || getContactLensUsage(p.name) === 'Todos');
    }

    return contacts.slice(0, 3); // Return top 3
  };

  const renderPrescriptionCol = (eye: 'OD' | 'OS', label: string) => {
    const values = eye === 'OD' ? prescriptionOD : prescriptionOS;
    const setValues = eye === 'OD' ? setPrescriptionOD : setPrescriptionOS;

    // Use WPSelect and the modern configurator layout, conditionally 1 or 2 columns
    return (
      <div className="cl-prescription-column">
        <h4>{label}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: samePrescription ? '1fr 1fr' : '1fr', gap: '0 16px' }}>
          <WPSelect 
            label="Esfera (SPH/PWR)"
            value={values.sph}
            options={getSpmOptions()}
            onChange={(val: string) => setValues({ ...values, sph: val })}
            zeroValue="0.00"
          />

          <WPSelect 
            label="Cilindro (CYL) - Astigmatismo"
            value={values.cyl}
            options={getCylOptions()}
            onChange={(val: string) => setValues({ ...values, cyl: val })}
          />

          <WPSelect 
            label="Eje (Axis)"
            value={values.axis}
            options={getAxisOptions()}
            onChange={(val: string) => setValues({ ...values, axis: val })}
          />

          <WPSelect 
            label="Adición (ADD) - Multifocal"
            value={values.add}
            options={getAddOptions()}
            onChange={(val: string) => setValues({ ...values, add: val })}
          />
          
          <div className="cl-wp-input-wrapper is-readonly">
            <label>Curva Base (BC)</label>
            <input type="text" value="8.6" readOnly />
          </div>

          <div className="cl-wp-input-wrapper is-readonly">
            <label>Diámetro (DIA)</label>
            <input type="text" value="14.5" readOnly />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="clq-overlay">
      <motion.div 
        className="clq-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <button className="clq-close" onClick={onClose}><X size={24} /></button>
        
        <div className="clq-header">
          <h2>Encuentra tu lente ideal</h2>
          <p>Te ayudamos a elegir el lente de contacto perfecto para tus ojos.</p>
        </div>

        <div className="clq-body">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Know Prescription? */}
            {step === 1 && (
              <motion.div key="step1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h3 className="clq-step-title">¿Conoces la receta actual de tus lentes de contacto?</h3>
                <p className="clq-step-desc">Necesitamos los valores exactos para recomendarte el producto correcto.</p>
                
                <div className="clq-options-grid">
                  <div className={`clq-opt-card ${knowsPrescription === true ? 'active' : ''}`} onClick={() => { setKnowsPrescription(true); setStep(2); }}>
                    <div className="clq-opt-icon"><Check size={32} /></div>
                    <div className="clq-opt-title">Sí, tengo mi receta</div>
                    <div className="clq-opt-desc">Conozco mi graduación y quiero comprar.</div>
                  </div>
                  <div className={`clq-opt-card ${knowsPrescription === false ? 'active' : ''}`} onClick={() => { setKnowsPrescription(false); setStep(5); }}>
                    <div className="clq-opt-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
                    <div className="clq-opt-title">No estoy seguro</div>
                    <div className="clq-opt-desc">Es mi primera vez o no tengo mi receta vigente.</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Prescription Input */}
            {step === 2 && (
              <motion.div key="step2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h3 className="clq-step-title">Captura tu graduación</h3>
                <p className="clq-step-desc">Ingresa los valores exactos que vienen en la caja de tus lentes de contacto actuales.</p>
                
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px', justifyContent:'center'}}>
                  <input type="checkbox" id="sameRx" checked={samePrescription} onChange={(e) => setSamePrescription(e.target.checked)} style={{width:'18px', height:'18px'}} />
                  <label htmlFor="sameRx" style={{fontWeight:500, color:'#111827', cursor:'pointer'}}>Misma graduación en ambos ojos</label>
                </div>

                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                  <button 
                    onClick={() => setShowRxGuide(!showRxGuide)}
                    style={{ 
                      background: 'none', border: 'none', padding: 0, 
                      color: '#b48c36', fontSize: '12.5px', fontWeight: 600, 
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' 
                    }}
                  >
                    {showRxGuide ? '▼' : '▶'} ¿Cómo leer mi receta?
                  </button>
                </div>
                
                <AnimatePresence>
                  {showRxGuide && (
                    <motion.div
                      key="rxguide"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <RxGuide isToric={true} isMultifocal={true} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="clq-rx-grid" style={{gridTemplateColumns: samePrescription ? '1fr' : '1fr 1fr', marginTop: '32px'}}>
                  {renderPrescriptionCol('OD', samePrescription ? 'Ambos Ojos (OD y OS)' : 'Ojo Derecho (OD)')}
                  {!samePrescription && renderPrescriptionCol('OS', 'Ojo Izquierdo (OS)')}
                </div>

                <div className="clq-actions">
                  <button className="clq-btn-back" onClick={handleBack}>Regresar</button>
                  <button className="clq-btn-next" onClick={handleNext} disabled={!isPrescriptionComplete()}>Siguiente: Frecuencia de Uso →</button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Usage */}
            {step === 3 && (
              <motion.div key="step3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h3 className="clq-step-title">¿Qué frecuencia de reemplazo prefieres?</h3>
                <p className="clq-step-desc">Los lentes diarios son más higiénicos. Los mensuales ofrecen excelente valor.</p>
                
                <div className="clq-options-grid">
                  <div className={`clq-opt-card ${usage === 'Diario' ? 'active' : ''}`} onClick={() => { setUsage('Diario'); setStep(4); }}>
                    <div className="clq-opt-title">Uso Diario</div>
                    <div className="clq-opt-desc">Estrenas un par nuevo cada día. Máxima higiene y comodidad. No requieren limpieza.</div>
                  </div>
                  <div className={`clq-opt-card ${usage === 'Mensual' ? 'active' : ''}`} onClick={() => { setUsage('Mensual'); setStep(4); }}>
                    <div className="clq-opt-title">Uso Mensual / Quincenal</div>
                    <div className="clq-opt-desc">Usas el mismo par por 15 a 30 días. Requieren limpieza diaria. Excelente valor.</div>
                  </div>
                </div>
                
                <div className="clq-actions">
                  <button className="clq-btn-back" onClick={handleBack}>Regresar</button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Results */}
            {step === 4 && (
              <motion.div key="step4" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="clq-results">
                <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}><Check size={48} color="#10B981" /></div>
                <h3 className="clq-step-title">¡Encontramos tus lentes ideales!</h3>
                <p className="clq-step-desc">Basado en tu receta ({isToric() ? 'Astigmatismo' : isMultifocal() ? 'Multifocal' : 'Esférico'}) y preferencia ({usage.toLowerCase()}).</p>
                
                <div className="clq-results-grid">
                  {getRecommendations().map(prod => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onQuickView={() => onViewProduct(prod)}
                      showQuickViewButton={true}
                    />
                  ))}
                  {getRecommendations().length === 0 && (
                    <div style={{gridColumn:'1/-1', padding:'32px', background:'#F9FAFB', borderRadius:'16px', color:'#4B5563'}}>
                      No encontramos un lente exacto con esos filtros. Por favor, consulta nuestro catálogo completo o contáctanos.
                    </div>
                  )}
                </div>

                <div className="clq-actions">
                  <button className="clq-btn-back" onClick={() => setStep(1)}>Volver a empezar</button>
                  <button className="clq-btn-primary" onClick={() => {
                    const reqStr = `Hola, quiero comprar lentes de contacto ${isToric() ? 'para astigmatismo' : ''}. Mi receta es OD: ${prescriptionOD.sph} y uso ${usage}.`;
                    onBookAppointment(reqStr);
                  }}>
                    Contactar a un asesor
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Eye Exam CTA (The "No" Path) */}
            {step === 5 && (
              <motion.div key="step5" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="clq-exam-cta">
                <img src={eyeExamImg} alt="Examen de vista" className="clq-exam-img" />
                <h3 className="clq-step-title">¡No te preocupes!</h3>
                <p className="clq-step-desc" style={{marginBottom:'24px', maxWidth:'500px', margin:'0 auto 16px'}}>
                  Para usar lentes de contacto por primera vez o renovarlos, necesitas una <strong>adaptación especial</strong> y medidas precisas de tu ojo (curva base, diámetro, graduación exacta).<br/><br/>
                  Agenda una cita con nuestro oftalmólogo certificado. Nosotros nos encargamos de todo para que uses lentes de contacto con total seguridad y comodidad.
                </p>
                <div className="clq-actions">
                  <button className="clq-btn-back" onClick={handleBack}>Regresar</button>
                  <button className="clq-btn-primary" onClick={() => onBookAppointment("Hola, quiero agendar una cita para adaptación de lentes de contacto. Es mi primera vez o no tengo receta vigente.")}>
                    Agendar Cita de Adaptación
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
