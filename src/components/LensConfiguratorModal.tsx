import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Upload, Edit3, User, Clock, CheckCircle } from 'lucide-react';
import './LensConfiguratorModal.css';

export const FRAME_GRADUACION_OPTIONS = [
  { id: 'SIN_GRADUACION_MICA', name: 'Sin graduación', price: 0 },
  { id: 'MONOFOCAL', name: 'Monofocal', price: 0 },
  { id: 'BIFOCAL_FT', name: 'Bifocal Flat top', price: 1034.48 },
  { id: 'BIFOCAL_INV', name: 'Bifocal Invisible', price: 1293.10 },
  { id: 'PROGRESIVO_EST', name: 'Progresivo Estandar', price: 1810.35 },
  { id: 'PROGRESIVO_AV', name: 'Progresivo Avanzado', price: 2500.00 }, // Estimated
];

export const AR_OPTIONS = [
  { id: 'AR_VERDE', name: 'Antirreflejante Verde', price: 0 },
  { id: 'AR_AZUL', name: 'Antirreflejante Azul', price: 474.13 },
];

export const PHOTOCHROMIC_OPTIONS = [
  { id: 'NONE', name: 'Ninguno', price: 0 },
  { id: 'FOTO_GRIS', name: 'Fotocromático Gris', price: 1637.93 },
  { id: 'FOTO_CAFE', name: 'Fotocromático Café', price: 1637.93 },
  { id: 'FOTO_AZUL', name: 'Fotocromático Azul', price: 1637.93 },
];

export const TINTING_OPTIONS = [
  { id: 'NONE', name: 'Ninguno', price: 0 },
  { id: 'TINT_ROJO', name: 'Rojo', price: 862.07 },
  { id: 'TINT_AMARILLO', name: 'Amarillo', price: 862.07 },
  { id: 'TINT_AZUL', name: 'Azul', price: 862.07 },
  { id: 'TINT_NARANJA', name: 'Naranja', price: 862.07 },
];

export const MATERIAL_OPTIONS = [
  { id: 'CLASICO', name: 'Estándar (No)', price: 0 },
  { id: 'HI_INDEX', name: 'Sí, adelgazar mica (HI-INDEX)', price: 1163.79 },
];

interface LensConfiguratorModalProps {
  product: any;
  onClose: () => void;
  onComplete: (config: any) => void;
}

