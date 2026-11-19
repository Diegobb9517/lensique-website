import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { toTitleCase } from '../lib/format';
import { RxGuide } from './RxGuide';
import './ContactLensConfiguratorModal.css';
import contactLensesImg from '../assets/contact_lenses.png';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://lensique-pos.onrender.com';
const resolveImageUrl = (url: any, fallback?: any) => {
  const isInvalid = (val: any) => !val || val === 'undefined' || val === 'null' || val === '';
  if (!isInvalid(url)) {
    const targetUrl = String(url).trim();
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://') || targetUrl.startsWith('data:') || targetUrl.startsWith('/assets/')) {
      return targetUrl;
    }
    const cleanUrl = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
    return `${API_BASE}${cleanUrl}`;
  }
  if (!isInvalid(fallback)) {
    const targetFallback = String(fallback).trim();
    if (targetFallback.startsWith('http://') || targetFallback.startsWith('https://') || targetFallback.startsWith('data:') || targetFallback.startsWith('/assets/')) {
      return targetFallback;
    }
    const cleanUrl = targetFallback.startsWith('/') ? targetFallback : `/${targetFallback}`;
    return `${API_BASE}${cleanUrl}`;
  }
  return '';
};

// ==========================================
// PRECIOS Y MSI (Sin recargos adicionales sobre POS)
// ==========================================
export const MP_BASE = 0.04;
export const MSI_RATE3 = 0.0469;
export const MSI_RATE6 = 0.0769;
export const MSI_T3 = 2500;
export const MSI_T6 = 4000;

export function charm(n: number): number {
  return n;
}

export function priceWithMP(net: number): { price: number; n: number; monthly: number } {
  const n = (net >= MSI_T6) ? 6 : (net >= MSI_T3) ? 3 : 0;
  const monthly = n > 0 ? Math.round(net / n) : net;
  return { price: net, n, monthly };
}


export interface ContactLensSpecs {
  bc: string;
  dia: string;
  bcOptions: string[];
  isMultipleBc: boolean;
}

