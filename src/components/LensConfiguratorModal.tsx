import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Upload, Edit3, User, CheckCircle } from 'lucide-react';
import { FRAME_GRADUACION_OPTIONS, AR_OPTIONS, PHOTOCHROMIC_OPTIONS, TINTING_OPTIONS, MATERIAL_OPTIONS } from '../lib/configuratorConstants';
import './LensConfiguratorModal.css';
import heroImg from '../assets/hero_glasses.png';
import contactLensesImg from '../assets/contact_lenses.png';

const API_BASE = 'https://lensique-backend-m21d.onrender.com';
const resolveImageUrl = (url: any, fallback?: any) => {
  const isInvalid = (val: any) => !val || val === 'undefined' || val === 'null' || val === '';
  
  const processUrl = (u: string) => {
    const targetUrl = String(u).trim();
    if (targetUrl.startsWith('http') || targetUrl.startsWith('data:')) return targetUrl;
    const cleanUrl = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
    return `${API_BASE}${cleanUrl}`;
  };

  if (!isInvalid(url)) return processUrl(url);
  if (!isInvalid(fallback)) return processUrl(fallback);
  return '';
};

interface LensConfiguratorModalProps {
  product: any;
  catalogData?: any[];
  onClose: () => void;
  onComplete: (config: any) => void;
}