export default function LensConfiguratorModal({ product, onClose, onComplete }: LensConfiguratorModalProps) {
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

  const nextStep = () => setStep(s => Math.min(s + 1, 7));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const updateConfig = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const calculateTotal = () => {
    let total = product?.price_incl_tax || 0;
    
    const grad = FRAME_GRADUACION_OPTIONS.find(o => o.id === config.graduacion);
    if (grad) total += grad.price * 1.16;
    
    const ar = AR_OPTIONS.find(o => o.id === config.ar);
    if (ar) total += ar.price * 1.16;

    const photo = PHOTOCHROMIC_OPTIONS.find(o => o.id === config.photochromic);
    if (photo) total += photo.price * 1.16;

    const tint = TINTING_OPTIONS.find(o => o.id === config.tinting);
    if (tint) total += tint.price * 1.16;

    const mat = MATERIAL_OPTIONS.find(o => o.id === config.material);
    if (mat) total += mat.price * 1.16;

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
              <button className="config-option-btn" onClick={() => { updateConfig('prescriptionMethod', 'MANUAL'); nextStep(); }}>
                <div className="config-icon-wrapper"><Edit3 size={20} /></div>
                <div className="config-option-text">
                  <h3>Ingresar valores manualmente</h3>
                  <p>Escribe los valores de tu receta.</p>
                </div>
              </button>
              
              <button className="config-option-btn" onClick={() => { updateConfig('prescriptionMethod', 'PHOTO'); nextStep(); }}>
                <div className="config-icon-wrapper"><Upload size={20} /></div>
                <div className="config-option-text">
                  <h3>Subir una foto</h3>
                  <p>Usa tu cámara o sube una imagen.</p>
                </div>
              </button>

              <button className="config-option-btn" onClick={() => { updateConfig('prescriptionMethod', 'ACCOUNT'); nextStep(); }}>
                <div className="config-icon-wrapper"><User size={20} /></div>
                <div className="config-option-text">
                  <h3>Añadir de mi cuenta</h3>
                  <p>Inicia sesión para ver recetas guardadas.</p>
                </div>
              </button>

              <button className="config-option-btn-secondary mt-4" onClick={() => { updateConfig('prescriptionMethod', 'LATER'); nextStep(); }}>
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
                  className={`config-grid-item ${config.graduacion === opt.id ? 'selected' : ''}`}
                  onClick={() => { updateConfig('graduacion', opt.id); nextStep(); }}
                >
                  <div className="config-check"><CheckCircle size={24} /></div>
                  <h3>{opt.name}</h3>
                  {opt.price > 0 && <span className="config-price">+${Math.round(opt.price * 1.16).toLocaleString('es-MX')}</span>}
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
                  className={`config-grid-item ${config.ar === opt.id ? 'selected' : ''}`}
                  onClick={() => { updateConfig('ar', opt.id); nextStep(); }}
                >
                  <div className="config-check"><CheckCircle size={24} /></div>
                  <h3>{opt.name}</h3>
                  {opt.price > 0 && <span className="config-price">+${Math.round(opt.price * 1.16).toLocaleString('es-MX')}</span>}
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
                  className={`config-grid-item ${config.photochromic === opt.id ? 'selected' : ''}`}
                  onClick={() => { updateConfig('photochromic', opt.id); nextStep(); }}
                >
                  <div className="config-check"><CheckCircle size={24} /></div>
                  <h3>{opt.name}</h3>
                  {opt.price > 0 && <span className="config-price">+${Math.round(opt.price * 1.16).toLocaleString('es-MX')}</span>}
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
                  className={`config-grid-item ${config.tinting === opt.id ? 'selected' : ''}`}
                  onClick={() => { updateConfig('tinting', opt.id); nextStep(); }}
                >
                  <div className="config-check"><CheckCircle size={24} /></div>
                  <h3>{opt.name}</h3>
                  {opt.price > 0 && <span className="config-price">+${Math.round(opt.price * 1.16).toLocaleString('es-MX')}</span>}
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="config-step-content">
            <h2 className="config-title">Adelgazar Mica (HI-INDEX)</h2>
            <p className="config-subtitle">Recomendado para graduaciones altas.</p>
            <div className="config-grid">
              {MATERIAL_OPTIONS.map(opt => (
                <button 
                  key={opt.id}
                  className={`config-grid-item ${config.material === opt.id ? 'selected' : ''}`}
                  onClick={() => { 
                    updateConfig('material', opt.id); 
                    setStep(7); // Final step
                  }}
                >
                  <div className="config-check"><CheckCircle size={24} /></div>
                  <h3>{opt.name}</h3>
                  {opt.price > 0 && <span className="config-price">+${Math.round(opt.price * 1.16).toLocaleString('es-MX')}</span>}
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="config-step-content text-center py-8">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
            <h2 className="config-title text-2xl">¡Configuración Completa!</h2>
            <p className="config-subtitle mb-8">Tu armazón está listo con las micas perfectas para ti.</p>
            
            <div className="bg-slate-50 p-6 rounded-2xl text-left mb-8">
              <h4 className="font-bold text-slate-900 mb-4">Resumen:</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Armazón: {product?.name} {product?.brand}</li>
                {config.graduacion && <li>• Graduación: {FRAME_GRADUACION_OPTIONS.find(o => o.id === config.graduacion)?.name}</li>}
                {config.ar && <li>• AR: {AR_OPTIONS.find(o => o.id === config.ar)?.name}</li>}
                {config.photochromic && config.photochromic !== 'NONE' && <li>• Fotocromático: {PHOTOCHROMIC_OPTIONS.find(o => o.id === config.photochromic)?.name}</li>}
                {config.tinting && config.tinting !== 'NONE' && <li>• Entintado: {TINTING_OPTIONS.find(o => o.id === config.tinting)?.name}</li>}
                {config.material === 'HI_INDEX' && <li>• Adelgazado: Sí (Hi-Index)</li>}
              </ul>
              <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900">Total Estimado</span>
                <span className="text-xl font-black text-indigo-600">${calculateTotal().toLocaleString('es-MX')}</span>
              </div>
            </div>

            <button 
              className="config-btn-primary w-full"
              onClick={() => onComplete(config)}
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto md:max-h-[85vh]"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
            <div className="flex items-center gap-3">
              {step > 1 && step < 7 && (
                <button onClick={prevStep} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                  <ChevronLeft size={20} />
                </button>
              )}
              <h3 className="font-bold text-slate-900">Configurar Micas</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          {step < 7 && (
            <div className="w-full bg-slate-100 h-1.5">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300 ease-out" 
                style={{ width: `${(step / 6) * 100}%` }} 
              />
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {renderStepContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
