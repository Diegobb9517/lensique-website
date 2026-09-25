// src/lib/delivery.ts

export type FrameAvailability = 'instock' | 'preorder' | 'contact_spherical' | 'contact_toric';
export type LensType = 'none' | 'mono_basic' | 'mono_complex' | 'progressive_bifocal' | 'photochromic' | 'special';
export type ShippingMethod = 'pickup' | 'zmg' | 'national';

export interface DeliveryEstimate {
  minDays: number;
  maxDays: number;
  labelShort: string; // e.g., "3-5 días"
  dateRange: string;  // e.g., "Llega entre el 9 y el 16 de octubre"
}

// Function to add business days to a date
function addBusinessDays(startDate: Date, daysToAdd: number): Date {
  const date = new Date(startDate.getTime());
  let daysAdded = 0;
  while (daysAdded < daysToAdd) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    // Skip weekends (0 is Sunday, 6 is Saturday)
    if (day !== 0 && day !== 6) {
      daysAdded++;
    }
  }
  return date;
}

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

function formatDate(date: Date): string {
  return `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

// -----------------------------------------------------------------------------
// TABLA DE TIEMPOS DE ENTREGA (DÍAS HÁBILES)
// Diego: Puedes editar estos números directamente. 
// Cada paso suma días al tiempo total.
// -----------------------------------------------------------------------------
export const DELIVERY_DAYS = {
  frame: {
    instock: { min: 2, max: 3 },
    preorder: { min: 7, max: 14 },
    contact_spherical: { min: 3, max: 5 },
    contact_toric: { min: 7, max: 14 }
  },
  lens: {
    none: { min: 0, max: 0 },
    mono_basic: { min: 1, max: 2 },
    mono_complex: { min: 2, max: 3 },
    progressive_bifocal: { min: 4, max: 7 },
    photochromic: { min: 4, max: 7 },
    special: { min: 4, max: 7 }
  },
  shipping: {
    pickup: { min: 0, max: 0 },
    zmg: { min: 1, max: 2 },
    national: { min: 3, max: 5 }
  }
};
// -----------------------------------------------------------------------------

export function getDeliveryEstimate(
  frameAvailability: FrameAvailability,
  lensType: LensType = 'none',
  shippingMethod: ShippingMethod = 'pickup'
): DeliveryEstimate {
  let minDays = 0;
  let maxDays = 0;

  // 1. Frame / Contacts time
  const fTime = DELIVERY_DAYS.frame[frameAvailability] || { min: 0, max: 0 };
  minDays += fTime.min;
  maxDays += fTime.max;

  // 2. Lens manufacturing time
  const lTime = DELIVERY_DAYS.lens[lensType] || { min: 0, max: 0 };
  minDays += lTime.min;
  maxDays += lTime.max;

  // 3. Shipping time
  const sTime = DELIVERY_DAYS.shipping[shippingMethod] || { min: 0, max: 0 };
  minDays += sTime.min;
  maxDays += sTime.max;

  const today = new Date();
  const minDate = addBusinessDays(today, minDays);
  const maxDate = addBusinessDays(today, maxDays);

  let dateRange = '';
  if (minDate.getMonth() === maxDate.getMonth()) {
    dateRange = `Llega entre el ${minDate.getDate()} y el ${maxDate.getDate()} de ${MONTHS[maxDate.getMonth()]}`;
  } else {
    dateRange = `Llega entre el ${formatDate(minDate)} y el ${formatDate(maxDate)}`;
  }

  let labelShort = '';
  if (maxDays <= 5) {
    labelShort = `${minDays}-${maxDays} días`;
  } else if (maxDays <= 14) {
    labelShort = '1-2 sem';
  } else {
    labelShort = '2-3 sem';
  }

  return {
    minDays,
    maxDays,
    labelShort,
    dateRange
  };
}

export function calculateDeliveryTime(product: any, lensConfig?: any, fulfillmentMethod?: string) {
  const isContactLens = String(product?.category || '').toLowerCase().includes('contacto');
  let frameAvailability: FrameAvailability = 'instock';
  
  if (isContactLens) {
    const isToricOrMultifocal = String(product?.name || '').toLowerCase().match(/tóric|toric|astigmatism|multifocal|presbicia|presbyopia/);
    frameAvailability = isToricOrMultifocal ? 'contact_toric' : 'contact_spherical';
  } else {
    const isOutOfStock = product?.stock != null && product.stock !== '' && Number(product.stock) <= 0;
    frameAvailability = isOutOfStock ? 'preorder' : 'instock';
  }

  let lensType: LensType = isContactLens ? 'none' : 'mono_basic';
  if (lensConfig) {
    const isProgressive = lensConfig.tipo?.toLowerCase().includes('progresivo') || lensConfig.tipo?.toLowerCase().includes('bifocal') || lensConfig.tipo?.toLowerCase().includes('ocupacional');
    const isPhotochromic = lensConfig.etiqueta?.toLowerCase().includes('fotocromático');
    const isSpecial = lensConfig.tipo?.toLowerCase().includes('polar') || lensConfig.etiqueta?.toLowerCase().includes('tinte');
    const isComplex = lensConfig.indice === '1.67' || lensConfig.indice === '1.74' || lensConfig.indice === '1.60';
    
    if (isProgressive) lensType = 'progressive_bifocal';
    else if (isPhotochromic) lensType = 'photochromic';
    else if (isSpecial) lensType = 'special';
    else if (isComplex) lensType = 'mono_complex';
    else lensType = 'mono_basic';
  }

  let shippingMethod: ShippingMethod = 'pickup';
  if (fulfillmentMethod === 'HOME_DELIVERY') {
    // We can assume national for safety if we don't know the exact address, 
    // but in CartDrawer we'll just show 'national' as standard delivery.
    shippingMethod = 'national';
  } else if (fulfillmentMethod === 'STORE_PICKUP') {
    shippingMethod = 'pickup';
  }

  const est = getDeliveryEstimate(frameAvailability, lensType, shippingMethod);
  
  return {
    label: est.dateRange,
    subtitle: `Incluye ${lensConfig ? 'fabricación de micas' : 'preparación'}${frameAvailability === 'preorder' ? ' (sobre pedido)' : ''} · Te avisamos por WhatsApp cuando esté listo`,
    maxDays: est.maxDays,
    labelShort: est.labelShort
  };
}
