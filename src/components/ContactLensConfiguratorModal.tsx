import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toTitleCase } from '../lib/format';
import { RxGuide } from './RxGuide';
import './ContactLensConfiguratorModal.css';
import { WPSelect } from './WPSelect';

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
  onComplete: (configData: any, checkoutNow: boolean) => void;
}

export default function ContactLensConfiguratorModal({ product, onClose, onComplete }: ContactLensConfiguratorModalProps) {
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [quantityOD, setQuantityOD] = useState(1);
  const [quantityOS, setQuantityOS] = useState(1);
  
  const [samePrescription, setSamePrescription] = useState<boolean>(true);
  const [showRxGuide, setShowRxGuide] = useState(false);
  
  const [prescriptionOD, setPrescriptionOD] = useState({ sph: '', cyl: '', axis: '', add: '' });
  const [prescriptionOS, setPrescriptionOS] = useState({ sph: '', cyl: '', axis: '', add: '' });
  const [prescriptionPending, setPrescriptionPending] = useState(false);
  
  const productName = (product?.name ? product.name.toString() : '').toUpperCase();
  const isToric = productName.includes('ASTIGMATISMO') || productName.includes('TORIC') || productName.includes('ASTIGMATISM');
  const isMultifocal = productName.includes('MULTIFOCAL') || productName.includes('PRESBICIA') || productName.includes('PRESBYOPIA');

  const getAvailableColors = () => {
    const n = productName;
    if (n.includes('AIR OPTIX')) return ['Gris Intenso (Sterling Gray)', 'Gris (Gray)', 'Verde Gema (Gemstone Green)', 'Verde (Green)', 'Azul Brillante (Brilliant Blue)', 'Azul (Blue)', 'Miel (Pure Hazel)', 'Café (Honey)'];
    if (n.includes('FRESHLOOK')) return ['Verde (Green)', 'Azul (Blue)', 'Gris (Gray)', 'Pure Hazel (Miel)'];
    if (n.includes('LUNARE')) return ['Blue (Azul)', 'Green (Verde)', 'Gray (Gris)', 'Hazel (Miel)', 'Dark Green (Verde Oscuro)', 'Light Blue (Azul Claro)', 'Violet (Violeta)'];
    if (n.includes('STARS') || n.includes('SOFLENS')) return ['Blue (Azul)', 'Dark Blue (Azul Oscuro)', 'Green (Verde)', 'Amazon Green (Verde Amazona)', 'Gray (Gris)', 'Hazel (Miel)'];
    return [];
  };

  const availableColors = useMemo(() => getAvailableColors(), [productName]);
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || '');

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors]);
  
  const [prescriptionPhotoFile, setPrescriptionPhotoFile] = useState<File | null>(null);

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

  // Memoize options to avoid recreating large arrays on every render
  const spmOptions = useMemo(() => {
    const opts = [];
    for (let i = 0.25; i <= 10; i += 0.25) {
      opts.push(`-${i.toFixed(2)}`);
      opts.push(`+${i.toFixed(2)}`);
    }
    return opts;
  }, []);

  const cylOptions = useMemo(() => {
    const opts = [];
    for (let i = -0.25; i >= -6; i -= 0.25) {
      opts.push(i.toFixed(2));
    }
    return opts;
  }, []);

  const axisOptions = useMemo(() => {
    const opts = [];
    for (let i = 10; i <= 180; i += 10) {
      opts.push(i.toString());
    }
    return opts;
  }, []);

  const addOptions = useMemo(() => {
    const opts = ['LOW', 'MED', 'HIGH'];
    for (let i = 0.75; i <= 3.50; i += 0.25) {
      opts.push(`+${i.toFixed(2)}`);
    }
    return opts;
  }, []);

  const changeStep = (newStep: number) => {
    setIsTransitioning(true);
    // Let the browser paint the spinner before heavy React transitions
    setTimeout(() => {
      setStep(newStep);
      setIsTransitioning(false);
    }, 10);
  };

  const isPrescriptionComplete = () => {
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

  const handleComplete = (checkoutNow: boolean) => {
    setIsTransitioning(true);
    // Simulating processing for checkout/adding
    setTimeout(() => {
      onComplete({
        ...product,
        contactLensConfig: {
          quantityOD,
          quantityOS,
          selectedColor,
          samePrescription,
          prescriptionOD: samePrescription ? prescriptionOD : prescriptionOD,
          prescriptionOS: samePrescription ? prescriptionOD : prescriptionOS,
          prescriptionPending,
          prescription_pending: prescriptionPending,
          hasPhoto: !!prescriptionPhotoFile
        }
      }, checkoutNow);
      setIsTransitioning(false);
    }, 10);
  };

  const renderPrescriptionForm = (eye: 'OD' | 'OS', label: string) => {
    const values = eye === 'OD' ? prescriptionOD : prescriptionOS;
    const setValues = eye === 'OD' ? setPrescriptionOD : setPrescriptionOS;

    return (
      <div className="cl-prescription-column">
        <h4>{label}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: samePrescription ? '1fr 1fr' : '1fr', gap: '0 16px' }}>
          <WPSelect 
            label="Esfera (SPH/PWR)"
            value={values.sph}
            options={spmOptions}
            onChange={(val: string) => setValues({ ...values, sph: val })}
            zeroValue="0.00"
          />

          {isToric && (
            <>
              <WPSelect 
                label="Cilindro (CYL)"
                value={values.cyl}
                options={cylOptions}
                onChange={(val: string) => setValues({ ...values, cyl: val })}
              />

              <WPSelect 
                label="Eje (Axis)"
                value={values.axis}
                options={axisOptions}
                onChange={(val: string) => setValues({ ...values, axis: val })}
              />
            </>
          )}

          {isMultifocal && (
            <WPSelect 
              label="Adición (ADD)"
              value={values.add}
              options={addOptions}
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
      </div>
    );
  };

  const renderStepContent = () => {
    if (isTransitioning) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', width: '100%' }}>
          <Loader2 className="spinner-animation" size={48} color="#1a4cd2" />
          <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Cargando...</p>
        </div>
      );
    }

    switch (step) {
      case 1:
        return (
          <div className="contact-lens-content-panel">
            <div className="contact-lens-step-header">
              <span className="contact-lens-step-indicator">Paso 1 de 3</span>
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

            {availableColors.length > 0 && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', backgroundColor: '#f8fafc' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                  🎨 Selecciona el color de tus lentes:
                </label>
                <select 
                  value={selectedColor} 
                  onChange={(e) => setSelectedColor(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', backgroundColor: '#ffffff' }}
                >
                  {availableColors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <button 
              className="cl-btn-primary" 
              style={{ marginTop: '2rem' }}
              disabled={quantityOD === 0 && quantityOS === 0}
              onClick={() => changeStep(2)}
            >
              Continuar
            </button>
          </div>
        );

      case 2:
        return (
          <div className="contact-lens-content-panel">
            <div className="contact-lens-step-header">
              <button className="contact-lens-step-indicator" onClick={() => changeStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Volver</button>
              <span className="contact-lens-step-indicator">Paso 2 de 3</span>
            </div>
            
            <h2 className="contact-lens-title">Ingresa tu receta</h2>
            
            <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
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

            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600, color: '#0f172a' }}>
                <input 
                  type="checkbox" 
                  checked={samePrescription}
                  onChange={(e) => setSamePrescription(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#1a4cd2' }}
                />
                Tengo la misma graduación en ambos ojos
              </label>
            </div>
            
            <div className="cl-prescription-container">
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

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  className="cl-btn-primary" 
                  disabled={!isPrescriptionComplete()}
                  onClick={() => changeStep(3)}
                  style={{ flex: 1 }}
                >
                  Continuar
                </button>
                <button 
                  className="cl-btn-secondary" 
                  onClick={() => {
                    setPrescriptionOD({ sph: 'NA', cyl: 'NA', axis: 'NA', add: 'NA' });
                    setPrescriptionOS({ sph: 'NA', cyl: 'NA', axis: 'NA', add: 'NA' });
                    setPrescriptionPending(true);
                    changeStep(3);
                  }}
                  style={{ flex: 1 }}
                >
                  No la tengo ahora (Enviar después)
                </button>
              </div>
              <div style={{ marginTop: '16px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}><em>Fabricamos según la receta que nos proporcionas; su exactitud es responsabilidad de quien la emitió.</em></div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="contact-lens-content-panel">
            <div className="contact-lens-step-header">
              <button className="contact-lens-step-indicator" onClick={() => {
                  setPrescriptionPending(false);
                  changeStep(2);
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Volver</button>
              <span className="contact-lens-step-indicator">Paso 3 de 3</span>
            </div>
            
            <h2 className="contact-lens-title">Resumen y Verificación</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Por último, si gustas puedes adjuntar una foto de tu receta para que nuestro equipo la valide.</p>

            {prescriptionPending && (
              <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fdba74', borderRadius: '8px', padding: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#c2410c' }}>
                <span style={{ fontSize: '1.25rem' }}>📋</span>
                <span style={{ fontWeight: '600' }}>Receta pendiente — la enviarás por WhatsApp</span>
              </div>
            )}

            
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
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>Tu pedido de lentes de contacto será procesado.</p>
              
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                <p style={{ fontSize: '0.875rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                  <strong>🔒 Compra segura:</strong> nosotros validamos tu graduación; todos los pedidos los revisa nuestro optometrista. Si tu receta no procede, te reembolsamos al 100%.
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  className="cl-btn-primary" 
                  onClick={() => handleComplete(true)}
                >
                  Comprar ahora
                </button>
                <button 
                  className="cl-btn-secondary" 
                  onClick={() => handleComplete(false)}
                >
                  Agregar y seguir comprando
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  const totalQuantity = quantityOD + quantityOS;
  const totalPrice = (product?.price_incl_tax || 0) * (totalQuantity > 0 ? totalQuantity : 1);

  const isSinglePiece = productName.includes('LUNARE') || productName.includes('STARS') || productName.includes('SENSE') || productName.includes('LIBERTI') || productName.includes('OPTIMA 38');

  const getUsageType = () => {
    const n = productName;
    if (n.includes('COLOR') || n.includes('LUNARE') || n.includes('STARS') || n.includes('AIR OPTIX COLORS') || n.includes('FRESHLOOK')) {
      if (n.includes('AIR OPTIX')) return 'Formato: Caja con 2 lentes · Duración: 1 mes de uso por lente';
      if (n.includes('FRESHLOOK')) return 'Formato: Caja con 10 lentes diarios · Uso ocasional / eventos';
      if (n.includes('LUNARE') || n.includes('STARS')) return 'Formato: Lente Individual (Pieza) · Duración: 1 año de uso por lente';
      return 'Formato: Lentes de Contacto Cosméticos de Color';
    }
    if (n.includes('SENSE') || n.includes('ANUAL') || n.includes('LIBERTI') || n.includes('OPTIMA 38')) return 'Formato: Lente Individual (Pieza) · Duración: 1 año de uso por lente';
    if (n.includes('1 DAY') || n.includes('DAILY') || n.includes('DIARIO') || n.includes('ONE DAY')) return 'Formato: Caja con 30 lentes diarios · Uso diario';
    if (n.includes('BIWEEKLY') || n.includes('QUINCENAL') || n.includes('OASYS')) return 'Formato: Caja con 6 lentes (Uso quincenal)';
    if (n.includes('MONTHLY') || n.includes('MENSUAL') || n.includes('ULTRA') || n.includes('AIR OPTIX') || n.includes('BIOFINITY')) return 'Formato: Caja con 6 lentes (Uso mensual)';
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
          <p style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 600, marginTop: '0.25rem' }}>{getUsageType()}</p>
          
          <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>
              Cantidad seleccionada:
            </p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              {quantityOD} {quantityOD === 1 ? (isSinglePiece ? 'lente individual' : 'caja') : (isSinglePiece ? 'lentes individuales' : 'cajas')} (OD) • {quantityOS} {quantityOS === 1 ? (isSinglePiece ? 'lente individual' : 'caja') : (isSinglePiece ? 'lentes individuales' : 'cajas')} (OS)
            </p>
          </div>

          <div className="contact-lens-summary-price">
            <span>Total Estimado</span>
            <span>${Math.round(totalPrice).toLocaleString('es-MX')}</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', overflowY: 'auto' }}>
          {renderStepContent()}
        </div>

      </motion.div>
    </div>
  );
}
