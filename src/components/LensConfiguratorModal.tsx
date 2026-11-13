import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, Camera, Upload, AlertTriangle, ShieldCheck, Check, Truck, Info, HelpCircle } from 'lucide-react';
import { resolveImageUrl } from '../App';
import { getDisplayName, formatBrandName } from '../lib/format';
import './LensConfiguratorModal.css';

// ==========================================
// 1. CONSTANTES & MOTOR ZEISS (PARIDAD POS LENSIQUE)
// ==========================================
const POS_API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:3000'
  : 'https://lensique-pos.onrender.com';

export const RANGES: Record<string, [number, number, number]> = {
  '1.5': [-7, 6, 4],
  '1.6': [-10, 6, 6],
  '1.67': [-12, 8, 6],
  '1.74': [-20, 16, 6]
};

export const ORDER = ['1.5', '1.6', '1.67', '1.74'];

const PRICING_TRAMOS = [
  { h: 600,   m: 2.45 },
  { h: 1500,  m: 2.20 },
  { h: 3000,  m: 1.85 },
  { h: 5000,  m: 1.62 },
  { h: 1e9,   m: 1.47 }
];

export function multFor(c: number): number {
  c = c || 0;
  for (let i = 0; i < PRICING_TRAMOS.length; i++) {
    if (c < PRICING_TRAMOS[i].h) return PRICING_TRAMOS[i].m;
  }
  return 1.47;
}

export function charmPrice(n: number): number {
  return Math.round(n / 100) * 100 - 1;
}

const MONO_COST: Record<string, { term?: number; proc?: number }> = {
  chrome: { term: 422 },
  '1.5':  { term: 747, proc: 1288 },
  '1.6':  { term: 829, proc: 1617 },
  '1.67': { term: 922, proc: 2019 },
  '1.74': { proc: 2857 }
};

function isTermStock(e: number, c: number, idx: string) {
  return (Math.abs(c) <= 2 && e >= -6 && e <= 4 && (idx === '1.5' || idx === '1.6'));
}

function t167Stock(e: number, c: number) {
  return (e >= 3 && e <= 6 && Math.abs(c) <= 2) || (e >= -10 && e <= -6.25 && c === 0);
}

// Cálculo idéntico a mostrador POS Lensique
export function calcLocalZeiss(
  tipo: 'mono' | 'prog',
  idx: string,
  trat: 'none' | 'azul' | 'foto',
  e: number = 0,
  c: number = 0
): number {
  e = typeof e === 'number' ? e : 0;
  c = typeof c === 'number' ? c : 0;
  let cost = 747;
  if (tipo === 'mono') {
    const d = MONO_COST[idx] || MONO_COST['1.5'];
    const stock = isTermStock(e, c, idx) || (idx === '1.67' && trat !== 'foto' && t167Stock(e, c));
    if (stock && d.term && !(trat === 'foto' && e < -4)) {
      cost = d.term;
    } else {
      cost = d.proc || d.term || 1288;
      if (trat === 'foto' && cost === 2755) cost = 2258;
    }
    if (trat === 'foto' && stock && idx === '1.6') cost = 1179;
    if (trat === 'foto' && idx === '1.5') cost = 1679;
    const iva = cost * 1.16;
    const m = multFor(cost);
    const raw = iva * m;
    return charmPrice(raw);
  } else {
    // Progresivo ZEISS Light 3Dv (Comfort) - Paridad exacta con mostrador POS ($4,600 base)
    if (trat === 'foto') cost = 2439;
    else if (trat === 'azul') cost = 2191;
    else cost = 2129;
    const iva = cost * 1.16;
    const m = multFor(cost);
    const raw = iva * m;
    return Math.round(raw / 100) * 100;
  }
}

export function getMicaPrice(
  type: 'mono' | 'prog',
  index: string,
  trat: 'none' | 'azul' | 'foto',
  e: number = 0,
  c: number = 0
): number {
  return calcLocalZeiss(type, index, trat, e, c);
}

export function recommend(e: number, c: number): string | null {
  const pot = Math.max(Math.abs(e), Math.abs(e + c));
  const a = pot < 3 ? 1 : pot < 5 ? 2 : pot < 8 ? 3 : 4;
  let m = 5;
  for (let i = 0; i < 4; i++) {
    const r = RANGES[ORDER[i]];
    if (e >= r[0] && e <= r[1] && Math.abs(c) <= r[2]) {
      m = i + 1;
      break;
    }
  }
  const rk = Math.max(a, m);
  return rk >= 5 ? null : ORDER[rk - 1];
}

export function getFeasibleIndices(odSph: number, odCyl: number, oiSph: number, oiCyl: number): string[] {
  const eMin = Math.min(odSph, oiSph);
  const eMax = Math.max(odSph, oiSph);
  const cMax = Math.max(Math.abs(odCyl), Math.abs(oiCyl));
  const out: string[] = [];
  ORDER.forEach(k => {
    const r = RANGES[k];
    if (eMin >= r[0] && eMax <= r[1] && cMax <= r[2]) {
      out.push(k);
    }
  });
  return out;
}

export function getRecommendation(odSph: number, odCyl: number, oiSph: number, oiCyl: number): string | null {
  const r1 = recommend(odSph, odCyl);
  const r2 = recommend(oiSph, oiCyl);
  if (r1 === null || r2 === null) return null;
  return ORDER.indexOf(r1) >= ORDER.indexOf(r2) ? r1 : r2;
}

// Reglas de Meses Sin Intereses (MSI) Lensique:
// - 3 MSI desde $2,500
// - 6 MSI desde $4,000
// - Debajo de $2,500: solo pago de contado (sin MSI)
export function getMsiInfo(price: number): { n: number; monthly: number } {
  if (typeof price !== 'number' || isNaN(price)) return { n: 0, monthly: price };
  if (price >= 4000) {
    return { n: 6, monthly: Math.round(price / 6) };
  }
  if (price >= 2500) {
    return { n: 3, monthly: Math.round(price / 3) };
  }
  return { n: 0, monthly: price };
}

export function idxLabel(i: string): string {
  return i === '1.5' ? '1.50' : i === '1.6' ? '1.60' : i;
}

// ==========================================
// 2. COMPONENTE DROPDOWN CONTROLADO (.dd)
// ==========================================
interface CustomDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  centerZero?: boolean;
}

