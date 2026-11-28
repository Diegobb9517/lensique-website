import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Check } from 'lucide-react';
import { toTitleCase, formatContactLensTitle, getContactLensFormat } from '../lib/format';
import { RxGuide } from './RxGuide';
import './ContactLensConfiguratorModal.css';
import contactLensesImg from '../assets/contact_lenses.png';
import solutionImg from '../assets/contact_lens/solution.jpg';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://lensique-pos.onrender.com';

const DEFAULT_CARE_KIT = {
  id: 1446,
  name: 'Kit de cuidado (solución + estuche)',
  price_incl_tax: 150,
  image_url: solutionImg
};
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

interface CustomDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  centerZero?: boolean;
  disabled?: boolean;
}

function CustomDropdown({ options, value, onChange, placeholder = 'Elige', centerZero, disabled = false }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUp, setIsUp] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOpt = options.find(o => String(o.value) === String(value) || (value && Number(o.value) === Number(value)));
  const displayLabel = selectedOpt ? selectedOpt.label : (placeholder || 'Elige');

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen) {
      if (ddRef.current) {
        const rect = ddRef.current.getBoundingClientRect();
        setIsUp(window.innerHeight - rect.bottom < 250);
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!listRef.current) return;
      if (!value || value === '') {
        if (centerZero) {
          const zeroItem = listRef.current.querySelector('[data-val="0.00"]') as HTMLElement;
          if (zeroItem) {
            zeroItem.scrollIntoView({ block: 'center' });
            return;
          }
        }
      }
      const selItem = listRef.current.querySelector('.lsq-dd-opt.sel') as HTMLElement;
      if (selItem) {
        selItem.scrollIntoView({ block: 'nearest' });
      }
    }, 20);

    const handleClickOutside = (ev: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(ev.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, value, centerZero]);

  return (
    <div 
      className={`lsq-dd ${isOpen ? 'open' : ''} ${isUp ? 'up' : ''} ${disabled ? 'disabled' : ''}`} 
      ref={ddRef}
      style={{ minWidth: 0, width: '100%' }}
    >
      <div 
        className="lsq-dd-btn" 
        onClick={handleToggle} 
        style={{ 
          cursor: disabled ? 'not-allowed' : 'pointer', 
          opacity: disabled ? 0.6 : 1,
          minWidth: 0,
          width: '100%'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {displayLabel}
        </span>
        <span className="lsq-dd-caret" style={{ flexShrink: 0 }}>{isOpen ? '▲' : '▾'}</span>
      </div>
      {isOpen && (
        <div className="lsq-dd-list" ref={listRef}>
          {options.map((opt, idx) => {
            const isSel = String(opt.value) === String(value) || (value && Number(opt.value) === Number(value));
            return (
              <div
                key={`${opt.value}-${idx}`}
                data-val={opt.value}
                className={`lsq-dd-opt ${isSel ? 'sel' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ContactLensConfiguratorModalProps {
  product: any;
  onClose: () => void;
  onComplete: (configData: any, checkoutNow: boolean, careKitToAdd?: any) => void;
}

export default function ContactLensConfiguratorModal({ product, onClose, onComplete }: ContactLensConfiguratorModalProps) {
  const [step, setStep] = useState(1);
  
  // Kit de cuidado opcional
  const [careKit, setCareKit] = useState<{ id: number; name: string; price_incl_tax: number; image_url?: string } | null>(DEFAULT_CARE_KIT);
  const [addCareKit, setAddCareKit] = useState<boolean>(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/website/care-kit`)
      .then(res => res.json())
      .then(data => {
        if (data && data.enabled && data.product) {
          setCareKit({
            ...data.product,
            image_url: data.product.image_url || solutionImg
          });
        } else if (data && data.enabled === false) {
          setCareKit(null);
        }
      })
      .catch(() => {
        // Keeps DEFAULT_CARE_KIT fallback on network error/cold start
      });
  }, []);
  
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

  const rawProductName = (product?.name || product?.title || product?.model || product?.sku || '').toString();
  const productName = rawProductName.toUpperCase();
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
    return formatContactLensTitle(product?.name || product?.model || product?.sku || 'Lentes de contacto');
  }, [product]);

  const getUsageType = () => {
    return getContactLensFormat(product);
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

  const powerOptions = useMemo(() => {
    const a = [{ value: '', label: 'Elige' }];
    for (let p = 8; p >= 0.25; p -= 0.25) {
      const v = `+${p.toFixed(2)}`;
      a.push({ value: v, label: v });
    }
    a.push({ value: '0.00', label: '0.00' });
    for (let p = -0.25; p >= -6.00; p -= 0.25) {
      const v = p.toFixed(2);
      a.push({ value: v, label: v });
    }
    for (let p = -6.50; p >= -12.00; p -= 0.50) {
      const v = p.toFixed(2);
      a.push({ value: v, label: v });
    }
    return a;
  }, []);

  const cylOptions = useMemo(() => {
    const opts = [{ value: '', label: 'CYL' }];
    ['-0.50', '-0.75', '-1.00', '-1.25', '-1.50', '-1.75', '-2.00', '-2.25', '-2.50', '-2.75'].forEach(v => {
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

  // Grid layout according to lens parameters (Toric / Multifocal / Spherical)
  const isToricAndMultifocal = isToric && isMultifocal;
  const gridVariant = isToricAndMultifocal
    ? 'toric-multifocal'
    : isToric
    ? 'toric'
    : isMultifocal
    ? 'multifocal'
    : 'spherical';

  const gridColumns = isToricAndMultifocal
    ? '38px minmax(90px, 1.25fr) minmax(75px, 1fr) minmax(75px, 1fr) minmax(75px, 1fr)'
    : isToric
    ? '38px minmax(105px, 1.3fr) minmax(80px, 1fr) minmax(80px, 1fr)'
    : isMultifocal
    ? '38px minmax(120px, 1.4fr) minmax(95px, 1fr)'
    : '38px 1fr';

  // Precios y total con Mercado Pago + MSI
  const boxPrice = useMemo(() => {
    return Number(product?.price_incl_tax || product?.price || 0);
  }, [product]);

  const totalBoxes = useMemo(() => {
    return (odOn ? od : 0) + (oiOn ? oi : 0);
  }, [odOn, oiOn, od, oi]);

  const totalPricing = useMemo(() => {
    const boxesNet = boxPrice * Math.max(1, totalBoxes);
    const kitNet = (addCareKit && careKit) ? Number(careKit.price_incl_tax || 0) : 0;
    return priceWithMP(boxesNet + kitNet);
  }, [boxPrice, totalBoxes, addCareKit, careKit]);

  // Completar y enviar al carrito
  const handleAddToCart = () => {
    if (!boxPrice || boxPrice <= 0) {
      alert('Este producto no tiene un precio configurado en inventario. Por favor contáctanos para asistirte.');
      return;
    }
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
        totalPrice: boxPrice * Math.max(1, totalBoxes),
        monthly: totalPricing.monthly,
        msi: totalPricing.n,
        careKit: (addCareKit && careKit) ? careKit : null
      }
    };
    onComplete(configData, true, (addCareKit && careKit) ? careKit : null);
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
            <div 
              className="cl-pbox"
              style={{
                background: '#ffffff',
                backgroundColor: '#ffffff',
                border: 'none',
                borderRadius: 0,
                boxShadow: 'none'
              }}
            >
              <img 
                src={getProductImage()} 
                alt={cleanName} 
                className="cl-pbox-img"
                style={{ background: '#ffffff', objectFit: 'contain' }}
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
                      <label htmlFor="cl-color-select">🎨 Selecciona el color de tus lentes:</label>
                      <select id="cl-color-select" aria-label="Color de lentes de contacto" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
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
                  <p className="cl-sub">
                    Los datos vienen en tu caja actual o en tu receta.
                    <button 
                      type="button" 
                      onClick={() => setShowRxGuide(!showRxGuide)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: 0, 
                        color: 'var(--lsq-gold)', 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        cursor: 'pointer', 
                        textDecoration: 'underline', 
                        marginLeft: '8px' 
                      }}
                    >
                      {showRxGuide ? 'Ocultar guía' : '¿Cómo leer mi receta?'}
                    </button>
                  </p>

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
                      {showRxGuide && (
                        <div style={{ marginBottom: '14px' }}>
                          <RxGuide isToric={isToric} isMultifocal={isMultifocal} />
                        </div>
                      )}

                      <div className={`cl-rx-table ${gridVariant}`}>
                        {/* Fila Encabezados */}
                        <div 
                          className="cl-rx-row cl-rx-header-row"
                          style={{ gridTemplateColumns: gridColumns, gap: '8px' }}
                        >
                          <div style={{ width: '38px' }}></div>
                          <div className="cl-lb">Esfera (PWR) *</div>
                          {isToric && <div className="cl-lb">Cilindro</div>}
                          {isToric && <div className="cl-lb">Eje</div>}
                          {isMultifocal && <div className="cl-lb">Adición</div>}
                        </div>

                        {/* Fila OD */}
                        {odOn && (
                          <div 
                            className="cl-rx-row"
                            style={{ gridTemplateColumns: gridColumns, gap: '8px' }}
                          >
                            <div className="cl-rl">OD</div>
                            <CustomDropdown 
                              options={powerOptions}
                              value={prescriptionOD.sph} 
                              centerZero={true}
                              placeholder="Elige"
                              onChange={(val) => {
                                setValidationError(null);
                                setPrescriptionOD(prev => ({ ...prev, sph: val, bc: defaultBc, dia: defaultDia }));
                                if (samePrescription) setPrescriptionOS(prev => ({ ...prev, sph: val, bc: defaultBc, dia: defaultDia }));
                              }}
                            />

                            {isToric && (
                              <>
                                <CustomDropdown 
                                  options={cylOptions}
                                  value={prescriptionOD.cyl} 
                                  placeholder="CYL"
                                  onChange={(val) => {
                                    setPrescriptionOD(prev => ({ ...prev, cyl: val }));
                                    if (samePrescription) setPrescriptionOS(prev => ({ ...prev, cyl: val }));
                                  }}
                                />
                                <CustomDropdown 
                                  options={axisOptions}
                                  value={prescriptionOD.axis} 
                                  placeholder="Eje"
                                  onChange={(val) => {
                                    setPrescriptionOD(prev => ({ ...prev, axis: val }));
                                    if (samePrescription) setPrescriptionOS(prev => ({ ...prev, axis: val }));
                                  }}
                                />
                              </>
                            )}

                            {isMultifocal && (
                              <CustomDropdown 
                                options={addOptions}
                                value={prescriptionOD.add} 
                                placeholder="ADD"
                                onChange={(val) => {
                                  setPrescriptionOD(prev => ({ ...prev, add: val }));
                                  if (samePrescription) setPrescriptionOS(prev => ({ ...prev, add: val }));
                                }}
                              />
                            )}
                          </div>
                        )}

                        {/* Fila OI */}
                        {oiOn && (
                          <div 
                            className="cl-rx-row"
                            style={{ gridTemplateColumns: gridColumns, gap: '8px' }}
                          >
                            <div className="cl-rl">OI</div>
                            <CustomDropdown 
                              options={powerOptions}
                              value={samePrescription ? prescriptionOD.sph : prescriptionOS.sph} 
                              centerZero={true}
                              placeholder="Elige"
                              disabled={samePrescription}
                              onChange={(val) => {
                                setValidationError(null);
                                setPrescriptionOS(prev => ({ ...prev, sph: val, bc: defaultBc, dia: defaultDia }));
                              }}
                            />

                            {isToric && (
                              <>
                                <CustomDropdown 
                                  options={cylOptions}
                                  value={samePrescription ? prescriptionOD.cyl : prescriptionOS.cyl} 
                                  placeholder="CYL"
                                  disabled={samePrescription}
                                  onChange={(val) => {
                                    setPrescriptionOS(prev => ({ ...prev, cyl: val }));
                                  }}
                                />
                                <CustomDropdown 
                                  options={axisOptions}
                                  value={samePrescription ? prescriptionOD.axis : prescriptionOS.axis} 
                                  placeholder="Eje"
                                  disabled={samePrescription}
                                  onChange={(val) => {
                                    setPrescriptionOS(prev => ({ ...prev, axis: val }));
                                  }}
                                />
                              </>
                            )}

                            {isMultifocal && (
                              <CustomDropdown 
                                options={addOptions}
                                value={samePrescription ? prescriptionOD.add : prescriptionOS.add} 
                                placeholder="ADD"
                                disabled={samePrescription}
                                onChange={(val) => {
                                  setPrescriptionOS(prev => ({ ...prev, add: val }));
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Versión móvil por tarjetas de ojo (adaptada a pantalla táctil) */}
                      <div className="cl-rx-mobile-cards">
                        {odOn && (
                          <div className="cl-rx-eye-card">
                            <div className="cl-rx-eye-header">Ojo derecho (OD)</div>

                            <div className="cl-rx-fields-grid">
                              <div className="cl-field-group">
                                <label>Esfera (PWR) *</label>
                                <CustomDropdown 
                                  options={powerOptions}
                                  value={prescriptionOD.sph} 
                                  centerZero={true}
                                  placeholder="Elige"
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
                                    <CustomDropdown 
                                      options={cylOptions}
                                      value={prescriptionOD.cyl} 
                                      placeholder="CYL"
                                      onChange={(val) => {
                                        setPrescriptionOD(prev => ({ ...prev, cyl: val }));
                                        if (samePrescription) setPrescriptionOS(prev => ({ ...prev, cyl: val }));
                                      }}
                                    />
                                  </div>
                                  <div className="cl-field-group">
                                    <label>Eje (AXIS) *</label>
                                    <CustomDropdown 
                                      options={axisOptions}
                                      value={prescriptionOD.axis} 
                                      placeholder="Eje"
                                      onChange={(val) => {
                                        setPrescriptionOD(prev => ({ ...prev, axis: val }));
                                        if (samePrescription) setPrescriptionOS(prev => ({ ...prev, axis: val }));
                                      }}
                                    />
                                  </div>
                                </>
                              )}

                              {isMultifocal && (
                                <div className="cl-field-group">
                                  <label>Adición (ADD) *</label>
                                  <CustomDropdown 
                                    options={addOptions}
                                    value={prescriptionOD.add} 
                                    placeholder="ADD"
                                    onChange={(val) => {
                                      setPrescriptionOD(prev => ({ ...prev, add: val }));
                                      if (samePrescription) setPrescriptionOS(prev => ({ ...prev, add: val }));
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {oiOn && (
                          <div className="cl-rx-eye-card">
                            <div className="cl-rx-eye-header">Ojo izquierdo (OI)</div>
                            {samePrescription ? (
                              <div style={{ fontSize: '13px', color: '#15803d', fontWeight: 600, padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Check size={16} strokeWidth={2.5} /> Mismos datos que el ojo derecho
                              </div>
                            ) : (
                              <div className="cl-rx-fields-grid">
                                  <div className="cl-field-group">
                                    <label>Esfera (PWR) *</label>
                                    <CustomDropdown 
                                      options={powerOptions}
                                      value={prescriptionOS.sph} 
                                      centerZero={true}
                                      placeholder="Elige"
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
                                        <CustomDropdown 
                                          options={cylOptions}
                                          value={prescriptionOS.cyl} 
                                          placeholder="CYL"
                                          onChange={(val) => setPrescriptionOS(prev => ({ ...prev, cyl: val }))}
                                        />
                                      </div>
                                      <div className="cl-field-group">
                                        <label>Eje (AXIS) *</label>
                                        <CustomDropdown 
                                          options={axisOptions}
                                          value={prescriptionOS.axis} 
                                          placeholder="Eje"
                                          onChange={(val) => setPrescriptionOS(prev => ({ ...prev, axis: val }))}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {isMultifocal && (
                                    <div className="cl-field-group">
                                      <label>Adición (ADD) *</label>
                                      <CustomDropdown 
                                        options={addOptions}
                                        value={prescriptionOS.add} 
                                        placeholder="ADD"
                                        onChange={(val) => setPrescriptionOS(prev => ({ ...prev, add: val }))}
                                      />
                                    </div>
                                  )}
                                </div>
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
                                <b>OD:</b> Esf {prescriptionOD.sph}
                                {isToric && ` · Cil ${prescriptionOD.cyl} · Eje ${prescriptionOD.axis}°`}
                                {isMultifocal && ` · Add ${prescriptionOD.add}`}
                              </div>
                            )}
                            {oiOn && (
                              <div>
                                <b>OI:</b> Esf {samePrescription ? prescriptionOD.sph : prescriptionOS.sph}
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
                    {addCareKit && careKit && (
                      <div className="cl-sumrow" style={{ borderTop: '1px solid #f1f5f9', marginTop: '8px', paddingTop: '8px' }}>
                        <span className="cl-k">Kit de cuidado</span>
                        <span className="cl-v">
                          1x {careKit.name || 'Kit de cuidado (solución + estuche)'} · <b>+${careKit.price_incl_tax.toLocaleString('es-MX')}</b>
                        </span>
                      </div>
                    )}
                  </div>

                  {careKit && careKit.price_incl_tax && (
                    <div className="cl-care-kit-box" style={{ margin: '14px 0', padding: '12px 14px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                        <input 
                          type="checkbox" 
                          checked={addCareKit} 
                          onChange={(e) => setAddCareKit(e.target.checked)} 
                          style={{ width: '18px', height: '18px', accentColor: '#16223f', cursor: 'pointer' }}
                        />
                        <span>
                          Agregar kit de cuidado (solución + estuche) — <b>+${careKit.price_incl_tax.toLocaleString('es-MX')}</b>
                        </span>
                      </label>
                      {/* TODO: Confirmar con el dueño la política de devolución del kit si se abre el empaque */}
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px', marginLeft: '28px', lineHeight: 1.4 }}>
                        Solución limpiadora y estuche protector para la higiene diaria de tus lentes.
                      </div>
                    </div>
                  )}

                  <div className="cl-sumrow" style={{ border: 'none', paddingTop: '4px', paddingBottom: '4px' }}>
                    <span className="cl-k">Envío</span>
                    <span className="cl-v" style={{ fontWeight: 400, color: 'var(--lsq-grey)' }}>
                      {totalPricing.price >= 2500 ? 'Gratis' : 'Calculado en el carrito · o recoger en sucursal'}
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
