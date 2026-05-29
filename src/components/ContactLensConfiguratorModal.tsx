import React, { useState, useRef } from 'react';
import { X, CheckCircle, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface ContactLensConfiguratorModalProps {
  product: any;
  onClose: () => void;
  onComplete: (configData: any) => void;
}

export default function ContactLensConfiguratorModal({ product, onClose, onComplete }: ContactLensConfiguratorModalProps) {
  const [step, setStep] = useState(1);
  const [samePrescription, setSamePrescription] = useState<boolean | null>(null);
  
  const [prescriptionOD, setPrescriptionOD] = useState({ sph: '', cyl: '', axis: '' });
  const [prescriptionOS, setPrescriptionOS] = useState({ sph: '', cyl: '', axis: '' });
  
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
    const opts = [''];
    for (let i = -10; i <= 10; i += 0.25) {
      if (i !== 0) opts.push(i > 0 ? `+${i.toFixed(2)}` : i.toFixed(2));
      else opts.push('0.00');
    }
    return opts;
  };

  const getCylOptions = () => {
    const opts = [''];
    for (let i = -0.25; i >= -6; i -= 0.25) {
      opts.push(i.toFixed(2));
    }
    return opts;
  };

  const getAxisOptions = () => {
    const opts = [''];
    for (let i = 10; i <= 180; i += 10) {
      opts.push(i.toString());
    }
    return opts;
  };

  const isPrescriptionComplete = () => {
    if (samePrescription === null) return false;
    if (samePrescription) {
      return prescriptionOD.sph !== '' && prescriptionOD.cyl !== '' && prescriptionOD.axis !== '';
    } else {
      return prescriptionOD.sph !== '' && prescriptionOD.cyl !== '' && prescriptionOD.axis !== '' &&
             prescriptionOS.sph !== '' && prescriptionOS.cyl !== '' && prescriptionOS.axis !== '';
    }
  };

  const handleComplete = async () => {
    setIsSending(true);
    try {
      const formData = new FormData();
      
      const configData = {
        isContactLens: true,
        productName: product?.name,
        productPrice: product?.price_incl_tax || 0,
        samePrescription,
        prescriptionOD: samePrescription ? prescriptionOD : prescriptionOD,
        prescriptionOS: samePrescription ? prescriptionOD : prescriptionOS,
        baseCurve: '8.6',
        diameter: '14.5'
      };

      formData.append('config', JSON.stringify(configData));

      if (prescriptionPhotoFile) {
        formData.append('prescriptionPhotoFile', prescriptionPhotoFile);
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
      onComplete({
        ...product,
        contactLensConfig: {
          samePrescription,
          prescriptionOD: samePrescription ? prescriptionOD : prescriptionOD,
          prescriptionOS: samePrescription ? prescriptionOD : prescriptionOS,
          hasPhoto: !!prescriptionPhotoFile
        }
      });
    }
  };

  const renderPrescriptionForm = (eye: 'OD' | 'OS', label: string) => {
    const values = eye === 'OD' ? prescriptionOD : prescriptionOS;
    const setValues = eye === 'OD' ? setPrescriptionOD : setPrescriptionOS;

    return (
      <div className="cl-prescription-column">
        <h4>{label}</h4>
        
        <div className="cl-form-group">
          <label>Esfera (SPH/PWR/D)</label>
          <select 
            className="cl-form-select"
            value={values.sph}
            onChange={(e) => setValues({ ...values, sph: e.target.value })}
          >
            {getSpmOptions().map(opt => (
              <option key={opt} value={opt}>{opt || 'Selecciona'}</option>
            ))}
          </select>
        </div>

        <div className="cl-form-group">
          <label>Cilindro (CYL)</label>
          <select 
            className="cl-form-select"
            value={values.cyl}
            onChange={(e) => setValues({ ...values, cyl: e.target.value })}
          >
            {getCylOptions().map(opt => (
              <option key={opt} value={opt}>{opt || 'Selecciona'}</option>
            ))}
          </select>
        </div>

        <div className="cl-form-group">
          <label>Eje (Axis)</label>
          <select 
            className="cl-form-select"
            value={values.axis}
            onChange={(e) => setValues({ ...values, axis: e.target.value })}
          >
            {getAxisOptions().map(opt => (
              <option key={opt} value={opt}>{opt || 'Selecciona'}</option>
            ))}
          </select>
        </div>

        <div className="cl-form-group">
          <label>Curva Base (BC)</label>
          <input type="text" className="cl-form-input" value="8.6" readOnly />
        </div>

        <div className="cl-form-group">
          <label>Diámetro (DIA)</label>
          <input type="text" className="cl-form-input" value="14.5" readOnly />
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
              <span className="contact-lens-step-indicator">Paso 1 de 3</span>
            </div>
            
            <h2 className="contact-lens-title">¿Tienes la misma graduación en ambos ojos?</h2>
            
            <div className="contact-lens-options-list" style={{ marginTop: '2rem' }}>
              <button 
                className="contact-lens-option-btn" 
                onClick={() => { setSamePrescription(true); setStep(2); }}
              >
                <div className="contact-lens-option-text">
                  <h3>Sí</h3>
                </div>
              </button>
              
              <button 
                className="contact-lens-option-btn" 
                onClick={() => { setSamePrescription(false); setStep(2); }}
              >
                <div className="contact-lens-option-text">
                  <h3>No</h3>
                </div>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="contact-lens-content-panel">
            <div className="contact-lens-step-header">
              <button className="contact-lens-step-indicator" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Volver</button>
              <span className="contact-lens-step-indicator">Paso 2 de 3</span>
            </div>
            
            <h2 className="contact-lens-title">Ingresa tu receta</h2>
            
            <div className="cl-prescription-container" style={{ marginTop: '2rem' }}>
              <div className="cl-prescription-columns">
                {samePrescription ? (
                  renderPrescriptionForm('OD', 'Ambos ojos')
                ) : (
                  <>
                    {renderPrescriptionForm('OD', 'Ojo Derecho (OD)')}
                    {renderPrescriptionForm('OS', 'Ojo Izquierdo (OS)')}
                  </>
                )}
              </div>

              <button 
                className="cl-btn-primary" 
                disabled={!isPrescriptionComplete()}
                onClick={() => setStep(3)}
              >
                Continuar
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="contact-lens-content-panel">
            <div className="contact-lens-step-header">
              <button className="contact-lens-step-indicator" onClick={() => setStep(2)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Volver</button>
              <span className="contact-lens-step-indicator">Paso 3 de 3</span>
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
                disabled={isSending}
                style={{ opacity: isSending ? 0.7 : 1 }}
              >
                {isSending ? 'Enviando...' : 'Continuar por WhatsApp'}
              </button>
            </div>
          </div>
        );
    }
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
          
          <span className="contact-lens-summary-brand">{product?.brand || 'ACUVUE'}</span>
          <h3 className="contact-lens-summary-name">{product?.name}</h3>
          
          {step > 1 && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                1 caja por ojo
              </p>
            </div>
          )}

          <div className="contact-lens-summary-price">
            <span>Total Estimado</span>
            <span>${Math.round(product?.price_incl_tax || 0).toLocaleString('es-MX')}</span>
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