function CustomDropdown({ options, value, onChange, placeholder, centerZero }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUp, setIsUp] = useState(false);
  const ddRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOpt = options.find(o => String(o.value) === String(value));
  const displayLabel = selectedOpt ? selectedOpt.label : (placeholder || 'Elige');

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
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

    document.addEventListener('click', handleClickOutside);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, value, centerZero]);

  return (
    <div className={`lsq-dd ${isOpen ? 'open' : ''} ${isUp ? 'up' : ''}`} ref={ddRef}>
      <div className="lsq-dd-btn" onClick={handleToggle}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayLabel}</span>
        <span className="lsq-dd-caret">▾</span>
      </div>
      {isOpen && (
        <div className="lsq-dd-list" ref={listRef}>
          {options.map((opt, idx) => {
            const isSel = String(opt.value) === String(value);
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

// ==========================================
// 3. PROPS DEL MODAL
// ==========================================
interface LensConfiguratorModalProps {
  product: any;
  catalogData?: any[];
  initialSection?: string | null;
  onClose: () => void;
  onComplete: (config: any) => void;
}

export default function LensConfiguratorModal({
  product,
  initialSection,
  onClose,
  onComplete
}: LensConfiguratorModalProps) {
  // Datos dinámicos del producto (armazón)
  const framePrice = useMemo(() => {
    return Number(product?.price_incl_tax || product?.price || 500);
  }, [product]);

  const frameImg = useMemo(() => {
    return resolveImageUrl(
      (product?.images && product.images.length > 0) ? product.images[0].image_url : product?.image_url,
      product?.image
    );
  }, [product]);

  const frameDisplayName = useMemo(() => {
    return getDisplayName(product) || product?.name || 'Armazón';
  }, [product]);

  const frameBrand = useMemo(() => {
    return formatBrandName(product?.brand || '');
  }, [product]);

  // Aptitud para progresivo (aro >= 30 mm)
  const isAptoProg = useMemo(() => {
    if (product?.apto_progresivo === false) return false;
    if (product?.aro != null && Number(product.aro) > 0 && Number(product.aro) < 30) return false;
    return true;
  }, [product]);

  // Estados principales del flujo
  const [step, setStep] = useState<1 | 2 | 3>(() => {
    if (initialSection === '2' || initialSection === 'rx' || initialSection === '3') return 2;
    return 1;
  });

  const [need, setNeed] = useState<'mono' | 'prog' | 'frame'>('mono');
  const [tab, setTab] = useState<'rx' | 'photo' | 'later'>('rx');

  // Graduación (campos arrancan VACÍOS 'Elige', NO en 0.00)
  const [odSph, setOdSph] = useState<string>('');
  const [odCyl, setOdCyl] = useState<string>('0.00');
  const [odAxis, setOdAxis] = useState<string>('');

  const [oiSph, setOiSph] = useState<string>('');
  const [oiCyl, setOiCyl] = useState<string>('0.00');
  const [oiAxis, setOiAxis] = useState<string>('');

  const [sameEye, setSameEye] = useState<boolean>(false);
  const [add, setAdd] = useState<string>('');

  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [rxPhotoFile, setRxPhotoFile] = useState<File | null>(null);
  const [rxPhotoName, setRxPhotoName] = useState<string>('');

  // Distancia pupilar (DP)
  const [dp, setDp] = useState<{ mm: number; conf: string; method: string } | null>(null);
  const [showManualDp, setShowManualDp] = useState<boolean>(false);
  const [dpManualValue, setDpManualValue] = useState<string>('');
  const [altPhotoName, setAltPhotoName] = useState<string>('');

  // Mensaje de validación
  const [rxError, setRxError] = useState<string>('');

  // Índice y tratamientos (Paso 3)
  const [selectedIdx, setSelectedIdx] = useState<string>('1.5');
  const [selectedTrat, setSelectedTrat] = useState<'none' | 'azul' | 'foto'>('none');

  // Opciones de desplegables
  const powerOptions = useMemo(() => {
    const a = [{ value: '', label: 'Elige' }];
    for (let p = 16; p >= -20; p -= 0.25) {
      const v = p.toFixed(2);
      a.push({ value: v, label: (p > 0 ? '+' : '') + v });
    }
    return a;
  }, []);

  const cylOptions = useMemo(() => {
    const a = [{ value: '0.00', label: '0.00' }];
    for (let p = -0.25; p >= -6; p -= 0.25) {
      const v = p.toFixed(2);
      a.push({ value: v, label: v });
    }
    return a;
  }, []);

  const addOptions = useMemo(() => {
    const a = [{ value: '', label: 'Elige' }];
    for (let p = 0.75; p <= 3.5; p += 0.25) {
      const v = p.toFixed(2);
      a.push({ value: v, label: '+' + v });
    }
    return a;
  }, []);

  const dpOptions = useMemo(() => {
    const a = [{ value: '', label: 'Elige tu DP' }];
    for (let i = 46; i <= 78; i++) {
      a.push({ value: String(i), label: `${i} mm` });
    }
    return a;
  }, []);

  // Sincronización "Mi graduación es la misma en ambos ojos"
  const copyOdToOi = useCallback(() => {
    setOiSph(odSph);
    setOiCyl(odCyl);
    setOiAxis(odAxis);
  }, [odSph, odCyl, odAxis]);

  const handleToggleSameEye = (checked: boolean) => {
    setSameEye(checked);
    if (checked) {
      setOiSph(odSph);
      setOiCyl(odCyl);
      setOiAxis(odAxis);
    }
  };

  const handleOdSphChange = (val: string) => {
    setOdSph(val);
    if (sameEye) setOiSph(val);
  };

  const handleOdCylChange = (val: string) => {
    setOdCyl(val);
    if (sameEye) setOiCyl(val);
  };

  const handleOdAxisChange = (val: string) => {
    setOdAxis(val);
    if (sameEye) setOiAxis(val);
  };

  // Escuchar mensaje de la cámara de medición DP (demo-dp-automatica.html)
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      const d = e.data;
      if (!d || d.type !== 'lensique-dp' || !d.use || !d.mm) return;
      setDp({
        mm: d.mm,
        conf: d.conf || 'aproximada',
        method: d.method || 'iris'
      });
      setDpManualValue('');
      setShowManualDp(false);
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const openCam = () => {
    const camWin = window.open('/demo-dp-automatica.html', 'lensiqueDP', 'width=520,height=900');
    if (!camWin) {
      alert('El navegador bloqueó la ventana emergente. Por favor permítela para medir tu DP con la cámara.');
      return;
    }
  };

  const handleManualDpChange = (v: string) => {
    setDpManualValue(v);
    if (!v) {
      setDp(null);
    } else {
      setDp({ mm: Number(v), conf: 'manual', method: 'manual' });
    }
  };

  // Subida de receta foto/PDF
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRxPhotoFile(file);
      setRxPhotoName(file.name);
      setRxError('');
    }
  };

  const handleAltPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAltPhotoName(e.target.files[0].name);
    }
  };

  // Helper numérico para Rx
  const numVal = (str: string) => parseFloat(str || '0');

  // Factibilidad de índices
  const feasibleIndices = useMemo(() => {
    if (need === 'frame' || tab !== 'rx') return ['1.5', '1.6', '1.67', '1.74'];
    if (need === 'prog') return ['1.5']; // ZEISS Light 3Dv orgánico solo en 1.50
    return getFeasibleIndices(numVal(odSph), numVal(odCyl), numVal(oiSph), numVal(oiCyl));
  }, [need, tab, odSph, odCyl, oiSph, oiCyl]);

  // Estado de precios en vivo devueltos por el endpoint del POS
  const [posPrices, setPosPrices] = useState<Record<string, number>>({});

  const effRx = useMemo(() => {
    const e1 = numVal(odSph);
    const c1 = numVal(odCyl);
    const e2 = sameEye ? e1 : numVal(oiSph);
    const c2 = sameEye ? c1 : numVal(oiCyl);
    const p1 = Math.max(Math.abs(e1), Math.abs(e1 + c1));
    const p2 = Math.max(Math.abs(e2), Math.abs(e2 + c2));
    const e = p1 >= p2 ? e1 : e2;
    const c = p1 >= p2 ? c1 : c2;
    const addVal = need === 'prog' ? numVal(add) : 0;
    return { e, c, add: addVal, odE: e1, odC: c1, oiE: e2, oiC: c2 };
  }, [odSph, odCyl, oiSph, oiCyl, sameEye, need, add]);

  const getMicaPriceVal = useCallback((
    type: 'mono' | 'prog',
    index: string,
    trat: 'none' | 'azul' | 'foto',
    e: number = 0,
    c: number = 0
  ): number => {
    const cacheKey = `${type}|${index}|${trat}|${e}|${c}`;
    if (posPrices[cacheKey] != null) return posPrices[cacheKey];
    return calcLocalZeiss(type, index, trat, e, c);
  }, [posPrices]);

  // Consulta en vivo al cotizador POS (Lensique)
  useEffect(() => {
    if (need === 'frame') return;
    const curIdx = selectedIdx;
    const trat = selectedTrat;
    const effE = effRx.e;
    const effC = effRx.c;
    const effAdd = effRx.add;
    const cacheKey = `${need}|${curIdx}|${trat}|${effE}|${effC}`;

    if (posPrices[cacheKey] != null) return;

    const payload = {
      tipo: need === 'prog' ? 'progresivo' : 'monofocal',
      nivel: need === 'prog' ? '3dv' : undefined,
      esfera: effE,
      cilindro: effC,
      eje: numVal(odAxis) || 0,
      adicion: effAdd,
      indice: curIdx === '1.5' ? '1.50' : curIdx === '1.6' ? '1.60' : curIdx,
      tratamiento: trat === 'foto' ? 'fotocromatico' : (trat === 'azul' ? 'filtro_azul' : 'ninguno'),
      od: { esfera: effRx.odE, cilindro: effRx.odC, eje: numVal(odAxis) || 0, adicion: effAdd },
      oi: { esfera: effRx.oiE, cilindro: effRx.oiC, eje: sameEye ? (numVal(odAxis) || 0) : (numVal(oiAxis) || 0), adicion: effAdd }
    };

    let active = true;
    fetch(POS_API_BASE + '/api/precio-mica', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(data => {
        if (!active) return;
        if (data && data.disponible && typeof data.precio === 'number') {
          const finalP = need === 'mono' ? charmPrice(data.precio) : data.precio;
          setPosPrices(prev => ({ ...prev, [cacheKey]: finalP }));
        }
      })
      .catch(() => {});

    return () => { active = false; };
  }, [need, selectedIdx, selectedTrat, effRx, odAxis, oiAxis, sameEye, posPrices]);

  // Cálculo de adelgazamiento y opciones ofrecidas
  const thinningOffer = useMemo(() => {
    if (need === 'frame' || tab !== 'rx') return null;
    if (feasibleIndices.length === 0) return null;

    const base = feasibleIndices[0]; // Estándar: mínimo fabricable
    const rec = getRecommendation(numVal(odSph), numVal(odCyl), numVal(oiSph), numVal(oiCyl));
    const recIndex = (rec && feasibleIndices.includes(rec)) ? rec : base;
    const worth = ORDER.indexOf(recIndex) > ORDER.indexOf(base);

    const pot = Math.max(
      Math.abs(numVal(odSph)),
      Math.abs(numVal(odSph) + numVal(odCyl)),
      Math.abs(numVal(oiSph)),
      Math.abs(numVal(oiSph) + numVal(oiCyl))
    );

    const OPT_MIN = 2.0; // Debajo de ±2.00 no tiene sentido adelgazar
    let offer: string | null = null;
    let optional = false;

    if (worth) {
      offer = recIndex;
      optional = false;
    } else {
      offer = (pot >= OPT_MIN && feasibleIndices.length > 1) ? feasibleIndices[1] : null;
      optional = true;
    }

    if (!offer) {
      return { base, offer: null, optional: false };
    }
    return { base, offer, optional };
  }, [need, tab, feasibleIndices, odSph, odCyl, oiSph, oiCyl]);

  // Sincronizar índice seleccionado con base/oferta cuando cambie la graduación
  useEffect(() => {
    if (!thinningOffer) {
      setSelectedIdx('1.5');
      return;
    }
    const { base, offer } = thinningOffer;
    if (selectedIdx !== base && selectedIdx !== offer) {
      setSelectedIdx(base);
    }
  }, [thinningOffer, selectedIdx]);

  // Navegación
  const handlePickNeed = (n: 'mono' | 'prog' | 'frame') => {
    if (n === 'prog' && !isAptoProg) return;
    setNeed(n);
  };

  const handleGoto2 = () => {
    if (need === 'frame') {
      setStep(3);
      return;
    }
    setStep(2);
  };

  const handleGoto3 = () => {
    // Validaciones estrictas del Paso 2
    if (tab === 'rx') {
      const faltan: string[] = [];
      if (!odSph) faltan.push('od-sph');
      if (!oiSph) faltan.push('oi-sph');
      if (need === 'prog' && !add) faltan.push('add');
      if (odCyl !== '0.00' && (!odAxis || Number(odAxis) < 1 || Number(odAxis) > 180)) faltan.push('od-axis');
      if (oiCyl !== '0.00' && (!oiAxis || Number(oiAxis) < 1 || Number(oiAxis) > 180)) faltan.push('oi-axis');

      if (faltan.length > 0) {
        const parts: string[] = [];
        if (!odSph || !oiSph) parts.push('la <b>esfera</b> de ambos ojos');
        if (need === 'prog' && !add) parts.push('la <b>ADD</b> (progresivo)');
        if ((odCyl !== '0.00' && (!odAxis || Number(odAxis) < 1 || Number(odAxis) > 180)) ||
            (oiCyl !== '0.00' && (!oiAxis || Number(oiAxis) < 1 || Number(oiAxis) > 180))) {
          parts.push('el <b>eje</b> cuando hay cilindro');
        }
        setRxError(`⚠ Completa tu graduación para continuar: ${parts.join(' · ')}.`);
        return;
      }
      setRxError('');
    } else if (tab === 'photo' && !rxPhotoFile) {
      setRxError('⚠ Sube la <b>foto o PDF</b> de tu receta para continuar, o elige "La envío después".');
      return;
    } else {
      setRxError('');
    }

    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) {
      if (need === 'frame') setStep(1);
      else setStep(2);
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleSwitchTab = (newTab: 'rx' | 'photo' | 'later') => {
    setTab(newTab);
    setRxError('');
  };

  // Precios dinámicos y totales
  const lowestMonoPrice = useMemo(() => {
    return framePrice + calcLocalZeiss('mono', '1.5', 'none');
  }, [framePrice]);

  const lowestProgPrice = useMemo(() => {
    return framePrice + calcLocalZeiss('prog', '1.5', 'none');
  }, [framePrice]);

  const currentSummaryPricing = useMemo(() => {
    if (need === 'frame') {
      const msi = getMsiInfo(framePrice);
      return { price: framePrice, n: msi.n, monthly: msi.monthly, micaNet: 0 };
    }
    const micaNet = getMicaPriceVal(need, selectedIdx, selectedTrat, effRx.e, effRx.c);
    const net = framePrice + micaNet;
    const msi = getMsiInfo(net);
    return { price: net, n: msi.n, monthly: msi.monthly, micaNet };
  }, [need, framePrice, selectedIdx, selectedTrat, effRx, getMicaPriceVal]);

  // Diferencia de precio de tratamientos adicionales al índice actual
  const diffAzul = useMemo(() => {
    if (need === 'frame') return 0;
    return getMicaPriceVal(need, selectedIdx, 'azul', effRx.e, effRx.c) - getMicaPriceVal(need, selectedIdx, 'none', effRx.e, effRx.c);
  }, [need, selectedIdx, effRx, getMicaPriceVal]);

  const diffFoto = useMemo(() => {
    if (need === 'frame') return 0;
    return getMicaPriceVal(need, selectedIdx, 'foto', effRx.e, effRx.c) - getMicaPriceVal(need, selectedIdx, 'none', effRx.e, effRx.c);
  }, [need, selectedIdx, effRx, getMicaPriceVal]);

  // Finalizar configuración y enviar al carrito
  const handleAddToCart = () => {
    if (need === 'frame') {
      onComplete({
        originalProduct: product,
        onlyFrame: true,
        unit_price: framePrice
      });
      return;
    }

    const etiqueta = need === 'mono' ? 'ZEISS · Una distancia' : 'ZEISS · Progresivo';
    const tipoFab = selectedIdx === '1.5' ? 'Estándar' : (selectedIdx === '1.74' ? 'Ultra delgada' : 'Adelgazada');
    const tratNombre = selectedTrat === 'azul'
      ? 'Filtro luz azul (BlueGuard)'
      : (selectedTrat === 'foto' ? 'Fotocromático (PhotoFusion X)' : 'Antirreflejante estándar');

    const configPayload = {
      originalProduct: product,
      onlyFrame: false,
      tipo: need,
      etiqueta,
      indice: idxLabel(selectedIdx),
      tipoFab,
      isZeiss: true,
      proveedor: 'ZEISS',
      montaje: product?.montaje || 'completo',
      tratamiento: selectedTrat,
      tratamientoNombre: tratNombre,
      pvp: currentSummaryPricing.price - framePrice,
      framePrice,
      total: currentSummaryPricing.price,
      mpRate: 0,
      msiCount: currentSummaryPricing.n,
      msiMonthly: currentSummaryPricing.monthly,
      rxMethod: tab,
      prescriptionPending: tab === 'later',
      photoName: rxPhotoName || undefined,
      od: tab === 'rx' ? {
        esf: Number(odSph),
        cil: Number(odCyl),
        eje: odAxis ? Number(odAxis) : undefined,
        add: need === 'prog' && add ? Number(add) : undefined
      } : undefined,
      oi: tab === 'rx' ? {
        esf: Number(oiSph),
        cil: Number(oiCyl),
        eje: oiAxis ? Number(oiAxis) : undefined,
        add: need === 'prog' && add ? Number(add) : undefined
      } : undefined,
      esfera: tab === 'rx' ? Number(odSph) : undefined,
      cilindro: tab === 'rx' ? Number(odCyl) : undefined,
      add: (need === 'prog' && tab === 'rx' && add) ? Number(add) : undefined,
      pd: dp ? (dp.mm ? `${Math.round(dp.mm)} mm (${dp.conf})` : `${dp} mm`) : undefined,
      altPhotoName: altPhotoName || undefined
    };

    onComplete(configPayload);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="lsq-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="lsq-modal-container"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Encabezado compacto móvil (fijo arriba en celular) */}
          <div className="lsq-mobile-topbar">
            <div className="lsq-mobile-topbar-info">
              <span className="lsq-mobile-topbar-title">{frameDisplayName}</span>
              <span className="lsq-mobile-topbar-total">
                ${currentSummaryPricing.price.toLocaleString('es-MX')}
                {currentSummaryPricing.n > 0 && (
                  <span className="lsq-mobile-topbar-msi"> · ${currentSummaryPricing.monthly.toLocaleString('es-MX')}/mes a {currentSummaryPricing.n} MSI</span>
                )}
              </span>
            </div>
            <button className="lsq-mobile-topbar-close" onClick={onClose} aria-label="Cerrar modal">
              <X size={20} />
            </button>
          </div>
          {/* Botón de cierre superior derecho */}
          <button
            className="lsq-close-btn"
            aria-label="Cerrar modal"
            onClick={onClose}
          >
            <X size={20} />
          </button>

          <div className="lsq-layout">
            {/* PANEL IZQUIERDO: Armazón, Imagen y Precio Dinámico "Desde" */}
            <div className="lsq-left">
              <div className="lsq-pic-wrapper">
                {frameImg ? (
                  <img src={frameImg} alt={frameDisplayName} className="lsq-pic-img" />
                ) : (
                  <div style={{ color: 'var(--lsq-grey)', fontSize: '14px' }}>Sin imagen disponible</div>
                )}
                <div className="lsq-lbl-head">
                  {need === 'mono' ? 'UNA DISTANCIA' : (need === 'prog' ? 'PROGRESIVO' : 'SOLO EL ARMAZÓN')}
                </div>
              </div>

              <div className="lsq-pic-cap">
                {need === 'mono' ? 'Micas ZEISS · Una distancia' : (need === 'prog' ? 'Micas ZEISS · Progresivo' : 'Solo el armazón')}
              </div>

              {frameBrand && <div className="lsq-prod-brand">{frameBrand}</div>}
              <h1 className="lsq-prod-title">{frameDisplayName}</h1>

              <div className="lsq-price-box">
                {need === 'frame' ? (
                  <>
                    <b className="lsq-price-val">${framePrice.toLocaleString('es-MX')}</b>
                    <div className="lsq-pnote">solo el armazón</div>
                  </>
                ) : (
                  <>
                    <div className="lsq-pdesde">Desde</div>
                    <b className="lsq-price-val">
                      ${(need === 'mono' ? lowestMonoPrice : lowestProgPrice).toLocaleString('es-MX')}
                    </b>
                    <div className="lsq-pnote">con micas incluidas</div>
                  </>
                )}
              </div>
            </div>

            {/* PANEL DERECHO: Flujo de 3 Pasos */}
            <div className="lsq-right">
              {/* ============================================================ */}
              {/* PASO 1: ¿QUÉ NECESITAS? */}
              {/* ============================================================ */}
              {step === 1 && (
                <div className="lsq-step-content">
                  <div className="lsq-step-tag">Paso 1 de 3</div>
                  <h2 className="lsq-title">¿Qué necesitas?</h2>
                  <p className="lsq-sub">Elige una opción.</p>

                  <div
                    className={`lsq-opt-card ${need === 'mono' ? 'lsq-opt-sel' : ''}`}
                    onClick={() => handlePickNeed('mono')}
                  >
                    <div className="lsq-opt-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="8.2" />
                      </svg>
                    </div>
                    <div className="lsq-opt-body">
                      <div className="lsq-opt-name">Una distancia</div>
                      <div className="lsq-opt-desc">Para ver de lejos, o solo para leer de cerca.</div>
                    </div>
                    <div className="lsq-opt-radio">{need === 'mono' ? '✓' : ''}</div>
                  </div>

                  <div
                    className={`lsq-opt-card ${need === 'prog' ? 'lsq-opt-sel' : ''} ${!isAptoProg ? 'lsq-opt-off' : ''}`}
                    onClick={() => handlePickNeed('prog')}
                  >
                    <div className="lsq-opt-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="8.2" />
                        <line x1="4.5" y1="12" x2="19.5" y2="12" />
                      </svg>
                    </div>
                    <div className="lsq-opt-body">
                      <div className="lsq-opt-name">Progresivo</div>
                      <div className="lsq-opt-desc">
                        {isAptoProg
                          ? 'Lejos, intermedio y cerca en un lente, sin línea.'
                          : 'No disponible en este armazón (altura insuficiente). Elige otro modelo.'}
                      </div>
                    </div>
                    <div className="lsq-opt-radio">{need === 'prog' ? '✓' : ''}</div>
                  </div>

                  <div
                    className={`lsq-opt-card ${need === 'frame' ? 'lsq-opt-sel' : ''}`}
                    onClick={() => handlePickNeed('frame')}
                  >
                    <div className="lsq-opt-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2.5" y="8" width="8" height="7" rx="3" />
                        <rect x="13.5" y="8" width="8" height="7" rx="3" />
                        <path d="M10.5 11h3" />
                      </svg>
                    </div>
                    <div className="lsq-opt-body">
                      <div className="lsq-opt-name">Solo el armazón</div>
                      <div className="lsq-opt-desc">Sin micas graduadas.</div>
                    </div>
                    <div className="lsq-opt-radio">{need === 'frame' ? '✓' : ''}</div>
                  </div>

                  {/* Garantía y WhatsApp en el flujo en móvil */}
                  <div className="lsq-mobile-trust-flow">
                    <div className="lsq-guar-badge">
                      <span>🔒</span>
                      <div>
                        <b>Garantía Lensique:</b> 30 días de adaptación · validación por optometrista.{' '}
                        <a href="/devoluciones" target="_blank" rel="noopener noreferrer">Ver política</a>
                      </div>
                    </div>
                    <a 
                      className="lsq-wa-link" 
                      href={`https://wa.me/523316929111?text=${encodeURIComponent(`Hola, tengo una duda sobre ${frameDisplayName}.`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => { if (typeof window !== 'undefined' && (window as any).fbq) (window as any).fbq('track', 'Lead'); }}
                    >
                      <span className="lsq-wa-dot"></span> ¿Dudas con tu graduación? Escríbenos por WhatsApp
                    </a>
                  </div>

                  <div className="lsq-cta-container">
                    <button className="lsq-btn-cta" onClick={handleGoto2}>
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* PASO 2: TU GRADUACIÓN */}
              {/* ============================================================ */}
              {step === 2 && (
                <div className="lsq-step-content">
                  <div className="lsq-step-tag">
                    <button className="lsq-back-btn" onClick={handleBack}>
                      <ChevronLeft size={14} /> Volver
                    </button>
                    <span>· Paso 2 de 3</span>
                  </div>
                  <h2 className="lsq-title">Tu graduación</h2>
                  <p className="lsq-sub">Elige cómo ingresar tu receta.</p>

                  {/* Pestañas */}
                  <div className="lsq-tabs">
                    <div
                      className={`lsq-tab ${tab === 'rx' ? 'lsq-tab-on' : ''}`}
                      onClick={() => handleSwitchTab('rx')}
                    >
                      Escribir mi receta
                    </div>
                    <div
                      className={`lsq-tab ${tab === 'photo' ? 'lsq-tab-on' : ''}`}
                      onClick={() => handleSwitchTab('photo')}
                    >
                      Subir mi receta (foto o PDF)
                    </div>
                    <div
                      className={`lsq-tab ${tab === 'later' ? 'lsq-tab-on' : ''}`}
                      onClick={() => handleSwitchTab('later')}
                    >
                      La envío después
                    </div>
                  </div>

                  {/* Tab 1: Escribir mi receta */}
                  {tab === 'rx' && (
                    <div>
                      <div className="lsq-rx-grid">
                        <div />
                        <div className="lsq-rx-lbl">Esfera</div>
                        <div className="lsq-rx-lbl">Cilindro</div>
                        <div className="lsq-rx-lbl">Eje</div>

                        {/* Ojo Derecho (OD) */}
                        <div className="lsq-rx-eye">OD</div>
                        <CustomDropdown
                          options={powerOptions}
                          value={odSph}
                          onChange={handleOdSphChange}
                          placeholder="Elige"
                          centerZero={true}
                        />
                        <CustomDropdown
                          options={cylOptions}
                          value={odCyl}
                          onChange={handleOdCylChange}
                          placeholder="0.00"
                        />
                        <input
                          type="number"
                          min={1}
                          max={180}
                          placeholder="1–180"
                          className="lsq-axis-input"
                          value={odAxis}
                          onChange={(e) => handleOdAxisChange(e.target.value)}
                        />

                        {/* Ojo Izquierdo (OI) */}
                        {!sameEye ? (
                          <>
                            <div className="lsq-rx-eye">OI</div>
                            <CustomDropdown
                              options={powerOptions}
                              value={oiSph}
                              onChange={setOiSph}
                              placeholder="Elige"
                              centerZero={true}
                            />
                            <CustomDropdown
                              options={cylOptions}
                              value={oiCyl}
                              onChange={setOiCyl}
                              placeholder="0.00"
                            />
                            <input
                              type="number"
                              min={1}
                              max={180}
                              placeholder="1–180"
                              className="lsq-axis-input"
                              value={oiAxis}
                              onChange={(e) => setOiAxis(e.target.value)}
                            />
                          </>
                        ) : (
                          <div style={{ gridColumn: '1 / 5', fontSize: '13px', color: 'var(--lsq-grey)', padding: '6px 0' }}>
                            OI · igual que el ojo derecho (OD)
                          </div>
                        )}
                      </div>

                      {/* Versión móvil de graduación (tarjetas ordenadas por ojo) */}
                      <div className="lsq-rx-mobile-cards">
                        <div className="lsq-rx-eye-card">
                          <div className="lsq-rx-eye-header">👁️ Ojo derecho (OD)</div>
                          <div className="lsq-rx-fields-row">
                            <div className="lsq-rx-field">
                              <label>Esfera</label>
                              <CustomDropdown
                                options={powerOptions}
                                value={odSph}
                                onChange={handleOdSphChange}
                                placeholder="Elige"
                                centerZero={true}
                              />
                            </div>
                            <div className="lsq-rx-field">
                              <label>Cilindro</label>
                              <CustomDropdown
                                options={cylOptions}
                                value={odCyl}
                                onChange={handleOdCylChange}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="lsq-rx-field">
                              <label>Eje</label>
                              <input
                                type="number"
                                min={1}
                                max={180}
                                placeholder="1–180"
                                className="lsq-axis-input"
                                value={odAxis}
                                onChange={(e) => handleOdAxisChange(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        {!sameEye ? (
                          <div className="lsq-rx-eye-card">
                            <div className="lsq-rx-eye-header">👁️ Ojo izquierdo (OI)</div>
                            <div className="lsq-rx-fields-row">
                              <div className="lsq-rx-field">
                                <label>Esfera</label>
                                <CustomDropdown
                                  options={powerOptions}
                                  value={oiSph}
                                  onChange={setOiSph}
                                  placeholder="Elige"
                                  centerZero={true}
                                />
                              </div>
                              <div className="lsq-rx-field">
                                <label>Cilindro</label>
                                <CustomDropdown
                                  options={cylOptions}
                                  value={oiCyl}
                                  onChange={setOiCyl}
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="lsq-rx-field">
                                <label>Eje</label>
                                <input
                                  type="number"
                                  min={1}
                                  max={180}
                                  placeholder="1–180"
                                  className="lsq-axis-input"
                                  value={oiAxis}
                                  onChange={(e) => setOiAxis(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="lsq-rx-eye-card" style={{ padding: '12px 14px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--lsq-green)', fontWeight: 600 }}>
                              ✓ OI · igual que el ojo derecho (OD)
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Casilla: Mi graduación es la misma en ambos ojos */}
                      <label className="lsq-same-eye-label">
                        <input
                          type="checkbox"
                          checked={sameEye}
                          onChange={(e) => handleToggleSameEye(e.target.checked)}
                          style={{ width: '16px', height: '16px' }}
                        />
                        Mi graduación es la misma en ambos ojos
                      </label>

                      {/* Fila de ADD (solo progresivos) */}
                      {need === 'prog' && (
                        <div style={{ marginTop: '12px', borderTop: '1px solid var(--lsq-line)', paddingTop: '10px' }}>
                          <div className="lsq-rx-grid">
                            <div className="lsq-rx-eye">ADD</div>
                            <div>
                              <CustomDropdown
                                options={addOptions}
                                value={add}
                                onChange={setAdd}
                                placeholder="Elige"
                              />
                            </div>
                            <div style={{ gridColumn: '3 / 5', fontSize: '12px', color: 'var(--lsq-grey)' }}>
                              adición · solo progresivos
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Guía interactiva desplegable */}
                      <span className="lsq-link" onClick={() => setShowGuide(!showGuide)}>
                        {showGuide ? 'Ocultar ejemplo de receta' : '¿No sabes leer tu receta? Mira un ejemplo'}
                      </span>

                      {showGuide && (
                        <div className="lsq-rx-guide">
                          <table>
                            <thead>
                              <tr>
                                <th></th>
                                <th>ESFERA</th>
                                <th>CILINDRO</th>
                                <th>EJE</th>
                                <th>ADD</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><b>OD</b></td>
                                <td><span className="lsq-hl">-2.00</span></td>
                                <td><span className="lsq-hl">-0.50</span></td>
                                <td><span className="lsq-hl">90</span></td>
                                <td rowSpan={2} style={{ verticalAlign: 'middle' }}><span className="lsq-hl">+2.00</span></td>
                              </tr>
                              <tr>
                                <td><b>OI</b></td>
                                <td><span className="lsq-hl">-1.75</span></td>
                                <td>—</td>
                                <td>—</td>
                              </tr>
                            </tbody>
                          </table>
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '12.5px' }}>
                            <b>DP</b> &nbsp;<span className="lsq-hl">62 mm</span>&nbsp;
                            <span style={{ color: '#7b7b7b' }}>· a veces "DIP" o por ojo (31/31)</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px 16px', color: '#7b7b7b', fontSize: '12px', marginTop: '8px' }}>
                            <span><b>OD</b> = ojo derecho</span>
                            <span><b>OI</b> = ojo izquierdo</span>
                            <span><b>ADD</b> = adición para cerca</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: Subir foto o PDF */}
                  {tab === 'photo' && (
                    <div>
                      <label className="lsq-upl-zone">
                        <Upload size={32} color="var(--lsq-navy)" />
                        <b>Sube una foto o PDF de tu receta</b>
                        <span>Toma una foto o adjunta el archivo. Un optometrista la lee por ti y confirma los valores.</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf,.pdf"
                          style={{ display: 'none' }}
                          onChange={handlePhotoUpload}
                        />
                      </label>
                      {rxPhotoName && (
                        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13.5px', color: 'var(--lsq-green)', fontWeight: 600 }}>
                          ✓ Archivo recibido: {rxPhotoName}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 3: La envío después */}
                  {tab === 'later' && (
                    <div className="lsq-info" style={{ marginTop: '6px' }}>
                      <p style={{ margin: 0, fontWeight: 500 }}>
                        <b>Sin problema.</b> Sigue con tu compra y manda tu receta por WhatsApp o foto más tarde; un optometrista la valida antes de fabricar.
                      </p>
                    </div>
                  )}

                  {/* Bloque: Distancia pupilar (DP) */}
                  <div className="lsq-card">
                    <h3>Distancia pupilar (DP)</h3>
                    <p className="lsq-note">
                      Es la distancia entre tus pupilas. La mayoría de las recetas <b>no la traen</b>: si la tuya no la incluye, mídela aquí con la cámara.
                    </p>
                    <button className="lsq-dp-btn" onClick={openCam}>
                      <Camera size={16} /> Medir con la cámara
                    </button>
                    <span className="lsq-link" onClick={() => setShowManualDp(!showManualDp)}>
                      {showManualDp ? 'Ocultar selector manual de DP' : 'Mi receta sí la trae, la escribo'}
                    </span>

                    {showManualDp && (
                      <div style={{ marginTop: '8px' }}>
                        <CustomDropdown
                          options={dpOptions}
                          value={dpManualValue}
                          onChange={handleManualDpChange}
                          placeholder="Elige tu DP"
                        />
                      </div>
                    )}

                    {dp && (
                      <div className={`lsq-chip ${dp.conf}`}>
                        <b>DP {Math.round(dp.mm)} mm</b> · {dp.conf === 'manual' ? 'Escrita por ti' : 'Medida lista'}
                        <br />
                        <small>Un optometrista la confirma antes de fabricar.</small>
                      </div>
                    )}

                    {need === 'prog' && (
                      <div className="lsq-note" style={{ marginTop: '10px', borderTop: '1px solid var(--lsq-line)', paddingTop: '8px' }}>
                        <b>Altura de montaje:</b> la define tu optometrista según tu armazón.
                        <div style={{ marginTop: '4px' }}>
                          <label className="lsq-link">
                            + Subir foto con tus lentes actuales puestos (opcional)
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAltPhotoUpload} />
                          </label>
                          {altPhotoName && (
                            <div style={{ fontSize: '12px', color: 'var(--lsq-green)', marginTop: '2px' }}>
                              ✓ Foto de lentes actuales: {altPhotoName}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Aviso de error de validación */}
                  {rxError && (
                    <div
                      className="lsq-warn"
                      style={{ marginTop: '14px' }}
                      dangerouslySetInnerHTML={{ __html: rxError }}
                    />
                  )}

                  {/* Garantía y WhatsApp en el flujo en móvil */}
                  <div className="lsq-mobile-trust-flow">
                    <div className="lsq-guar-badge">
                      <span>🔒</span>
                      <div>
                        <b>Garantía Lensique:</b> 30 días de adaptación · validación por optometrista.{' '}
                        <a href="/devoluciones" target="_blank" rel="noopener noreferrer">Ver política</a>
                      </div>
                    </div>
                    <a 
                      className="lsq-wa-link" 
                      href={`https://wa.me/523316929111?text=${encodeURIComponent(`Hola, tengo una duda sobre ${frameDisplayName}.`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => { if (typeof window !== 'undefined' && (window as any).fbq) (window as any).fbq('track', 'Lead'); }}
                    >
                      <span className="lsq-wa-dot"></span> ¿Dudas con tu graduación? Escríbenos por WhatsApp
                    </a>
                  </div>

                  <div className="lsq-cta-container">
                    <button className="lsq-btn-cta" onClick={handleGoto3}>
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* PASO 3: RESUMEN */}
              {/* ============================================================ */}
              {step === 3 && (
                <div className="lsq-step-content">
                  <div className="lsq-step-tag">
                    <button className="lsq-back-btn" onClick={handleBack}>
                      <ChevronLeft size={14} /> Volver
                    </button>
                    <span>· Paso 3 de 3</span>
                  </div>
                  <h2 className="lsq-title">Resumen</h2>
                  <p className="lsq-sub">Revisa tu configuración.</p>

                  {/* Alerta de prescripción fuera de rango en línea */}
                  {tab === 'rx' && feasibleIndices.length === 0 && (
                    <div className="lsq-warn">
                      <b>Esta graduación necesita valoración.</b>
                      <br />
                      Queda fuera del rango que fabricamos en línea. Agenda tu cita o escríbenos por WhatsApp.
                    </div>
                  )}

                  {/* Aviso informativo de validación por optometrista */}
                  {need !== 'frame' && feasibleIndices.length > 0 && (
                    <div className="lsq-info">
                      {(need === 'prog' || selectedIdx === '1.67' || selectedIdx === '1.74') ? (
                        <span>
                          <b>Validación obligatoria.</b> Un optometrista confirma tus medidas antes de fabricar. Te escribimos si hace falta ajustar algo.
                        </span>
                      ) : (
                        <span>Un optometrista revisa tus medidas antes de fabricar.</span>
                      )}
                    </div>
                  )}

                  {/* Caja de lo que incluye el paquete */}
                  <div className="lsq-pkg-box">
                    <div className="lsq-pkg-title">
                      {need === 'frame'
                        ? 'Solo el armazón'
                        : `Incluye · ${need === 'mono' ? 'lentes de una distancia' : 'lentes progresivos'}`}
                    </div>
                    <div className="lsq-feat">✓ Armazón {frameDisplayName}</div>

                    {need !== 'frame' && (
                      <>
                        <div className="lsq-feat">✓ Micas ZEISS con capa antirreflejante y protección UV</div>
                        <div className="lsq-feat">
                          {tab === 'rx'
                            ? (feasibleIndices.length === 0 ? '⚠ Requiere valoración médica' : '✓ Grosor de mica ideal para tu graduación')
                            : '✓ Grosor de mica: se confirma con tu receta'}
                        </div>
                        <div className="lsq-feat">
                          {tab === 'rx'
                            ? '✓ Graduación capturada'
                            : (tab === 'photo' ? (rxPhotoName ? `✓ Foto de tu receta recibida (${rxPhotoName})` : '• Falta subir la foto de tu receta') : '• Receta pendiente: la envías después')}
                        </div>
                        <div className="lsq-feat">
                          {dp
                            ? `✓ DP ${Math.round(dp.mm)} mm (${dp.conf === 'manual' ? 'escrita por ti' : 'medida lista'})`
                            : '• DP pendiente: la confirma tu optometrista'}
                          {need === 'prog' && ' · altura de montaje: la define tu optometrista'}
                        </div>

                        {/* Sello ZEISS discreto y minimal */}
                        <div className="lsq-zeiss-seal">
                          <div className="lsq-zlogo-wrap">
                            <span className="lsq-zlbl">Micas</span>
                            <img src="/zeiss-logo.png" alt="ZEISS" style={{ height: '22px', width: 'auto', display: 'block' }} />
                          </div>
                          <a
                            href="https://www.zeiss.com.mx/vision-care/necesitas-lentes-nuevos.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lsq-link"
                            style={{ fontSize: '12px' }}
                          >
                            ¿Qué son las micas ZEISS?
                          </a>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Opciones de adelgazamiento (Grosor de la mica) */}
                  {need !== 'frame' && tab === 'rx' && thinningOffer && thinningOffer.offer && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--lsq-grey)', fontWeight: 600, marginBottom: '6px' }}>
                        Grosor de la mica
                      </div>

                      {/* Opción Base (Estándar incluida) */}
                      <div
                        className={`lsq-addon-item ${selectedIdx === thinningOffer.base ? 'lsq-addon-on' : ''}`}
                        onClick={() => setSelectedIdx(thinningOffer.base)}
                      >
                        <div className="lsq-addon-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 7h16M6 12h12M9 17h6" />
                          </svg>
                        </div>
                        <div className="lsq-addon-body">
                          <div className="lsq-addon-name">Grosor estándar ({idxLabel(thinningOffer.base)})</div>
                          <div className="lsq-addon-desc">El grosor que ya incluye tu lente.</div>
                        </div>
                        <span className="lsq-addon-pr">incluida</span>
                      </div>

                      {/* Opción Adelgazada recomendada u opcional */}
                      {(() => {
                        const offer = thinningOffer.offer;
                        const diff = getMicaPriceVal(need, offer, selectedTrat, effRx.e, effRx.c) - getMicaPriceVal(need, thinningOffer.base, selectedTrat, effRx.e, effRx.c);
                        const offerNames: Record<string, string> = {
                          '1.6': 'Más delgada (1.60)',
                          '1.67': 'Más delgada y ligera (1.67)',
                          '1.74': 'Ultra delgada · la más delgada (1.74)'
                        };
                        return (
                          <div
                            className={`lsq-addon-item ${selectedIdx === offer ? 'lsq-addon-on' : ''}`}
                            onClick={() => setSelectedIdx(offer)}
                          >
                            <div className="lsq-addon-icon">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 7h16M6 12h12M9 17h6" />
                              </svg>
                            </div>
                            <div className="lsq-addon-body">
                              <div className="lsq-addon-name">
                                {offerNames[offer] || 'Más delgada'}
                                {!thinningOffer.optional && <span className="lsq-recbadge">Recomendada</span>}
                              </div>
                              <div className="lsq-addon-desc">
                                {thinningOffer.optional
                                  ? 'Opcional: si la prefieres un poco más delgada y ligera.'
                                  : 'Para tu graduación, una mica notablemente más delgada y ligera.'}
                              </div>
                            </div>
                            <span className="lsq-addon-pr">+${diff.toLocaleString('es-MX')}</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Tratamientos adicionales (opcional · elige uno) */}
                  {need !== 'frame' && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--lsq-grey)', fontWeight: 600, marginBottom: '6px' }}>
                        Tratamientos adicionales (opcional · elige uno)
                      </div>

                      {/* Filtro Luz Azul */}
                      <div
                        className={`lsq-addon-item ${selectedTrat === 'azul' ? 'lsq-addon-on' : ''}`}
                        onClick={() => setSelectedTrat(selectedTrat === 'azul' ? 'none' : 'azul')}
                      >
                        <div className="lsq-addon-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2.5" y="4" width="19" height="12" rx="2" />
                            <path d="M8.5 20h7M12 16v4" />
                          </svg>
                        </div>
                        <div className="lsq-addon-body">
                          <div className="lsq-addon-name">Filtro luz azul</div>
                          <div className="lsq-addon-desc">
                            Reduce el cansancio visual de pantallas (celular, computadora). Ideal si pasas muchas horas frente a ellas.
                          </div>
                        </div>
                        <span className="lsq-addon-pr">{diffAzul > 0 ? `+$${diffAzul.toLocaleString('es-MX')}` : 'incluido'}</span>
                      </div>

                      {/* Fotocromático */}
                      <div
                        className={`lsq-addon-item ${selectedTrat === 'foto' ? 'lsq-addon-on' : ''}`}
                        onClick={() => setSelectedTrat(selectedTrat === 'foto' ? 'none' : 'foto')}
                      >
                        <div className="lsq-addon-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="4" />
                            <path d="M12 2v2M12 20v2M3 12H1m22 0h-2M5.3 5.3 4 4m16 16-1.3-1.3M18.7 5.3 20 4M4 20l1.3-1.3" />
                          </svg>
                        </div>
                        <div className="lsq-addon-body">
                          <div className="lsq-addon-name">Fotocromático</div>
                          <div className="lsq-addon-desc">
                            Se oscurece con el sol y se aclara en interiores: tus lentes y lentes de sol en uno solo.
                          </div>
                        </div>
                        <span className="lsq-addon-pr">{diffFoto > 0 ? `+$${diffFoto.toLocaleString('es-MX')}` : 'incluido'}</span>
                      </div>
                    </div>
                  )}

                  {/* Envío */}
                  <div className="lsq-ship-box">
                    <Truck size={20} className="lsq-ship-icon" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--lsq-navy)' }}>Envío</div>
                      <div className="lsq-note" style={{ marginTop: '2px' }}>
                        Se calcula según tu ciudad en el siguiente paso —lo ves <b>antes de pagar</b>. O recoge en tu óptica de Guadalajara, <b>sin costo</b>.
                      </div>
                    </div>
                  </div>

                  {/* Subtotal Total */}
                  <div className="lsq-total-row">
                    <span className="lsq-total-label">Subtotal · productos</span>
                    <b className="lsq-total-val">${currentSummaryPricing.price.toLocaleString('es-MX')}</b>
                  </div>

                  {/* Banner de Meses Sin Intereses (MSI) */}
                  {currentSummaryPricing.n > 0 && (
                    <div className="lsq-msi-banner">
                      <div className="lsq-msi-text">
                        PÁGALO A MESES<br />
                        <span>{currentSummaryPricing.n} meses sin intereses</span>
                      </div>
                      <div className="lsq-msi-amount">
                        ${currentSummaryPricing.monthly.toLocaleString('es-MX')}
                        <span>/mes</span>
                      </div>
                    </div>
                  )}

                  {/* Botón de acción */}
                  <div className="lsq-mobile-trust-flow">
                    <a 
                      className="lsq-wa-link" 
                      href={`https://wa.me/523316929111?text=${encodeURIComponent(`Hola, tengo una duda sobre ${frameDisplayName}.`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => { if (typeof window !== 'undefined' && (window as any).fbq) (window as any).fbq('track', 'Lead'); }}
                    >
                      <span className="lsq-wa-dot"></span> ¿Dudas? Escríbenos por WhatsApp
                    </a>
                  </div>

                  <div className="lsq-cta-container">
                    {tab === 'rx' && feasibleIndices.length === 0 ? (
                      <a
                        href={`https://wa.me/523316929111?text=${encodeURIComponent(`Hola, quise cotizar el armazón ${frameDisplayName} pero mi graduación requiere valoración médica especial. ¿Me podrían asesorar?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lsq-btn-cta"
                        style={{ textDecoration: 'none', background: '#b7791f', color: '#ffffff' }}
                      >
                        Agendar valoración por WhatsApp
                      </a>
                    ) : (
                      <button className="lsq-btn-cta" onClick={handleAddToCart}>
                        Agregar al carrito
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
