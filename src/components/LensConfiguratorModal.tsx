import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Upload, Edit3, User, CheckCircle } from 'lucide-react';
import { FRAME_GRADUACION_OPTIONS, AR_OPTIONS, PHOTOCHROMIC_OPTIONS, TINTING_OPTIONS, MATERIAL_OPTIONS } from '../lib/configuratorConstants';
import './LensConfiguratorModal.css';
import heroImg from '../assets/hero_glasses.png';
import contactLensesImg from '../assets/contact_lenses.png';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://lensique-pos.onrender.com';
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

const generateOptions = (min: number, max: number, step: number, prefixPlus = false) => {
  const options = [];
  for (let i = min; i <= max; i += step) {
    const val = i.toFixed(2);
    const label = (prefixPlus && i > 0) ? `+${val}` : val;
    options.push({ value: val, label });
  }
  return options;
};

const SPH_OPTIONS = generateOptions(-20, 20, 0.25, true);
const CYL_OPTIONS = generateOptions(-10, 10, 0.25, true);
const AXIS_OPTIONS = Array.from({length: 181}, (_, i) => ({ value: String(i), label: String(i) }));
const ADD_OPTIONS = generateOptions(0.75, 3.5, 0.25, true);
const PD_OPTIONS = generateOptions(40, 80, 0.5);
const DUAL_PD_OPTIONS = generateOptions(20, 40, 0.5);

interface LensConfiguratorModalProps {
  product: any;
  catalogData?: any[];
  onClose: () => void;
  onComplete: (config: any) => void;
}

