const fs = require('fs');
const file = 'src/lib/delivery.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /export function getDeliveryEstimate\([\s\S]*?minDays \+= 3;\n      maxDays \+= 5;\n      break;\n    case 'pickup':\n    default:\n      break;\n  \}/;

const replacement = `// -----------------------------------------------------------------------------
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
  maxDays += sTime.max;`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync(file, code);
  console.log('delivery.ts refactored with config table');
} else {
  console.log('regex not found for refactoring delivery.ts');
}
