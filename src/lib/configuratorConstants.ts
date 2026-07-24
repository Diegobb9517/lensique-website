import { getOnlinePrice } from './pricing';

export const FRAME_GRADUACION_OPTIONS = [
  { id: 'SIN_GRADUACION_MICA', name: 'Sin graduación', description: 'Protección y estilo sin corrección visual.', price: getOnlinePrice(0) },
  { id: 'MONOFOCAL', name: 'Monofocal', description: 'Visión nítida en una sola distancia (lejos o cerca).', price: getOnlinePrice(0) },
  { id: 'BIFOCAL_FT', name: 'Bifocal Flat top', description: 'Corrige dos campos de visión con un segmento visible.', price: getOnlinePrice(1034.48) },
  { id: 'BIFOCAL_INV', name: 'Bifocal Invisible', description: 'Corrige dos campos de visión sin líneas visibles.', price: getOnlinePrice(1293.10) },
  { id: 'PROGRESIVO_EST', name: 'Progresivo Estandar', description: 'Visión clara a cualquier distancia (lejos, media y cerca).', price: getOnlinePrice(1896.55) },
  { id: 'PROGRESIVO_AV', name: 'Progresivo Avanzado', description: 'Mayor campo visual y adaptación más rápida.', price: getOnlinePrice(3448.28) },
];

export const AR_OPTIONS = [
  { id: 'AR_VERDE', name: 'Antirreflejante Verde', description: 'Elimina reflejos molestos y mejora la estética del lente.', price: getOnlinePrice(0) },
  { id: 'AR_AZUL', name: 'Filtro Azul', description: 'Bloquea la luz azul nociva de pantallas digitales.', price: getOnlinePrice(474.13) },
];

export const PHOTOCHROMIC_OPTIONS = [
  { id: 'NONE', name: 'Ninguno', description: 'Micas transparentes en todo momento.', price: getOnlinePrice(0) },
  { id: 'FOTO_GRIS', name: 'Fotocromático Gris', description: 'Se oscurecen en exteriores con un tono gris clásico.', price: getOnlinePrice(1637.93) },
  { id: 'FOTO_CAFE', name: 'Fotocromático Café', description: 'Se oscurecen en exteriores con un tono café cálido.', price: getOnlinePrice(1637.93) },
  { id: 'FOTO_AZUL', name: 'Fotocromático Azul', description: 'Se oscurecen en exteriores con un moderno tono azul.', price: getOnlinePrice(1637.93) },
];

export const TINTING_OPTIONS = [
  { id: 'NONE', name: 'Ninguno', description: 'Sin color añadido.', price: getOnlinePrice(0) },
  { id: 'TINT_ROJO', name: 'Rojo', description: 'Tinte estético rojo para un look atrevido.', price: getOnlinePrice(862.07) },
  { id: 'TINT_AMARILLO', name: 'Amarillo', description: 'Tinte estético amarillo, ideal para visión nocturna.', price: getOnlinePrice(862.07) },
  { id: 'TINT_AZUL', name: 'Azul', description: 'Tinte estético azul relajante.', price: getOnlinePrice(862.07) },
  { id: 'TINT_NARANJA', name: 'Naranja', description: 'Tinte estético naranja vibrante.', price: getOnlinePrice(862.07) },
];

export const MATERIAL_OPTIONS = [
  { id: 'CLASICO', name: 'Estándar', description: 'Grosor regular, ideal para graduaciones bajas a medias.', price: getOnlinePrice(0) },
  { id: 'HI_INDEX', name: 'Hi-Index (Adelgazado)', description: 'Micas hasta un 30% más delgadas y ligeras.', price: getOnlinePrice(1163.79) },
];
