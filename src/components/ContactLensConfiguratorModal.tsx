import React, { useState, useRef, useEffect } from 'react';
import { X, CheckCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toTitleCase } from '../lib/format';
import { RxGuide } from './RxGuide';
import './ContactLensConfiguratorModal.css';

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

const WPSelect = ({ label, value, options, onChange, zeroValue, placeholder = 'Selecciona' }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="cl-wp-dropdown-container" ref={ref}>
      <div 
        className={`cl-wp-input-wrapper is-select ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <label>{label}</label>
        <div className="cl-wp-dropdown-value">{value || placeholder}</div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="cl-wp-dropdown-menu"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="cl-wp-dropdown-grid">
              {zeroValue !== undefined && (
                <div 
                    className={`cl-wp-dropdown-item zero-item ${value === zeroValue ? 'selected' : ''}`}
                    onClick={() => { onChange(zeroValue); setIsOpen(false); }}
                  >
                    0
                </div>
              )}
              {options && options.map((opt: string) => (
                <div 
                  key={opt} 
                  className={`cl-wp-dropdown-item ${value === opt ? 'selected' : ''}`}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ContactLensConfiguratorModalProps {
  product: any;
  onClose: () => void;
  onComplete: (configData: any) => void;
}

export default function ContactLensConfiguratorModal({ product, onClose, onComplete }: ContactLensConfiguratorModalProps) {
  const [step, setStep] = useState(1);
  const [quantityOD, setQuantityOD] = useState(1);
  const [quantityOS, setQuantityOS] = useState(1);
  
  const [samePrescription, setSamePrescription] = useState<boolean | null>(null);
  const [showRxGuide, setShowRxGuide] = useState(false);
  
  const [prescriptionOD, setPrescriptionOD] = useState({ sph: '', cyl: '', axis: '', add: '' });
  const [prescriptionOS, setPrescriptionOS] = useState({ sph: '', cyl: '', axis: '', add: '' });
  
  const productName = (product?.name ? product.name.toString() : '').toUpperCase();
  const isToric = productName.includes('ASTIGMATISMO') || productName.includes('TORIC') || productName.includes('ASTIGMATISM');
  const isMultifocal = productName.includes('MULTIFOCAL') || productName.includes('PRESBICIA') || productName.includes('PRESBYOPIA');
  
  const [prescriptionPhotoFile, setPrescriptionPhotoFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPrescriptionPhotoFile(e.target.files[0]);
    }
  };

  const getProductImage = () => {
    if (product?.displayImage) return resolveImageUrl(product.displayImage);
    if (product?.images && product.images.length > 0) {
      return resolveImageUrl(product.images[0].image_url || product.images[0]);
    }
    return product?.image || 'https://via.placeholder.com/300x200?text=Lente+de+Contacto';
  };

  const getSpmOptions = () => {
    const opts = [];
    for (let i = 0.25; i <= 10; i += 0.25) {
      opts.push(`-${i.toFixed(2)}`);
      opts.push(`+${i.toFixed(2)}`);
    }
    return opts;
  };

  const getCylOptions = () => {
    const opts = [];
    for (let i = -0.25; i >= -6; i -= 0.25) {
      opts.push(i.toFixed(2));
    }
    return opts;
  };

  const getAxisOptions = () => {
    const opts = [];
    for (let i = 10; i <= 180; i += 10) {
      opts.push(i.toString());
    }
    return opts;
  };

  const getAddOptions = () => {
    const opts = ['LOW', 'MED', 'HIGH'];
    for (let i = 0.75; i <= 3.50; i += 0.25) {
      opts.push(`+${i.toFixed(2)}`);
    }
    return opts;
  };

  const isPrescriptionComplete = () => {
    if (samePrescription === null) return false;
    
    const checkEye = (eye: any) => {
      if (eye.sph === '') return false;
      if (isToric && (eye.cyl === '' || eye.axis === '')) return false;
      if (isMultifocal && eye.add === '') return false;
      return true;
    };

    if (samePrescription) {
      return checkEye(prescriptionOD);
    } else {
      const odOk = quantityOD === 0 || checkEye(prescriptionOD);
      const osOk = quantityOS === 0 || checkEye(prescriptionOS);
      return odOk && osOk;
    }
  };

  const handleComplete = async () => {
    onComplete({
      ...product,
      contactLensConfig: {
        quantityOD,
        quantityOS,
        samePrescription,
        prescriptionOD: samePrescription ? prescriptionOD : prescriptionOD,
        prescriptionOS: samePrescription ? prescriptionOD : prescriptionOS,
        hasPhoto: !!prescriptionPhotoFile
      }
    });
  };

  const renderPrescriptionForm = (eye: 'OD' | 'OS', label: string) => {
    const values = eye === 'OD' ? prescriptionOD : prescriptionOS;
    const setValues = eye === 'OD' ? setPrescriptionOD : setPrescriptionOS;

    return (
      <div className="cl-prescription-column">
        <h4>{label}</h4>
        
        <WPSelect 
          label="Esfera (SPH/PWR/D)"
          value={values.sph}
          options={getSpmOptions()}
          onChange={(val: string) => setValues({ ...values, sph: val })}
          zeroValue="0.00"
        />

        {isToric && (
          <>
            <WPSelect 
              label="Cilindro (CYL)"
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
          </>
        )}

        {isMultifocal && (
          <WPSelect 
            label="Adición (ADD)"
            value={values.add}
            options={getAddOptions()}
            onChange={(val: string) => setValues({ ...values, add: val })}
          />
        )}

        <div className="cl-wp-input-wrapper is-readonly">
          <label>Curva Base (BC)</label>
          <input type="text" value="8.6" readOnly />
        </div>

        <div className="cl-wp-input-wrapper is-readonly">
          <label>Diámetro (DIA)</label>
          <input type="text" value="14.5" readOnly />
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="contact-lens-content-panel">
            <div className="contact-lens-step-header">
              <span className="contact-lens-step-indicator">Paso 1 de 4</span>
            </div>
            
            <h2 className="contact-lens-title">Selecciona la cantidad</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Elige cuántas cajas deseas para cada ojo.</p>
            
            <div className="cl-qty-container">
              <div className="cl-qty-label">
                <input type="checkbox" checked readOnly style={{ width: '18px', height: '18px', accentColor: '#1a4cd2' }} />
                <span>Ojo Derecho (OD)</span>
              </div>
              <div className="cl-qty-controls">
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{quantityOD} {quantityOD === 1 ? 'caja' : 'cajas'}</span>
                <button className="cl-qty-btn" onClick={() => setQuantityOD(Math.max(0, quantityOD - 1))} disabled={quantityOD <= 0}>-</button>
                <button className="cl-qty-btn" onClick={() => setQuantityOD(quantityOD + 1)}>+</button>
              </div>
            </div>

            <div className="cl-qty-container">
              <div className="cl-qty-label">
                <input type="checkbox" checked readOnly style={{ width: '18px', height: '18px', accentColor: '#1a4cd2' }} />
                <span>Ojo Izquierdo (OS)</span>
              </div>
              <div className="cl-qty-controls">
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{quantityOS} {quantityOS === 1 ? 'caja' : 'cajas'}</span>
                <button className="cl-qty-btn" onClick={() => setQuantityOS(Math.max(0, quantityOS - 1))} disabled={quantityOS <= 0}>-</button>
                <button className="cl-qty-btn" onClick={() => setQuantityOS(quantityOS + 1)}>+</button>
              </div>
            </div>

            <button 
              className="cl-btn-primary" 
              style={{ marginTop: '2rem' }}
              disabled={quantityOD === 0 && quantityOS === 0}
              onClick={() => {
                if (quantityOD > 0 && quantityOS > 0) {
                  setStep(2); // Ask if same prescription
                } else {
                  setSamePrescription(false);
                  setStep(3); // Go straight to prescription for one eye
                }
              }}
            >
              Continuar
            </button>
          </div>
        );

      case 2:
        return (
          <div className="contact-lens-content-panel">
            <div className="contact-lens-step-header">
              <button className="contact-lens-step-indicator" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Volver</button>
              <span className="contact-lens-step-indicator">Paso 2 de 4</span>
            </div>
            
            <h2 className="contact-lens-title">¿Tienes la misma graduación en ambos ojos?</h2>
            
            <div className="contact-lens-options-list" style={{ marginTop: '2rem' }}>
              <button 
                className="contact-lens-option-btn" 
                onClick={() => { setSamePrescription(true); setStep(3); }}
              >
                <div className="contact-lens-option-text">
                  <h3>Sí</h3>
                </div>
              </button>
              
              <button 
                className="contact-lens-option-btn" 
                onClick={() => { setSamePrescription(false); setStep(3); }}
              >
                <div className="contact-lens-option-text">
                  <h3>No</h3>
                </div>
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="contact-lens-content-panel">
            <div className="contact-lens-step-header">
              <button className="contact-lens-step-indicator" onClick={() => {
                if (quantityOD > 0 && quantityOS > 0) setStep(2);
                else setStep(1);
              }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Volver</button>
              <span className="contact-lens-step-indicator">Paso 3 de 4</span>
            </div>
            
            <h2 className="contact-lens-title">Ingresa tu receta</h2>
            
            <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
              <button 
                onClick={() => setShowRxGuide(!showRxGuide)}
                style={{ 
                  background: 'none', border: 'none', padding: 0, 
                  color: '#b48c36', fontSize: '12.5px', fontWeight: 600, 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' 
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
                  <RxGuide isToric={isToric} isMultifocal={isMultifocal} />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="cl-prescription-container" style={{ marginTop: '2rem' }}>
              <div className="cl-prescription-columns">
                {samePrescription ? (
                  renderPrescriptionForm('OD', 'Ambos ojos')
                ) : (
                  <>
                    {quantityOD > 0 && renderPrescriptionForm('OD', 'Ojo Derecho (OD)')}
                    {quantityOS > 0 && renderPrescriptionForm('OS', 'Ojo Izquierdo (OS)')}
                  </>
                )}
              </div>

              <button 
                className="cl-btn-primary" 
                disabled={!isPrescriptionComplete()}
                onClick={() => setStep(4)}
              >
                Continuar
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="contact-lens-content-panel">
            <div className="contact-lens-step-header">
              <button className="contact-lens-step-indicator" onClick={() => setStep(3)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Volver</button>
              <span className="contact-lens-step-indicator">Paso 4 de 4</span>
            </div>
            
            <h2 className="contact-lens-title">Resumen y Verificación</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Por último, si gustas puedes adjuntar una foto de tu receta para que nuestro equipo la valide.</p>
            
            <div 
              className="cl-file-upload" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} color="#1a4cd2" style={{ margin: '0 auto' }} />
              <p>{prescriptionPhotoFile ? prescriptionPhotoFile.name : 'Haz clic para subir foto de tu receta (Opcional)'}</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*,.pdf" 
              />
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <div className="config-success-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', marginBottom: '1rem' }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>¡Todo listo!</h3>
              <p style={{ color: '#64748b' }}>Tu pedido de lentes de contacto será procesado.</p>
              
              <button 
                className="cl-btn-primary" 
                onClick={handleComplete}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        );
    }
  };

  const totalQuantity = quantityOD + quantityOS;
  const totalPrice = (product?.price_incl_tax || 0) * (totalQuantity > 0 ? totalQuantity : 1);

  const getUsageType = () => {
    const n = productName;
    if (n.includes('1 DAY') || n.includes('DAILY') || n.includes('DIARIO') || n.includes('ONE DAY')) return 'Lentes de uso diario';
    if (n.includes('BIWEEKLY') || n.includes('QUINCENAL') || n.includes('OASYS')) return 'Lentes de uso quincenal';
    if (n.includes('MONTHLY') || n.includes('MENSUAL') || n.includes('ULTRA') || n.includes('AIR OPTIX') || n.includes('BIOFINITY')) return 'Lentes de uso mensual';
    if (n.includes('YEARLY') || n.includes('ANUAL') || n.includes('ANNUAL')) return 'Lentes de uso anual';
    return 'Lentes de Contacto';
  };

  return (
    <div className="contact-lens-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div 
        className="contact-lens-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <button className="contact-lens-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="contact-lens-summary-panel">
          <div className="contact-lens-summary-image-wrapper">
            <img 
              src={getProductImage()} 
              alt={product?.name} 
              className="contact-lens-summary-image" 
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = 'https://via.placeholder.com/300x200?text=Lente+de+Contacto';
              }}
            />
          </div>
          
          <span className="contact-lens-summary-brand">
            {product?.brand ? product.brand : (product?.name?.toUpperCase().includes('BIOTRUE') ? 'Bausch+Lomb' : 'Lentes de Contacto')}
          </span>
          <h3 className="contact-lens-summary-name">
            {toTitleCase(product?.name === 'LC-BIOTRUEONEDAY' ? 'Biotrue One Day' : (product?.name?.startsWith('LC-') ? product.name.substring(3).replace(/-/g, ' ') : (product?.name || '')))}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic', marginTop: '0.25rem' }}>{getUsageType()}</p>
          
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>
              Cantidad seleccionada:
            </p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              {quantityOD} {quantityOD === 1 ? 'caja' : 'cajas'} (OD) • {quantityOS} {quantityOS === 1 ? 'caja' : 'cajas'} (OS)
            </p>
          </div>

          <div className="contact-lens-summary-price">
            <span>Total Estimado</span>
            <span>${Math.round(totalPrice).toLocaleString('es-MX')}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: 'flex' }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