export function getContactLensSpecs(product: any): ContactLensSpecs {
  // 1. Si viene directamente del producto en POS / API
  const prodBc = product?.base_curve || product?.contact_bc || product?.bc;
  const prodDia = product?.diameter || product?.contact_dia || product?.dia;

  if (prodBc && prodDia) {
    const cleanBc = String(prodBc).trim();
    const cleanDia = String(prodDia).trim();
    return {
      bc: cleanBc,
      dia: cleanDia,
      bcOptions: [cleanBc],
      isMultipleBc: false
    };
  }

  // 2. Diccionario de respaldo por modelo de lente
  const name = String(product?.name || '').toUpperCase();
  const sku = String(product?.sku || '').toUpperCase();

  // Lunare / Soflens Stars
  if (name.includes('LUNARE') || name.includes('STARS') || sku.includes('LUNARE')) {
    return { bc: '8.7', dia: '14.1', bcOptions: ['8.7'], isMultipleBc: false };
  }
  // Acuvue Oasys Astigmatismo
  if (name.includes('OASYS') && (name.includes('ASTIGMATIS') || name.includes('TORIC'))) {
    return { bc: '8.6', dia: '14.5', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Acuvue 1 Day Moist Astigmatismo
  if (name.includes('MOIST') && (name.includes('ASTIGMATIS') || name.includes('TORIC'))) {
    return { bc: '8.5', dia: '14.5', bcOptions: ['8.5'], isMultipleBc: false };
  }
  // Acuvue Vita Toric
  if (name.includes('VITA') && (name.includes('ASTIGMATIS') || name.includes('TORIC'))) {
    return { bc: '8.6', dia: '14.5', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Acuvue Oasys 1-Day HydraLuxe
  if (name.includes('HYDRALUXE') || (name.includes('OASYS') && name.includes('1 DAY'))) {
    return { bc: '8.5', dia: '14.3', bcOptions: ['8.5'], isMultipleBc: false };
  }
  // Acuvue Oasys
  if (name.includes('OASYS') || sku.includes('OASYS')) {
    return { bc: '8.4', dia: '14.0', bcOptions: ['8.4'], isMultipleBc: false };
  }
  // 1-Day Acuvue Moist
  if (name.includes('MOIST') || sku.includes('MOIST')) {
    return { bc: '8.5', dia: '14.2', bcOptions: ['8.5'], isMultipleBc: false };
  }
  // Acuvue 2
  if (name.includes('ACUVUE 2') || sku.includes('ACUVUE2')) {
    return { bc: '8.7', dia: '14.0', bcOptions: ['8.7'], isMultipleBc: false };
  }
  // Biofinity Toric / XR Toric / Multifocal Toric
  if (name.includes('BIOFINITY') && (name.includes('TORIC') || name.includes('ASTIGMATIS'))) {
    return { bc: '8.7', dia: '14.5', bcOptions: ['8.7'], isMultipleBc: false };
  }
  // Biofinity Esférico / XR / Energys / Multifocal
  if (name.includes('BIOFINITY') || name.includes('BIOINFINITY')) {
    return { bc: '8.6', dia: '14.0', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Bausch + Lomb Ultra Toric
  if (name.includes('ULTRA') && (name.includes('TORIC') || name.includes('ASTIGMATIS'))) {
    return { bc: '8.6', dia: '14.5', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Bausch + Lomb Ultra
  if (name.includes('ULTRA')) {
    return { bc: '8.5', dia: '14.2', bcOptions: ['8.5'], isMultipleBc: false };
  }
  // Biotrue ONEday Astigmatismo
  if (name.includes('BIOTRUE') && (name.includes('ASTIGMATIS') || name.includes('TORIC'))) {
    return { bc: '8.4', dia: '14.5', bcOptions: ['8.4'], isMultipleBc: false };
  }
  // Biotrue ONEday
  if (name.includes('BIOTRUE')) {
    return { bc: '8.6', dia: '14.2', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Clariti 1 Day Toric
  if (name.includes('CLARITI') && (name.includes('TORIC') || name.includes('ASTIGMATIS'))) {
    return { bc: '8.6', dia: '14.3', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Clariti 1 Day / Multifocal
  if (name.includes('CLARITI')) {
    return { bc: '8.6', dia: '14.1', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Air Optix Night & Day
  if (name.includes('NIGHT & DAY') || name.includes('NIGHT AND DAY')) {
    return { bc: '8.6', dia: '13.8', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Air Optix Colors / Plus HydraGlyde
  if (name.includes('AIR OPTIX')) {
    return { bc: '8.6', dia: '14.2', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Dailies Total 1
  if (name.includes('DAILIES TOTAL')) {
    return { bc: '8.5', dia: '14.1', bcOptions: ['8.5'], isMultipleBc: false };
  }
  // Dailies AquaComfort Plus
  if (name.includes('DAILIES') || name.includes('DALIES')) {
    return { bc: '8.7', dia: '14.0', bcOptions: ['8.7'], isMultipleBc: false };
  }
  // Soflens 59
  if (name.includes('SOFLENS 59') || sku.includes('SOFLENS59')) {
    return { bc: '8.6', dia: '14.2', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Soflens Toric
  if (name.includes('SOFLENS') && (name.includes('TORIC') || name.includes('ASTIGMATIS'))) {
    return { bc: '8.5', dia: '14.5', bcOptions: ['8.5'], isMultipleBc: false };
  }
  // Freshlook
  if (name.includes('FRESHLOOK')) {
    return { bc: '8.6', dia: '13.8', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Biomedics 55 / Now
  if (name.includes('BIOMEDICS')) {
    return { bc: '8.6', dia: '14.2', bcOptions: ['8.6'], isMultipleBc: false };
  }
  // Optima 38
  if (name.includes('OPTIMA 38')) {
    return { bc: '8.7', dia: '14.0', bcOptions: ['8.7'], isMultipleBc: false };
  }
  // Sense / Liberti / Confiable / Lumilent
  if (name.includes('SENSE') || name.includes('LIBERTI') || name.includes('CONFIABLE') || name.includes('LUMILENT')) {
    const isT = name.includes('TORIC') || name.includes('ASTIGMATIS');
    return { bc: '8.6', dia: isT ? '14.2' : '14.0', bcOptions: ['8.6'], isMultipleBc: false };
  }

  // Fallback general estándar
  return { bc: '8.6', dia: '14.2', bcOptions: ['8.6'], isMultipleBc: false };
}

interface SphereDropdownProps {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (val: string) => void;
}

function SphereDropdown({ value, disabled = false, placeholder = 'Elige esfera', onChange }: SphereDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getModeFromVal = (val: string) => {
    if (val === '0.00') return 'neutro';
    if (val && val.startsWith('+')) return 'hyperopia';
    return 'myopia';
  };

  const [mode, setMode] = useState<'neutro' | 'myopia' | 'hyperopia'>(() => getModeFromVal(value));

  useEffect(() => {
    if (value) {
      setMode(getModeFromVal(value));
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const negativePowers = useMemo(() => {
    const list: string[] = [];
    for (let p = -0.25; p >= -6.00; p -= 0.25) list.push(p.toFixed(2));
    for (let p = -6.50; p >= -12.00; p -= 0.50) list.push(p.toFixed(2));
    return list;
  }, []);

  const positivePowers = useMemo(() => {
    const list: string[] = [];
    for (let p = 0.25; p <= 4.00; p += 0.25) list.push(`+${p.toFixed(2)}`);
    for (let p = 4.50; p <= 8.00; p += 0.50) list.push(`+${p.toFixed(2)}`);
    return list;
  }, []);

  const displayLabel = useMemo(() => {
    if (!value) return placeholder;
    if (value === '0.00') return '0.00 (Neutro)';
    return value;
  }, [value, placeholder]);

  return (
    <div className={`cl-sph-selector-wrap ${disabled ? 'disabled' : ''}`} ref={containerRef}>
      <button
        type="button"
        className={`cl-sph-trigger ${isOpen ? 'open' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        disabled={disabled}
      >
        <span className="cl-sph-trigger-text">{displayLabel}</span>
        <span className="cl-sph-trigger-arrow">{isOpen ? '▲' : '▾'}</span>
      </button>

      {isOpen && (
        <div className="cl-sph-popover">
          <div className="cl-sph-tabs">
            <button
              type="button"
              className={`cl-sph-tab ${mode === 'neutro' ? 'active' : ''}`}
              onClick={() => {
                setMode('neutro');
                onChange('0.00');
                setIsOpen(false);
              }}
            >
              0.00 Neutro
            </button>
            <button
              type="button"
              className={`cl-sph-tab ${mode === 'myopia' ? 'active' : ''}`}
              onClick={() => setMode('myopia')}
            >
              − Miopía
            </button>
            <button
              type="button"
              className={`cl-sph-tab ${mode === 'hyperopia' ? 'active' : ''}`}
              onClick={() => setMode('hyperopia')}
            >
              + Hipermetropía
            </button>
          </div>

          {mode === 'neutro' && (
            <div className="cl-sph-neutro-content">
              <button
                type="button"
                className={`cl-sph-option ${value === '0.00' ? 'selected' : ''}`}
                onClick={() => {
                  onChange('0.00');
                  setIsOpen(false);
                }}
              >
                <div className="cl-sph-option-info">
                  <span className="cl-sph-val">0.00</span>
                  <span className="cl-sph-desc">Sin graduación · Solo cosmético</span>
                </div>
                {value === '0.00' && <span className="cl-sph-check">✓</span>}
              </button>
              <p className="cl-sph-hint">Ideal si solo buscas el tono cosmético de color o no requieres aumento.</p>
            </div>
          )}

          {mode === 'myopia' && (
            <div className="cl-sph-scroll-list">
              <div className="cl-sph-list-header">Miopía (Ver de lejos)</div>
              {negativePowers.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`cl-sph-option ${value === p ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(p);
                    setIsOpen(false);
                  }}
                >
                  <span className="cl-sph-val">{p}</span>
                  {value === p && <span className="cl-sph-check">✓</span>}
                </button>
              ))}
            </div>
          )}

          {mode === 'hyperopia' && (
            <div className="cl-sph-scroll-list">
              <div className="cl-sph-list-header">Hipermetropía (Ver de cerca)</div>
              {positivePowers.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`cl-sph-option ${value === p ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(p);
                    setIsOpen(false);
                  }}
                >
                  <span className="cl-sph-val">{p}</span>
                  {value === p && <span className="cl-sph-check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ContactLensConfiguratorModalProps {
  product: any;
  onClose: () => void;
  onComplete: (configData: any, checkoutNow: boolean) => void;
}

export default function ContactLensConfiguratorModal({ product, onClose, onComplete }: ContactLensConfiguratorModalProps) {
  const [step, setStep] = useState(1);
  
  // Step 1: Cantidad por ojo
  const [od, setOd] = useState(1);
  const [oi, setOi] = useState(1);
  const [odOn, setOdOn] = useState(true);
  const [oiOn, setOiOn] = useState(true);

  // Step 2: Graduación
  const [tab, setTab] = useState<'rx' | 'photo' | 'later'>('rx');
  const [samePrescription, setSamePrescription] = useState<boolean>(true);
  const [showRxGuide, setShowRxGuide] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const specs = useMemo(() => getContactLensSpecs(product), [product]);
  const defaultBc = specs.bc || specs.bcOptions[0] || '8.6';
  const defaultDia = specs.dia || '14.2';

  const [prescriptionOD, setPrescriptionOD] = useState({ sph: '', bc: defaultBc, dia: defaultDia, cyl: '', axis: '', add: '' });
  const [prescriptionOS, setPrescriptionOS] = useState({ sph: '', bc: defaultBc, dia: defaultDia, cyl: '', axis: '', add: '' });

  useEffect(() => {
    setPrescriptionOD(prev => ({
      ...prev,
      bc: defaultBc,
      dia: defaultDia
    }));
    setPrescriptionOS(prev => ({
      ...prev,
      bc: defaultBc,
      dia: defaultDia
    }));
  }, [defaultBc, defaultDia]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const productName = (product?.name ? product.name.toString() : '').toUpperCase();
  const isToric = productName.includes('ASTIGMATISMO') || productName.includes('TORIC') || productName.includes('ASTIGMATISM');
  const isMultifocal = productName.includes('MULTIFOCAL') || productName.includes('PRESBICIA') || productName.includes('PRESBYOPIA');

  // Colores para cosméticos
  const availableColors = useMemo(() => {
    const n = productName;
    if (n.includes('AIR OPTIX')) return ['Gris Intenso (Sterling Gray)', 'Gris (Gray)', 'Verde Gema (Gemstone Green)', 'Verde (Green)', 'Azul Brillante (Brilliant Blue)', 'Azul (Blue)', 'Miel (Pure Hazel)', 'Café (Honey)'];
    if (n.includes('FRESHLOOK')) return ['Verde (Green)', 'Azul (Blue)', 'Gris (Gray)', 'Pure Hazel (Miel)'];
    if (n.includes('LUNARE')) return ['Blue (Azul)', 'Green (Verde)', 'Gray (Gris)', 'Hazel (Miel)', 'Dark Green (Verde Oscuro)', 'Light Blue (Azul Claro)', 'Violet (Violeta)'];
    if (n.includes('STARS') || n.includes('SOFLENS')) return ['Blue (Azul)', 'Dark Blue (Azul Oscuro)', 'Green (Verde)', 'Amazon Green (Verde Amazona)', 'Gray (Gris)', 'Hazel (Miel)'];
    return [];
  }, [productName]);

  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || '');

  useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      setValidationError(null);
    }
  };

  const cleanName = useMemo(() => {
    let n = product?.name || 'Lentes de contacto';
    if (n === 'LC-BIOTRUEONEDAY') return 'Biotrue ONEday';
    if (n.startsWith('LC-')) n = n.substring(3).replace(/-/g, ' ');
    return toTitleCase(n);
  }, [product]);

  const getUsageType = () => {
    const n = productName;
    if (n.includes('COLOR') || n.includes('LUNARE') || n.includes('STARS') || n.includes('AIR OPTIX COLORS') || n.includes('FRESHLOOK')) {
      if (n.includes('AIR OPTIX')) return 'Caja con 2 lentes · uso mensual por lente';
      if (n.includes('FRESHLOOK')) return 'Caja con 10 lentes · uso diario';
      if (n.includes('LUNARE') || n.includes('STARS')) return 'Lente individual · uso anual';
      return 'Lentes de contacto cosméticos de color';
    }
    if (n.includes('SENSE') || n.includes('ANUAL') || n.includes('LIBERTI') || n.includes('OPTIMA 38')) return 'Lente individual · uso anual';
    if (n.includes('1 DAY') || n.includes('DAILY') || n.includes('DIARIO') || n.includes('ONE DAY')) return 'Caja con 30 lentes · uso diario';
    if (n.includes('BIWEEKLY') || n.includes('QUINCENAL') || n.includes('OASYS')) return 'Caja con 6 lentes · uso quincenal';
    if (n.includes('MONTHLY') || n.includes('MENSUAL') || n.includes('ULTRA') || n.includes('AIR OPTIX') || n.includes('BIOFINITY')) return 'Caja con 6 lentes · uso mensual';
    return 'Caja con 6 lentes · uso mensual';
  };

  const getProductImage = () => {
    if (!product) return contactLensesImg;

    if (product.displayImage) {
      const resolved = resolveImageUrl(product.displayImage, contactLensesImg);
      if (resolved) return resolved;
    }

    let images = product.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        images = [];
      }
    }

    if (Array.isArray(images) && images.length > 0) {
      const first = images[0];
      const imgCandidate = typeof first === 'string' ? first : (first?.image_url || first?.url || first?.src || first?.image);
      if (imgCandidate) {
        const resolved = resolveImageUrl(imgCandidate, contactLensesImg);
        if (resolved) return resolved;
      }
    }

    if (product.image_url) {
      const resolved = resolveImageUrl(product.image_url, contactLensesImg);
      if (resolved) return resolved;
    }

    if (product.image) {
      const resolved = resolveImageUrl(product.image, contactLensesImg);
      if (resolved) return resolved;
    }

    return contactLensesImg;
  };

  const cylOptions = useMemo(() => {
    const opts = [{ value: '', label: 'CYL' }];
    ['-0.75', '-1.25', '-1.75', '-2.25', '-2.75', '-0.50', '-1.00', '-1.50', '-2.00', '-2.50'].forEach(v => {
      opts.push({ value: v, label: v });
    });
    return opts;
  }, []);

  const axisOptions = useMemo(() => {
    const opts = [{ value: '', label: 'Eje' }];
    for (let a = 10; a <= 180; a += 10) {
      opts.push({ value: String(a), label: `${a}°` });
    }
    return opts;
  }, []);

  const addOptions = useMemo(() => {
    const opts = [{ value: '', label: 'ADD' }];
    ['LOW', 'MED', 'HIGH', '+0.75', '+1.00', '+1.25', '+1.50', '+1.75', '+2.00', '+2.25', '+2.50'].forEach(v => {
      opts.push({ value: v, label: v });
    });
    return opts;
  }, []);

  // Precios y total con Mercado Pago + MSI
  const boxPrice = useMemo(() => {
    return Number(product?.price_incl_tax || product?.price || 1200);
  }, [product]);

  const totalBoxes = useMemo(() => {
    return (odOn ? od : 0) + (oiOn ? oi : 0);
  }, [odOn, oiOn, od, oi]);

  const totalPricing = useMemo(() => {
    const net = boxPrice * Math.max(1, totalBoxes);
    return priceWithMP(net);
  }, [boxPrice, totalBoxes]);

  // Completar y enviar al carrito
  const handleAddToCart = () => {
    const configData = {
      ...product,
      contactLensConfig: {
        quantityOD: odOn ? od : 0,
        quantityOS: oiOn ? oi : 0,
        selectedColor,
        samePrescription,
        tab,
        rxMethod: tab === 'rx' ? 'manual' : (tab === 'photo' ? 'photo' : 'later'),
        prescriptionOD: tab === 'rx' 
          ? { ...prescriptionOD, bc: defaultBc, dia: defaultDia }
          : { sph: tab === 'later' ? 'NA' : 'FOTO', bc: defaultBc, dia: defaultDia, cyl: '', axis: '', add: '' },
        prescriptionOS: tab === 'rx' 
          ? (samePrescription ? { ...prescriptionOD, bc: defaultBc, dia: defaultDia } : { ...prescriptionOS, bc: defaultBc, dia: defaultDia }) 
          : { sph: tab === 'later' ? 'NA' : 'FOTO', bc: defaultBc, dia: defaultDia, cyl: '', axis: '', add: '' },
        prescriptionPending: tab === 'later',
        hasPhoto: tab === 'photo' && !!photoFile,
        photoFileName: photoFile ? photoFile.name : null,
        totalPrice: totalPricing.price,
        monthly: totalPricing.monthly,
        msi: totalPricing.n
      }
    };
    onComplete(configData, true);
  };

  const isSingle = getUsageType().includes('individual');
  const unit = isSingle ? 'lente' : 'caja';
  const unitPlural = isSingle ? 'lentes' : 'cajas';

  const odText = odOn ? `${od} ${od === 1 ? unit : unitPlural} (OD)` : '—';
  const oiText = oiOn ? `${oi} ${oi === 1 ? unit : unitPlural} (OI)` : '—';

  return (
    <div 
      className="cl-modal-overlay" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cl-modal-container">
        {/* Encabezado compacto móvil (fijo arriba en celular) */}
        <div className="cl-mobile-topbar">
          <div className="cl-mobile-topbar-info">
            <span className="cl-mobile-topbar-title">{cleanName}</span>
            <span className="cl-mobile-topbar-total">
              ${totalPricing.price.toLocaleString('es-MX')}
              {totalPricing.n > 0 && (
                <span className="cl-mobile-topbar-msi"> · ${totalPricing.monthly.toLocaleString('es-MX')}/mes a {totalPricing.n} MSI</span>
              )}
            </span>
          </div>
          <button className="cl-mobile-topbar-close" onClick={onClose} aria-label="Cerrar modal">
            <X size={20} />
          </button>
        </div>
        <button className="cl-modal-close" onClick={onClose} aria-label="Cerrar modal">
          <X size={18} />
        </button>

        <div className="cl-wrap">
          {/* PANEL IZQUIERDO (Fijo, centrado verticalmente) */}
          <div className="cl-left">
            <div className="cl-pbox">
              <img 
                src={getProductImage()} 
                alt={cleanName} 
                className="cl-pbox-img"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== contactLensesImg) {
                    target.src = contactLensesImg;
                  }
                }}
              />
            </div>

            <div className="cl-cat">Lentes de contacto</div>
            <h2 className="cl-pname">{cleanName}</h2>
            <p className="cl-pform">{getUsageType()}</p>
            <div className="cl-divider"></div>

            <div className="cl-qsel">
              Cantidad: <b>{odText} · {oiText}</b>
            </div>

            <div className="cl-total">
              <span className="cl-tl">Total estimado</span>
              <span className="cl-tv">${totalPricing.price.toLocaleString('es-MX')}</span>
              {totalPricing.n > 0 && (
                <span className="cl-msi">
                  o ${totalPricing.monthly.toLocaleString('es-MX')}/mes a {totalPricing.n} MSI
                </span>
              )}
            </div>

            <div className="cl-guar">
              <span>🔒</span>
              <div>
                <b>Garantía Lensique:</b> devolución de cajas selladas hasta 15 días · validación por optometrista.{' '}
                <a href="/devoluciones" target="_blank" rel="noopener noreferrer">Ver política</a>
              </div>
            </div>

            <a 
              className="cl-wa" 
              href={`https://wa.me/523316929111?text=${encodeURIComponent(`Hola, tengo una duda sobre ${cleanName}.`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => { if (typeof window !== 'undefined' && (window as any).fbq) (window as any).fbq('track', 'Lead'); }}
            >
              <span className="cl-d"></span> ¿Dudas? Escríbenos por WhatsApp
            </a>
          </div>

          {/* PANEL DERECHO (Solo este scrollea internamente si hace falta) */}
          <div className="cl-right" id="cl-right-panel">
            <div className="cl-right-inner">
              {step === 1 && (
                <div>
                  <div className="cl-step">Paso 1 de 3</div>
                  <h1>Selecciona la cantidad</h1>
                  <p className="cl-sub">Elige cuántas cajas deseas para cada ojo.</p>

                  {/* Tarjeta Ojo Derecho */}
                  <div className={`cl-eye ${odOn ? 'on' : 'off'}`}>
                    <div 
                      className="cl-chk" 
                      onClick={() => {
                        if (odOn && !oiOn) return; // no desmarcar ambos
                        setOdOn(!odOn);
                      }}
                    >
                      {odOn ? '✓' : ''}
                    </div>
                    <div 
                      className="cl-en"
                      onClick={() => {
                        if (odOn && !oiOn) return;
                        setOdOn(!odOn);
                      }}
                    >
                      Ojo derecho (OD)
                      <small>Mismo producto para ambos ojos</small>
                    </div>
                    <div className="cl-stp">
                      <button 
                        type="button" 
                        className="cl-rnd" 
                        onClick={() => {
                          if (!odOn) setOdOn(true);
                          setOd(prev => Math.max(1, prev - 1));
                        }}
                        disabled={!odOn && od <= 1}
                      >
                        −
                      </button>
                      <span className="cl-q">
                        {od} {od === 1 ? unit : unitPlural}
                      </span>
                      <button 
                        type="button" 
                        className="cl-rnd" 
                        onClick={() => {
                          if (!odOn) setOdOn(true);
                          setOd(prev => prev + 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Tarjeta Ojo Izquierdo */}
                  <div className={`cl-eye ${oiOn ? 'on' : 'off'}`}>
                    <div 
                      className="cl-chk" 
                      onClick={() => {
                        if (oiOn && !odOn) return; // no desmarcar ambos
                        setOiOn(!oiOn);
                      }}
                    >
                      {oiOn ? '✓' : ''}
                    </div>
                    <div 
                      className="cl-en"
                      onClick={() => {
                        if (oiOn && !odOn) return;
                        setOiOn(!oiOn);
                      }}
                    >
                      Ojo izquierdo (OI)
                      <small>Desmárcalo si solo necesitas un ojo</small>
                    </div>
                    <div className="cl-stp">
                      <button 
                        type="button" 
                        className="cl-rnd" 
                        onClick={() => {
                          if (!oiOn) setOiOn(true);
                          setOi(prev => Math.max(1, prev - 1));
                        }}
                        disabled={!oiOn && oi <= 1}
                      >
                        −
                      </button>
                      <span className="cl-q">
                        {oi} {oi === 1 ? unit : unitPlural}
                      </span>
                      <button 
                        type="button" 
                        className="cl-rnd" 
                        onClick={() => {
                          if (!oiOn) setOiOn(true);
                          setOi(prev => prev + 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Selector de color si es cosmético */}
                  {availableColors.length > 0 && (
                    <div className="cl-color-box">
                      <label>🎨 Selecciona el color de tus lentes:</label>
                      <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                        {availableColors.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Garantía y WhatsApp en el flujo en móvil */}
                  <div className="cl-mobile-trust-flow">
                    <div className="cl-guar">
                      <span>🔒</span>
                      <div>
                        <b>Garantía Lensique:</b> devolución de cajas selladas hasta 15 días · validación por optometrista.{' '}
                        <a href="/devoluciones" target="_blank" rel="noopener noreferrer">Ver política</a>
                      </div>
                    </div>
                    <a 
                      className="cl-wa" 
                      href={`https://wa.me/523316929111?text=${encodeURIComponent(`Hola, tengo una duda sobre ${cleanName}.`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => { if (typeof window !== 'undefined' && (window as any).fbq) (window as any).fbq('track', 'Lead'); }}
                    >
                      <span className="cl-d"></span> ¿Dudas? Escríbenos por WhatsApp
                    </a>
                  </div>

                  <div className="cl-cta-container">
                    <button 
                      type="button" 
                      className="cl-cta" 
                      onClick={() => {
                        setStep(2);
                        const el = document.getElementById('cl-right-panel');
                        if (el) el.scrollTop = 0;
                      }}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <button 
                    type="button" 
                    className="cl-back" 
                    onClick={() => {
                      setValidationError(null);
                      setStep(1);
                      const el = document.getElementById('cl-right-panel');
                      if (el) el.scrollTop = 0;
                    }}
                  >
                    ‹ volver
                  </button>
                  <div className="cl-step">Paso 2 de 3</div>
                  <h1>Tu graduación</h1>
                  <p className="cl-sub">Los datos vienen en tu caja actual o en tu receta.</p>

                  <div className="cl-tabs">
                    <button 
                      type="button" 
                      className={`cl-tab ${tab === 'rx' ? 'on' : ''}`}
                      onClick={() => { setTab('rx'); setValidationError(null); }}
                    >
                      Escribir mis datos
                    </button>
                    <button 
                      type="button" 
                      className={`cl-tab ${tab === 'photo' ? 'on' : ''}`}
                      onClick={() => { setTab('photo'); setValidationError(null); }}
                    >
                      Subir caja o receta
                    </button>
                    <button 
                      type="button" 
                      className={`cl-tab ${tab === 'later' ? 'on' : ''}`}
                      onClick={() => { setTab('later'); setValidationError(null); }}
                    >
                      La envío después
                    </button>
                  </div>

                  {tab === 'rx' && (
                    <div>
                      <div style={{ marginBottom: '10px', textAlign: 'right' }}>
                        <button 
                          type="button"
                          onClick={() => setShowRxGuide(!showRxGuide)}
                          style={{ 
                            background: 'none', border: 'none', padding: 0, 
                            color: 'var(--lsq-gold)', fontSize: '12.5px', fontWeight: 600, 
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' 
                          }}
                        >
                          {showRxGuide ? '▼' : '▶'} ¿Cómo leer mi receta?
                        </button>
                      </div>
                      
                      {showRxGuide && (
                        <div style={{ marginBottom: '14px' }}>
                          <RxGuide isToric={isToric} isMultifocal={isMultifocal} />
                        </div>
                      )}

                      {/* Especificaciones de Curva y Diámetro predeterminadas */}
                      <div className="cl-specs-fixed-banner">
                        <div className="cl-specs-fixed-title">
                          <span style={{ fontSize: '15px' }}>📐</span>
                          <b>Parámetros de fábrica para {cleanName}:</b>
                        </div>
                        <div className="cl-specs-fixed-values">
                          <span className="cl-specs-pill">Curva base (BC): <b>{defaultBc}</b></span>
                          <span className="cl-specs-pill">Diámetro (DIA): <b>{defaultDia}</b></span>
                        </div>
                      </div>

                      <div className={`cl-rxgrid fixed-specs ${isToric ? 'toric' : isMultifocal ? 'multifocal' : ''}`}>
                        <div></div>
                        <div className="cl-lb">Esfera (PWR) *</div>
                        {isToric && <div className="cl-lb">Cilindro</div>}
                        {isToric && <div className="cl-lb">Eje</div>}
                        {isMultifocal && <div className="cl-lb">Adición</div>}

                        {/* Fila OD */}
                        {odOn && (
                          <>
                            <div className="cl-rl">OD</div>
                            <SphereDropdown 
                              value={prescriptionOD.sph} 
                              onChange={(val) => {
                                setValidationError(null);
                                setPrescriptionOD(prev => ({ ...prev, sph: val, bc: defaultBc, dia: defaultDia }));
                                if (samePrescription) setPrescriptionOS(prev => ({ ...prev, sph: val, bc: defaultBc, dia: defaultDia }));
                              }}
                            />

                            {isToric && (
                              <>
                                <select 
                                  value={prescriptionOD.cyl} 
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPrescriptionOD(prev => ({ ...prev, cyl: val }));
                                    if (samePrescription) setPrescriptionOS(prev => ({ ...prev, cyl: val }));
                                  }}
                                >
                                  {cylOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <select 
                                  value={prescriptionOD.axis} 
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setPrescriptionOD(prev => ({ ...prev, axis: val }));
                                    if (samePrescription) setPrescriptionOS(prev => ({ ...prev, axis: val }));
                                  }}
                                >
                                  {axisOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                              </>
                            )}

                            {isMultifocal && (
                              <select 
                                value={prescriptionOD.add} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setPrescriptionOD(prev => ({ ...prev, add: val }));
                                  if (samePrescription) setPrescriptionOS(prev => ({ ...prev, add: val }));
                                }}
                              >
                                {addOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            )}
                          </>
                        )}

                        {/* Fila OI */}
                        {oiOn && (
                          <>
                            <div className="cl-rl">OI</div>
                            <SphereDropdown 
                              value={samePrescription ? prescriptionOD.sph : prescriptionOS.sph} 
                              disabled={samePrescription}
                              onChange={(val) => {
                                setValidationError(null);
                                setPrescriptionOS(prev => ({ ...prev, sph: val, bc: defaultBc, dia: defaultDia }));
                              }}
                            />

                            {isToric && (
                              <>
                                <select 
                                  value={samePrescription ? prescriptionOD.cyl : prescriptionOS.cyl} 
                                  disabled={samePrescription}
                                  onChange={(e) => setPrescriptionOS(prev => ({ ...prev, cyl: e.target.value }))}
                                >
                                  {cylOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <select 
                                  value={samePrescription ? prescriptionOD.axis : prescriptionOS.axis} 
                                  disabled={samePrescription}
                                  onChange={(e) => setPrescriptionOS(prev => ({ ...prev, axis: e.target.value }))}
                                >
                                  {axisOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                              </>
                            )}

                            {isMultifocal && (
                              <select 
                                value={samePrescription ? prescriptionOD.add : prescriptionOS.add} 
                                disabled={samePrescription}
                                onChange={(e) => setPrescriptionOS(prev => ({ ...prev, add: e.target.value }))}
                              >
                                {addOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                              </select>
                            )}
                          </>
                        )}
                      </div>

                      {/* Versión móvil por tarjetas de ojo (adaptada a pantalla táctil) */}
                      <div className="cl-rx-mobile-cards">
                        {odOn && (
                          <div className="cl-rx-eye-card">
                            <div className="cl-rx-eye-header">👁️ Ojo derecho (OD)</div>
                            
                            <div className="cl-rx-card-fixed-specs">
                              📐 Curva {defaultBc} · Diámetro {defaultDia} (de fábrica)
                            </div>

                            <div className="cl-rx-fields-grid">
                              <div className="cl-field-group">
                                <label>Esfera (PWR) *</label>
                                <SphereDropdown 
                                  value={prescriptionOD.sph} 
                                  onChange={(val) => {
                                    setValidationError(null);
                                    setPrescriptionOD(prev => ({ ...prev, sph: val, bc: defaultBc, dia: defaultDia }));
                                    if (samePrescription) setPrescriptionOS(prev => ({ ...prev, sph: val, bc: defaultBc, dia: defaultDia }));
                                  }}
                                />
                              </div>

                              {isToric && (
                                <>
                                  <div className="cl-field-group">
                                    <label>Cilindro (CYL) *</label>
                                    <select 
                                      value={prescriptionOD.cyl} 
                                      onChange={(e) => {
                                        setPrescriptionOD(prev => ({ ...prev, cyl: e.target.value }));
                                        if (samePrescription) setPrescriptionOS(prev => ({ ...prev, cyl: e.target.value }));
                                      }}
                                    >
                                      {cylOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                  </div>
                                  <div className="cl-field-group">
                                    <label>Eje (AXIS) *</label>
                                    <select 
                                      value={prescriptionOD.axis} 
                                      onChange={(e) => {
                                        setPrescriptionOD(prev => ({ ...prev, axis: e.target.value }));
                                        if (samePrescription) setPrescriptionOS(prev => ({ ...prev, axis: e.target.value }));
                                      }}
                                    >
                                      {axisOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                  </div>
                                </>
                              )}

                              {isMultifocal && (
                                <div className="cl-field-group">
                                  <label>Adición (ADD) *</label>
                                  <select 
                                    value={prescriptionOD.add} 
                                    onChange={(e) => {
                                      setPrescriptionOD(prev => ({ ...prev, add: e.target.value }));
                                      if (samePrescription) setPrescriptionOS(prev => ({ ...prev, add: e.target.value }));
                                    }}
                                  >
                                    {addOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {oiOn && (
                          <div className="cl-rx-eye-card">
                            <div className="cl-rx-eye-header">👁️ Ojo izquierdo (OI)</div>
                            {samePrescription ? (
                              <div style={{ fontSize: '13px', color: 'var(--lsq-green)', fontWeight: 600, padding: '4px 0' }}>
                                ✓ Mismos datos que el ojo derecho
                              </div>
                            ) : (
                              <>
                                <div className="cl-rx-card-fixed-specs">
                                  📐 Curva {defaultBc} · Diámetro {defaultDia} (de fábrica)
                                </div>

                                <div className="cl-rx-fields-grid">
                                  <div className="cl-field-group">
                                    <label>Esfera (PWR) *</label>
                                    <SphereDropdown 
                                      value={prescriptionOS.sph} 
                                      onChange={(val) => {
                                        setValidationError(null);
                                        setPrescriptionOS(prev => ({ ...prev, sph: val, bc: defaultBc, dia: defaultDia }));
                                      }}
                                    />
                                  </div>

                                  {isToric && (
                                    <>
                                      <div className="cl-field-group">
                                        <label>Cilindro (CYL) *</label>
                                        <select 
                                          value={prescriptionOS.cyl} 
                                          onChange={(e) => setPrescriptionOS(prev => ({ ...prev, cyl: e.target.value }))}
                                        >
                                          {cylOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                      </div>
                                      <div className="cl-field-group">
                                        <label>Eje (AXIS) *</label>
                                        <select 
                                          value={prescriptionOS.axis} 
                                          onChange={(e) => setPrescriptionOS(prev => ({ ...prev, axis: e.target.value }))}
                                        >
                                          {axisOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                      </div>
                                    </>
                                  )}

                                  {isMultifocal && (
                                    <div className="cl-field-group">
                                      <label>Adición (ADD) *</label>
                                      <select 
                                        value={prescriptionOS.add} 
                                        onChange={(e) => setPrescriptionOS(prev => ({ ...prev, add: e.target.value }))}
                                      >
                                        {addOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                      </select>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Casilla Mis datos son los mismos en ambos ojos */}
                      {odOn && oiOn && (
                        <label className="cl-same">
                          <input 
                            type="checkbox" 
                            checked={samePrescription} 
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSamePrescription(checked);
                              if (checked) {
                                setPrescriptionOS({ ...prescriptionOD });
                              }
                            }}
                          />
                          Mis datos son los mismos en ambos ojos
                        </label>
                      )}
                    </div>
                  )}

                  {tab === 'photo' && (
                    <div>
                      <label 
                        className="cl-upl"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          accept="image/*,.pdf" 
                          style={{ display: 'none' }} 
                          onChange={handleFileChange}
                        />
                        <span style={{ fontSize: '36px' }}>📄</span>
                        {photoFile ? (
                          <>
                            <b style={{ color: 'var(--lsq-navy)', fontSize: '15px' }}>{photoFile.name}</b>
                            <span style={{ color: 'var(--lsq-green)', fontSize: '13px', fontWeight: 600 }}>✓ Archivo listo (clic para cambiar)</span>
                          </>
                        ) : (
                          <>
                            <b style={{ color: 'var(--lsq-navy)', fontSize: '16px' }}>Sube una foto de tu caja o tu receta</b>
                            <span style={{ color: 'var(--lsq-grey)', fontSize: '13px' }}>Imagen o PDF. Un optometrista confirma los valores.</span>
                            <span className="cl-upl-btn">Seleccionar archivo</span>
                          </>
                        )}
                      </label>
                    </div>
                  )}

                  {tab === 'later' && (
                    <div className="cl-warn">
                      Sin problema. Completa tu compra y mándanos los datos por foto o WhatsApp; un optometrista los valida antes de surtir.
                    </div>
                  )}

                  {validationError && (
                    <div className="cl-warn cl-warn-error">
                      {validationError}
                    </div>
                  )}

                  <div className="cl-warn cl-warn-info">
                    Un optometrista revisa tus datos antes de surtir tu pedido.
                  </div>

                  {/* Garantía y WhatsApp en el flujo en móvil */}
                  <div className="cl-mobile-trust-flow">
                    <div className="cl-guar">
                      <span>🔒</span>
                      <div>
                        <b>Garantía Lensique:</b> devolución de cajas selladas hasta 15 días · validación por optometrista.{' '}
                        <a href="/devoluciones" target="_blank" rel="noopener noreferrer">Ver política</a>
                      </div>
                    </div>
                    <a 
                      className="cl-wa" 
                      href={`https://wa.me/523316929111?text=${encodeURIComponent(`Hola, tengo una duda sobre ${cleanName}.`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => { if (typeof window !== 'undefined' && (window as any).fbq) (window as any).fbq('track', 'Lead'); }}
                    >
                      <span className="cl-d"></span> ¿Dudas? Escríbenos por WhatsApp
                    </a>
                  </div>

                  <div className="cl-cta-container">
                    <button 
                      type="button" 
                      className="cl-cta" 
                      onClick={() => {
                        if (tab === 'photo') {
                          if (!photoFile) {
                            setValidationError('Por favor selecciona una foto de tu caja o receta para continuar.');
                            return;
                          }
                        } else if (tab === 'rx') {
                          const checkEye = (eye: typeof prescriptionOD) => {
                            if (!eye.sph || eye.sph.trim() === '') return false;
                            if (isToric && (!eye.cyl || !eye.axis)) return false;
                            if (isMultifocal && !eye.add) return false;
                            return true;
                          };
                          const odOk = !odOn || checkEye(prescriptionOD);
                          const oiOk = !oiOn || checkEye(samePrescription ? prescriptionOD : prescriptionOS);
                          if (!odOk || !oiOk) {
                            if (odOn && !prescriptionOD.sph) {
                              setValidationError('Por favor selecciona la Esfera (PWR) para el ojo derecho.');
                            } else if (oiOn && !samePrescription && !prescriptionOS.sph) {
                              setValidationError('Por favor selecciona la Esfera (PWR) para el ojo izquierdo.');
                            } else if (isToric && ((odOn && (!prescriptionOD.cyl || !prescriptionOD.axis)) || (oiOn && !samePrescription && (!prescriptionOS.cyl || !prescriptionOS.axis)))) {
                              setValidationError('Por favor completa Cilindro y Eje para astigmatismo.');
                            } else if (isMultifocal && ((odOn && !prescriptionOD.add) || (oiOn && !samePrescription && !prescriptionOS.add))) {
                              setValidationError('Por favor selecciona la Adición (ADD) para multifocal.');
                            } else {
                              setValidationError('Por favor completa todos los campos requeridos de tu graduación.');
                            }
                            return;
                          }
                        }
                        setValidationError(null);
                        setStep(3);
                        const el = document.getElementById('cl-right-panel');
                        if (el) el.scrollTop = 0;
                      }}
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <button 
                    type="button" 
                    className="cl-back" 
                    onClick={() => {
                      setStep(2);
                      const el = document.getElementById('cl-right-panel');
                      if (el) el.scrollTop = 0;
                    }}
                  >
                    ‹ volver
                  </button>
                  <div className="cl-step">Paso 3 de 3</div>
                  <h1>Resumen</h1>
                  <p className="cl-sub">Revisa tu pedido antes de pagar.</p>

                  <div className="cl-summary-card">
                    <div className="cl-sumrow">
                      <span className="cl-k">Producto</span>
                      <span className="cl-v">
                        {cleanName}
                        <br />
                        <small style={{ fontWeight: 400, color: 'var(--lsq-grey)' }}>
                          {getUsageType()}{selectedColor ? ` · Color: ${selectedColor}` : ''}
                        </small>
                      </span>
                    </div>

                    <div className="cl-sumrow">
                      <span className="cl-k">Cantidad</span>
                      <span className="cl-v">
                        {odOn && `${od} ${od === 1 ? unit : unitPlural} (OD)`}
                        {odOn && oiOn && ' · '}
                        {oiOn && `${oi} ${oi === 1 ? unit : unitPlural} (OI)`}
                      </span>
                    </div>

                    <div className="cl-sumrow">
                      <span className="cl-k">Graduación</span>
                      <span className="cl-v">
                        {tab === 'photo' && `Por foto o receta (${photoFile?.name || 'Archivo adjunto'})`}
                        {tab === 'later' && 'Receta pendiente (la envías por WhatsApp)'}
                        {tab === 'rx' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {odOn && (
                              <div>
                                <b>OD:</b> Esf {prescriptionOD.sph} · Curva {defaultBc} · Diámetro {defaultDia}
                                {isToric && ` · Cil ${prescriptionOD.cyl} · Eje ${prescriptionOD.axis}°`}
                                {isMultifocal && ` · Add ${prescriptionOD.add}`}
                              </div>
                            )}
                            {oiOn && (
                              <div>
                                <b>OI:</b> Esf {samePrescription ? prescriptionOD.sph : prescriptionOS.sph} · Curva {defaultBc} · Diámetro {defaultDia}
                                {isToric && ` · Cil ${samePrescription ? prescriptionOD.cyl : prescriptionOS.cyl} · Eje ${samePrescription ? prescriptionOD.axis : prescriptionOS.axis}°`}
                                {isMultifocal && ` · Add ${samePrescription ? prescriptionOD.add : prescriptionOS.add}`}
                              </div>
                            )}
                          </div>
                        )}
                      </span>
                    </div>

                    <div className="cl-feat">✓ Validación por optometrista antes de surtir</div>
                    <div className="cl-feat">✓ Devolución de cajas selladas hasta 15 días</div>
                  </div>

                  <div className="cl-sumrow" style={{ border: 'none', paddingTop: '4px', paddingBottom: '4px' }}>
                    <span className="cl-k">Envío</span>
                    <span className="cl-v" style={{ fontWeight: 400, color: 'var(--lsq-grey)' }}>
                      {totalPricing.price >= 2500 ? 'Gratis' : 'Calculado en el carrito · o recoge en clínica'}
                    </span>
                  </div>

                  <div className="cl-total-row">
                    <div>
                      <span style={{ color: 'var(--lsq-grey)', fontSize: '13px', display: 'block' }}>Total</span>
                      {totalPricing.n > 0 && (
                        <span style={{ color: 'var(--lsq-green)', fontSize: '12.5px', fontWeight: 600 }}>
                          o ${totalPricing.monthly.toLocaleString('es-MX')}/mes a {totalPricing.n} MSI
                        </span>
                      )}
                    </div>
                    <b style={{ fontSize: '26px', color: 'var(--lsq-navy)' }}>
                      ${totalPricing.price.toLocaleString('es-MX')}
                    </b>
                  </div>

                  {/* WhatsApp en el flujo en móvil */}
                  <div className="cl-mobile-trust-flow">
                    <a 
                      className="cl-wa" 
                      href={`https://wa.me/523316929111?text=${encodeURIComponent(`Hola, tengo una duda sobre ${cleanName}.`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => { if (typeof window !== 'undefined' && (window as any).fbq) (window as any).fbq('track', 'Lead'); }}
                    >
                      <span className="cl-d"></span> ¿Dudas? Escríbenos por WhatsApp
                    </a>
                  </div>

                  <div className="cl-cta-container">
                    <button 
                      type="button" 
                      className="cl-cta" 
                      onClick={handleAddToCart}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