const CustomSelect = ({ value, onChange, options, placeholder = "" }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], placeholder?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);
  const label = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="custom-select-container" style={{ position: 'relative' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', 
          backgroundColor: '#fff', fontSize: '0.95rem', color: '#333', 
          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          userSelect: 'none'
        }}
      >
        {label}
        <ChevronLeft size={16} style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(270deg)', transition: '0.2s', color: '#999' }} />
      </div>
      
      {isOpen && (
        <div 
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, 
            backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px', 
            marginTop: '4px', maxHeight: '220px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {placeholder && (
            <div 
              onClick={() => { onChange(''); setIsOpen(false); }}
              style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #eee', color: '#666', fontSize: '0.9rem' }}
            >
              {placeholder}
            </div>
          )}
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              style={{ padding: '0.6rem 0.75rem', cursor: 'pointer', backgroundColor: value === opt.value ? '#f0f7ff' : 'transparent', color: value === opt.value ? '#0056b3' : '#333', fontSize: '0.95rem' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = value === opt.value ? '#f0f7ff' : 'transparent'}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
      
      {isOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default function LensConfiguratorModal({ product, catalogData = [], onClose, onComplete }: LensConfiguratorModalProps) {
  const [step, setStep] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [prescriptionMode, setPrescriptionMode] = useState<'SELECTION' | 'MANUAL' | 'PHOTO'>('SELECTION');
  const [manualPrescription, setManualPrescription] = useState({
    od: { sph: '', cyl: '', axis: '', add: '' },
    oi: { sph: '', cyl: '', axis: '', add: '' },
    pdType: 'SINGLE', // 'SINGLE' or 'DUAL'
    pd: '',
    pdLeft: '',
    pdRight: ''
  });
  const [config, setConfig] = useState<{
    prescriptionMethod: string;
    prescriptionValues: any;
    graduacion: string;
    ar: string;
    photochromic: string;
    tinting: string;
    material: string;
    prescriptionPhotoFile?: File;
  }>({
    prescriptionMethod: '',
    prescriptionValues: { od: '', oi: '' },
    graduacion: '',
    ar: '',
    photochromic: '',
    tinting: '',
    material: ''
  });

  const getDynamicPrice = (name: string, fallbackPrice: number, optId?: string) => {
    if (optId === 'POLICARBONATO') {
       if (product?.base_material === 'POLICARBONATO' || String(product?.category || '').toLowerCase().includes('policarbonato')) {
         return 0;
       }
       const isFree = [
         'ORX3929V- 2500', 'ORX3928V- 2501', '0VO4320B 5152', 
         '0VO4357D 848', 'CA-8901-BK/GD', '0AN6134L (Vista)'
       ].some(m => product?.name?.trim().toUpperCase() === m.toUpperCase());
       if (isFree) return 0;
    }
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
    if (step === 1 && prescriptionMode !== 'SELECTION') {
      setPrescriptionMode('SELECTION');
      return;
    }

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
    if (mat && config.graduacion !== 'NONE') total += getDynamicPrice(mat.name, mat.price, mat.id);

    return Math.round(total);
  };

  const handleComplete = async () => {
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append('config', JSON.stringify({
        ...config,
        productName: product?.name,
        productPrice: calculateTotal()
      }));

      if (config.prescriptionPhotoFile) {
        formData.append('prescriptionPhotoFile', config.prescriptionPhotoFile);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      await fetch(`${API_BASE}/api/quotes/send`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
    } catch (e) {
      console.error('Error sending quote email:', e);
    } finally {
      setIsSending(false);
      onComplete(config);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        if (prescriptionMode === 'SELECTION') {
          return (
            <div className="config-step-content">
              <h2 className="config-title">¿Tienes tu receta a la mano?</h2>
              <p className="config-subtitle">Añádela ahora para ahorrar tiempo o hazlo después.</p>
              
              <div className="config-options-list">
                <button className="config-option-btn" onClick={() => setPrescriptionMode('MANUAL')}>
                  <div className="config-icon-wrapper"><Edit3 size={20} /></div>
                  <div className="config-option-text">
                    <h3>Ingresar valores manualmente</h3>
                    <p>Escribe los valores de tu receta.</p>
                  </div>
                </button>
                
                <button className="config-option-btn" onClick={() => setPrescriptionMode('PHOTO')}>
                  <div className="config-icon-wrapper"><Upload size={20} /></div>
                  <div className="config-option-text">
                    <h3>Subir una foto</h3>
                    <p>Usa tu cámara o sube una imagen.</p>
                  </div>
                </button>

                <button className="config-option-btn-secondary" onClick={() => { updateConfig('prescriptionMethod', 'LATER'); handleNext(); }}>
                  Saltar por ahora, lo haré después
                </button>
              </div>
            </div>
          );
        }

        if (prescriptionMode === 'MANUAL') {
          return (
            <div className="config-step-content config-prescription-form">
              <h2 className="config-title" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ingresa tu receta</h2>
              <p className="config-subtitle" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Nota: Está bien si tu receta no incluye un valor para cada campo mostrado abajo.
              </p>

              <div className="prescription-eye-section">
                <h3>Ojo Derecho (OD)</h3>
                <div className="prescription-grid">
                  <div className="presc-field">
                    <label>SPH</label>
                    <CustomSelect placeholder="0.00" value={manualPrescription.od.sph} onChange={(val) => setManualPrescription({...manualPrescription, od: {...manualPrescription.od, sph: val}})} options={SPH_OPTIONS} />
                  </div>
                  <div className="presc-field">
                    <label>CYL</label>
                    <CustomSelect placeholder="0.00" value={manualPrescription.od.cyl} onChange={(val) => setManualPrescription({...manualPrescription, od: {...manualPrescription.od, cyl: val}})} options={CYL_OPTIONS} />
                  </div>
                  <div className="presc-field">
                    <label>Axis</label>
                    <CustomSelect placeholder="0" value={manualPrescription.od.axis} onChange={(val) => setManualPrescription({...manualPrescription, od: {...manualPrescription.od, axis: val}})} options={AXIS_OPTIONS} />
                  </div>
                  <div className="presc-field">
                    <label>ADD</label>
                    <CustomSelect placeholder="Ninguna" value={manualPrescription.od.add} onChange={(val) => setManualPrescription({...manualPrescription, od: {...manualPrescription.od, add: val}})} options={ADD_OPTIONS} />
                  </div>
                </div>
              </div>

              <div className="prescription-eye-section">
                <h3>Ojo Izquierdo (OS)</h3>
                <div className="prescription-grid">
                  <div className="presc-field">
                    <label>SPH</label>
                    <CustomSelect placeholder="0.00" value={manualPrescription.oi.sph} onChange={(val) => setManualPrescription({...manualPrescription, oi: {...manualPrescription.oi, sph: val}})} options={SPH_OPTIONS} />
                  </div>
                  <div className="presc-field">
                    <label>CYL</label>
                    <CustomSelect placeholder="0.00" value={manualPrescription.oi.cyl} onChange={(val) => setManualPrescription({...manualPrescription, oi: {...manualPrescription.oi, cyl: val}})} options={CYL_OPTIONS} />
                  </div>
                  <div className="presc-field">
                    <label>Axis</label>
                    <CustomSelect placeholder="0" value={manualPrescription.oi.axis} onChange={(val) => setManualPrescription({...manualPrescription, oi: {...manualPrescription.oi, axis: val}})} options={AXIS_OPTIONS} />
                  </div>
                  <div className="presc-field">
                    <label>ADD</label>
                    <CustomSelect placeholder="Ninguna" value={manualPrescription.oi.add} onChange={(val) => setManualPrescription({...manualPrescription, oi: {...manualPrescription.oi, add: val}})} options={ADD_OPTIONS} />
                  </div>
                </div>
              </div>

              <div className="prescription-pd-section">
                <div className="pd-header">
                  <h3>Distancia Pupilar (PD)</h3>
                  <label className="dual-pd-toggle">
                    <input type="checkbox" checked={manualPrescription.pdType === 'DUAL'} onChange={(e) => setManualPrescription({...manualPrescription, pdType: e.target.checked ? 'DUAL' : 'SINGLE'})} />
                    Mi receta tiene dos valores de PD
                  </label>
                </div>
                
                {manualPrescription.pdType === 'SINGLE' ? (
                  <div className="presc-field full-width">
                    <CustomSelect placeholder="Selecciona tu PD" value={manualPrescription.pd} onChange={(val) => setManualPrescription({...manualPrescription, pd: val})} options={PD_OPTIONS} />
                  </div>
                ) : (
                  <div className="prescription-grid dual-pd-grid">
                    <div className="presc-field">
                      <label>PD Derecho</label>
                      <CustomSelect placeholder="Derecho" value={manualPrescription.pdRight} onChange={(val) => setManualPrescription({...manualPrescription, pdRight: val})} options={DUAL_PD_OPTIONS} />
                    </div>
                    <div className="presc-field">
                      <label>PD Izquierdo</label>
                      <CustomSelect placeholder="Izquierdo" value={manualPrescription.pdLeft} onChange={(val) => setManualPrescription({...manualPrescription, pdLeft: val})} options={DUAL_PD_OPTIONS} />
                    </div>
                  </div>
                )}
              </div>

              <div className="config-form-actions" style={{marginTop: '2rem'}}>
                <button 
                  className="config-btn-primary config-btn-full"
                  onClick={() => {
                    updateConfig('prescriptionMethod', 'MANUAL');
                    updateConfig('prescriptionValues', manualPrescription);
                    handleNext();
                  }}
                >
                  Continuar
                </button>
              </div>
            </div>
          );
        }

        if (prescriptionMode === 'PHOTO') {
          return (
            <div className="config-step-content">
              <h2 className="config-title">Sube tu receta</h2>
              <p className="config-subtitle">Asegúrate de que la foto sea clara.</p>
              
              <div className="config-upload-area" style={{ position: 'relative' }}>
                 <input 
                   type="file" 
                   accept="image/*,.pdf" 
                   onChange={(e) => {
                     if (e.target.files && e.target.files.length > 0) {
                        updateConfig('prescriptionPhotoFile', e.target.files[0]);
                     }
                   }}
                   style={{
                     position: 'absolute', inset: 0, width: '100%', height: '100%',
                     opacity: 0, cursor: 'pointer'
                   }} 
                 />
                 <Upload size={48} color="#ccc" style={{margin: '0 auto 1rem', display: 'block'}} />
                 <p style={{textAlign: 'center', color: '#666'}}>Haz clic aquí para seleccionar o tomar foto</p>
                 {config.prescriptionPhotoFile && (
                   <div style={{textAlign: 'center', marginTop: '1rem', color: '#10b981', fontWeight: 500}}>
                     Archivo cargado: {(config.prescriptionPhotoFile as any).name}
                   </div>
                 )}
              </div>

              <div className="config-form-actions" style={{marginTop: '2rem'}}>
                <button 
                  className="config-btn-primary config-btn-full"
                  onClick={() => {
                    updateConfig('prescriptionMethod', 'PHOTO');
                    handleNext();
                  }}
                >
                  Continuar
                </button>
              </div>
            </div>
          );
        }
        return null;
      
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

      case 6: {
        const hasPolyIncluded = product?.base_material === 'POLICARBONATO' || String(product?.category || '').toLowerCase().includes('policarbonato');
        const materialsToShow = hasPolyIncluded 
          ? MATERIAL_OPTIONS.filter(opt => opt.id === 'CLASICO').map(opt => 
              ({ ...opt, id: 'POLICARBONATO', name: 'Policarbonato', description: 'Grosor ideal y resistente a impactos.' })
            )
          : MATERIAL_OPTIONS;

        return (
          <div className="config-step-content">
            <h2 className="config-title">Adelgazar Mica</h2>
            <p className="config-subtitle">Recomendado para graduaciones altas (HI-INDEX).</p>
            {hasPolyIncluded && (
              <div style={{ padding: '0.75rem', backgroundColor: '#eef2ff', borderRadius: '8px', marginBottom: '1.5rem', color: '#3730a3', fontSize: '0.875rem' }}>
                Tu armazón ya incluye material de alta resistencia (Policarbonato) sin costo adicional.
              </div>
            )}
            <div className="config-grid">
              {materialsToShow.map(opt => (
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
                    <span className="config-price">{getDynamicPrice(opt.name, opt.price, opt.id) === 0 ? 'Incluido' : `+$${Math.round(getDynamicPrice(opt.name, opt.price, opt.id)).toLocaleString('es-MX')}`}</span>
                  </div>
                  {opt.description && <p className="config-list-item-desc">{opt.description}</p>}
                </button>
              ))}
            </div>
          </div>
        );
      }

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
              onClick={handleComplete}
              disabled={isSending}
              style={{ marginTop: '2rem', padding: '1.25rem', opacity: isSending ? 0.7 : 1 }}
            >
              {isSending ? 'Enviando...' : 'Continuar por WhatsApp'}
            </button>
          </div>
        );
    }
  };

  const getProductImage = () => {
    if (product?.displayImage) return resolveImageUrl(product.displayImage);
    
    // Check parsed images array
    if (product?.images && product.images.length > 0) {
      return resolveImageUrl(product.images[0].image_url || product.images[0]);
    }
    
    // Check if image_url is a JSON string
    let parsedUrl = product?.image_url;
    if (typeof parsedUrl === 'string' && parsedUrl.trim().startsWith('[')) {
      try {
        const arr = JSON.parse(parsedUrl);
        if (arr.length > 0) parsedUrl = arr[0].image_url || arr[0];
      } catch (e) {}
    }
    
    return resolveImageUrl(parsedUrl, product?.image);
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
              {(step > 1 || prescriptionMode !== 'SELECTION') && step < 7 && (
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
                  src={getProductImage()} 
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
                  {(step > 1 || prescriptionMode !== 'SELECTION') && step < 7 && (
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
