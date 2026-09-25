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

export function getDeliveryEstimate(
  frameAvailability: FrameAvailability,
  lensType: LensType = 'none',
  shippingMethod: ShippingMethod = 'pickup'
): DeliveryEstimate {
  let minDays = 0;
  let maxDays = 0;

  // 1. Frame / Contacts time
  switch (frameAvailability) {
    case 'instock':
      minDays += 2;
      maxDays += 3;
      break;
    case 'preorder':
      minDays += 7;
      maxDays += 14;
      break;
    case 'contact_spherical':
      minDays += 3;
      maxDays += 5;
      break;
    case 'contact_toric':
      minDays += 7;
      maxDays += 14;
      break;
  }

  // 2. Lens manufacturing time
  switch (lensType) {
    case 'mono_basic':
      minDays += 1;
      maxDays += 2;
      break;
    case 'mono_complex':
      minDays += 2;
      maxDays += 3;
      break;
    case 'progressive_bifocal':
    case 'photochromic':
    case 'special':
      minDays += 4;
      maxDays += 7; // User specified up to 7 days
      break;
    case 'none':
    default:
      break;
  }

  // 3. Shipping time
  switch (shippingMethod) {
    case 'zmg':
      minDays += 1;
      maxDays += 2;
      break;
    case 'national':
      minDays += 3;
      maxDays += 5;
      break;
    case 'pickup':
    default:
      break;
  }

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

  let lensType: LensType = 'none';
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