export default function LensConfiguratorModal({ product, catalogData = [], onClose, onComplete }: LensConfiguratorModalProps) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    prescriptionMethod: '',
    prescriptionValues: { od: '', oi: '' },
    graduacion: '',
    ar: '',
    photochromic: '',
    tinting: '',
    material: ''
  });

  const getDynamicPrice = (name: string, fallbackPrice: number) => {
    const item = catalogData.find((p: any) => p.name.toLowerCase() === name.toLowerCase());
    return item ? (item.price || 0) : (fallbackPrice * 1.16);
  };

  const handleNext = (overridePhotochromic?: string) => {
    const currentPhoto = overridePhotochromic !== undefined ? overridePhotochromic : config.photochromic;
    if (step === 4 && currentPhoto && currentPhoto !== 'NONE') {
      updateConfig('tinting', 'NONE');
      setStep(6);
    } else {
      setStep(s => Math.min(s + 1, 7));
    }
  };

  const handlePrev = () => {
    // If going back from Step 6 (Material) and a photochromic option is selected, skip Step 5 (Tinting)
    if (step === 6 && config.photochromic && config.photochromic !== 'NONE') {
      setStep(4);
    } 
    // If going back from Step 5 (Tinting), ensure we didn't skip it going forward
    else if (step === 5 && config.photochromic && config.photochromic !== 'NONE') {
      setStep(4);
    }
    else {
      setStep(s => Math.max(s - 1, 1));
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const calculateTotal = () => {
    let total = product?.price_incl_tax || 0;
    
    const grad = FRAME_GRADUACION_OPTIONS.find(o => o.id === config.graduacion);
    if (grad) total += getDynamicPrice(grad.name, grad.price);
    
    const ar = AR_OPTIONS.find(o => o.id === config.ar);
    if (ar && config.graduacion !== 'NONE') total += getDynamicPrice(ar.name, ar.price);

    const photo = PHOTOCHROMIC_OPTIONS.find(o => o.id === config.photochromic);
    if (photo && config.photochromic !== 'NONE') total += getDynamicPrice(photo.name, photo.price);

    const tint = TINTING_OPTIONS.find(o => o.id === config.tinting);
    if (tint && config.photochromic === 'NONE') total += getDynamicPrice(tint.name, tint.price);

    const mat = MATERIAL_OPTIONS.find(o => o.id === config.material);
    if (mat && config.graduacion !== 'NONE') total += getDynamicPrice(mat.name, mat.price);

    return Math.round(total);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="config-step-content">
            <h2 className="config-title">¿Tienes tu receta a la mano?</h2>
            <p className="config-subtitle">Añádela ahora para ahorrar tiempo o hazlo después.</p>
            
            <div className="config-options-list">
              <button className="config-option-btn" onClick={() => { updateConfig('prescriptionMethod', 'MANUAL'); handleNext(); }}>
                <div className="config-icon-wrapper"><Edit3 size={20} /></div>
                <div className="config-option-text">
                  <h3>Ingresar valores manualmente</h3>
                  <p>Escribe los valores de tu receta.</p>
                </div>
              </button>
              
              <button className="config-option-btn" onClick={() => { updateConfig('prescriptionMethod', 'PHOTO'); handleNext(); }}>
                <div className="config-icon-wrapper"><Upload size={20} /></div>
                <div className="config-option-text">
                  <h3>Subir una foto</h3>
                  <p>Usa tu cámara o sube una imagen.</p>
                </div>
              </button>

              <button className="config-option-btn" onClick={() => { updateConfig('prescriptionMethod', 'ACCOUNT'); handleNext(); }}>
                <div className="config-icon-wrapper"><User size={20} /></div>
                <div className="config-option-text">
                  <h3>Añadir de mi cuenta</h3>
                  <p>Inicia sesión para ver recetas guardadas.</p>
                </div>
              </button>

              <button className="config-option-btn-secondary" onClick={() => { updateConfig('prescriptionMethod', 'LATER'); handleNext(); }}>
                Saltar por ahora, lo haré después
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="config-step-content">
            <h2 className="config-title">Tipo de Graduación</h2>
            <p className="config-subtitle">Selecciona el tipo de visión que necesitas.</p>
            <div className="config-grid">
              {FRAME_GRADUACION_OPTIONS.map(opt => (
                <button 
                  key={opt.id}
                  className={`config-list-item ${config.graduacion === opt.id ? 'selected' : ''}`}
                  onClick={() => { updateConfig('graduacion', opt.id); handleNext(); }}
                >
                  <div className="config-list-item-top">
                    <h3>{opt.name}</h3>
                    <span className="config-price">{getDynamicPrice(opt.name, opt.price) === 0 ? 'Incluido' : `+$${Math.round(getDynamicPrice(opt.name, opt.price)).toLocaleString('es-MX')}`}</span>
                  </div>
                  {opt.description && <p className="config-list-item-desc">{opt.description}</p>}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="config-step-content">
            <h2 className="config-title">Antirreflejante (AR)</h2>
            <p className="config-subtitle">Mejora la claridad y reduce los reflejos.</p>
            <div className="config-grid">
              {AR_OPTIONS.map(opt => (
                <button 
                  key={opt.id}
                  className={`config-list-item ${config.ar === opt.id ? 'selected' : ''}`}
                  onClick={() => { updateConfig('ar', opt.id); handleNext(); }}
                >
                  <div className="config-list-item-top">
                    <h3>{opt.name}</h3>
                    <span className="config-price">{getDynamicPrice(opt.name, opt.price) === 0 ? 'Incluido' : `+$${Math.round(getDynamicPrice(opt.name, opt.price)).toLocaleString('es-MX')}`}</span>
                  </div>
                  {opt.description && <p className="config-list-item-desc">{opt.description}</p>}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="config-step-content">
            <h2 className="config-title">Fotocromático</h2>
            <p className="config-subtitle">Micas que se oscurecen con el sol.</p>
            <div className="config-grid">
              {PHOTOCHROMIC_OPTIONS.map(opt => (
                <button 
                  key={opt.id}
                  className={`config-list-item ${config.photochromic === opt.id ? 'selected' : ''}`}
                  onClick={() => { updateConfig('photochromic', opt.id); handleNext(opt.id); }}
                >
                  <div className="config-list-item-top">
                    <h3>{opt.name}</h3>
                    <span className="config-price">{getDynamicPrice(opt.name, opt.price) === 0 ? 'Incluido' : `+$${Math.round(getDynamicPrice(opt.name, opt.price)).toLocaleString('es-MX')}`}</span>
                  </div>
                  {opt.description && <p className="config-list-item-desc">{opt.description}</p>}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="config-step-content">
            <h2 className="config-title">Entintado</h2>
            <p className="config-subtitle">Dale un toque de color a tus micas.</p>
            <div className="config-grid">
              {TINTING_OPTIONS.map(opt => (
                <button 
                  key={opt.id}
                  className={`config-list-item ${config.tinting === opt.id ? 'selected' : ''}`}
                  onClick={() => { updateConfig('tinting', opt.id); handleNext(); }}
                >
                  <div className="config-list-item-top">
                    <h3>{opt.name}</h3>
                    <span className="config-price">{getDynamicPrice(opt.name, opt.price) === 0 ? 'Incluido' : `+$${Math.round(getDynamicPrice(opt.name, opt.price)).toLocaleString('es-MX')}`}</span>
                  </div>
                  {opt.description && <p className="config-list-item-desc">{opt.description}</p>}
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="config-step-content">
            <h2 className="config-title">Adelgazar Mica</h2>
            <p className="config-subtitle">Recomendado para graduaciones altas (HI-INDEX).</p>
            <div className="config-grid">
              {MATERIAL_OPTIONS.map(opt => (
                <button 
                  key={opt.id}
                  className={`config-list-item ${config.material === opt.id ? 'selected' : ''}`}
                  onClick={() => { 
                    updateConfig('material', opt.id); 
                    setStep(7); 
                  }}
                >
                  <div className="config-list-item-top">
                    <h3>{opt.name}</h3>
                    <span className="config-price">{getDynamicPrice(opt.name, opt.price) === 0 ? 'Incluido' : `+$${Math.round(getDynamicPrice(opt.name, opt.price)).toLocaleString('es-MX')}`}</span>
                  </div>
                  {opt.description && <p className="config-list-item-desc">{opt.description}</p>}
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="config-step-content config-text-center">
            <div className="config-success-icon">
              <CheckCircle size={48} />
            </div>
            <h2 className="config-title" style={{ fontSize: '2rem' }}>¡Todo listo!</h2>
            <p className="config-subtitle">Tu armazón está listo con las micas perfectas para ti.</p>

            <button 
              className="config-btn-primary config-btn-full"
              onClick={() => onComplete(config)}
              style={{ marginTop: '2rem', padding: '1.25rem' }}
            >
              Continuar por WhatsApp
            </button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="config-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="config-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header (Mobile Only) */}
          <div className="config-modal-header d-md-none">
            <div className="config-modal-header-left">
              {step > 1 && step < 7 && (
                <button onClick={handlePrev} className="config-icon-btn">
                  <ChevronLeft size={20} />
                </button>
              )}
              <h3>Configurar Micas</h3>
            </div>
            <button onClick={onClose} className="config-icon-btn">
              <X size={20} />
            </button>
          </div>

          <div className="config-modal-split">
            {/* Left Panel: Summary */}
            <div className="config-summary-panel">
              <button onClick={onClose} className="config-close-btn-desktop">
                <X size={24} />
              </button>
              <div className="config-summary-image-wrapper">
                <img 
                  src={resolveImageUrl(product?.displayImage || product?.image_url, product?.image)} 
                  alt={product?.name} 
                  className="config-summary-image" 
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = String(product?.category || '').toLowerCase().includes('contacto') ? contactLensesImg : heroImg;
                  }}
                />
              </div>
              <div className="config-summary-details">
                <span className="config-summary-brand">{product?.brand || 'Lensique'}</span>
                <h3 className="config-summary-name">{product?.name}</h3>
                
                <div className="config-summary-selections">
                  <div className="config-selection-item">
                    <span>Armazón</span>
                    <span>${Math.round(product?.price_incl_tax || 0).toLocaleString('es-MX')}</span>
                  </div>
                  {config.graduacion && config.graduacion !== 'SIN_GRADUACION_MICA' && (
                    <div className="config-selection-item">
                      <span>Graduación</span>
                      <span>+${Math.round(FRAME_GRADUACION_OPTIONS.find(o => o.id === config.graduacion)?.price * 1.16 || 0).toLocaleString('es-MX')}</span>
                    </div>
                  )}
                  {config.ar && config.ar !== 'AR_VERDE' && (
                    <div className="config-selection-item">
                      <span>Antirreflejante</span>
                      <span>+${Math.round(AR_OPTIONS.find(o => o.id === config.ar)?.price * 1.16 || 0).toLocaleString('es-MX')}</span>
                    </div>
                  )}
                  {config.photochromic && config.photochromic !== 'NONE' && (
                    <div className="config-selection-item">
                      <span>Fotocromático</span>
                      <span>+${Math.round(PHOTOCHROMIC_OPTIONS.find(o => o.id === config.photochromic)?.price * 1.16 || 0).toLocaleString('es-MX')}</span>
                    </div>
                  )}
                  {config.tinting && config.tinting !== 'NONE' && config.photochromic === 'NONE' && (
                    <div className="config-selection-item">
                      <span>Entintado</span>
                      <span>+${Math.round(TINTING_OPTIONS.find(o => o.id === config.tinting)?.price * 1.16 || 0).toLocaleString('es-MX')}</span>
                    </div>
                  )}
                  {config.material === 'HI_INDEX' && (
                    <div className="config-selection-item">
                      <span>HI-INDEX</span>
                      <span>+${Math.round(MATERIAL_OPTIONS.find(o => o.id === config.material)?.price * 1.16 || 0).toLocaleString('es-MX')}</span>
                    </div>
                  )}
                </div>

                <div className="config-summary-total">
                  <span>Total estimado</span>
                  <strong>${calculateTotal().toLocaleString('es-MX')}</strong>
                </div>
              </div>
            </div>

            {/* Right Panel: Interactive Steps */}
            <div className="config-steps-panel">
              {/* Header (Desktop Only) */}
              <div className="config-modal-header d-none-mobile">
                <div className="config-modal-header-left">
                  {step > 1 && step < 7 && (
                    <button onClick={handlePrev} className="config-icon-btn">
                      <ChevronLeft size={20} /> Volver
                    </button>
                  )}
                </div>
                {step < 7 && <span className="config-step-indicator">Paso {step} de 6</span>}
              </div>

              {/* Progress Bar */}
              {step < 7 && (
                <div className="config-progress-bg">
                  <div 
                    className="config-progress-fill" 
                    style={{ width: `${(step / 6) * 100}%` }} 
                  />
                </div>
              )}

              {/* Content Area */}
              <div className="config-modal-body">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
