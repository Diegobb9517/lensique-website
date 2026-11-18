/**
 * productImages.ts
 * Gestor de imágenes de alta resolución oficiales y fallback de tarjetas uniformes.
 * 
 * Permite registrar y reemplazar URLs de imágenes de baja resolución por fotos
 * oficiales en alta fidelidad (ACUVUE/Johnson & Johnson, Bausch + Lomb, CooperVision, Alcon)
 * o mostrar la tarjeta uniforme y limpia cuando no haya imagen HD disponible.
 */

import { slugify, getContactLensUsage, getContactLensFormat } from './format';
import { getContactLensSpecs } from '../components/ContactLensConfiguratorModal';

/**
 * Registro de imágenes oficiales en Alta Resolución.
 * Diego / distribuidor puede agregar aquí las rutas locales (/assets/products/...)
 * o URLs directas de Cloudflare R2 / CDN oficial del fabricante.
 */
export const OFFICIAL_HD_PRODUCT_IMAGES: Record<string, string> = {
  // Diego / distribuidor puede agregar aquí las rutas locales o URLs directas
  // de Cloudflare R2 / CDN oficial en el futuro si desea reemplazar alguna imagen.
};

/**
 * Mapeo alternativo por nombre normalizado (slug)
 */
export const OFFICIAL_HD_SLUG_IMAGES: Record<string, string> = {};

/**
 * Determina si un producto pertenece a la categoría de lentes de contacto
 */
export function isContactLensProduct(product: any): boolean {
  if (!product) return false;
  const category = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  const sku = String(product.sku || '').toUpperCase();
  return category.includes('contacto') || sku.startsWith('LC-') || name.includes('acuvue') || name.includes('biofinity') || name.includes('biotrue');
}

/**
 * Obtiene la imagen oficial en alta resolución si está configurada
 */
export function getOfficialHdImage(product: any): string | null {
  if (!product) return null;

  // 1. Búsqueda por SKU
  if (product.sku) {
    const cleanSku = String(product.sku).trim().toUpperCase();
    if (OFFICIAL_HD_PRODUCT_IMAGES[cleanSku]) {
      return OFFICIAL_HD_PRODUCT_IMAGES[cleanSku];
    }
  }

  // 2. Búsqueda por ID de producto
  const idKey = `ID-${product.id}`;
  if (OFFICIAL_HD_PRODUCT_IMAGES[idKey]) {
    return OFFICIAL_HD_PRODUCT_IMAGES[idKey];
  }

  // 3. Búsqueda por slug del nombre
  const slug = slugify(product.name || '');
  for (const [key, url] of Object.entries(OFFICIAL_HD_SLUG_IMAGES)) {
    if (slug.includes(key)) {
      return url;
    }
  }

  return null;
}

/**
 * Obtiene la marca oficial limpia de lentes de contacto
 */
export function getContactLensBrand(product: any): string {
  const brand = String(product?.brand || '').trim();
  if (brand && brand !== 'null' && brand !== 'undefined') {
    return brand.toUpperCase();
  }
  const name = String(product?.name || '').toUpperCase();
  if (name.includes('ACUVUE')) return 'ACUVUE · JOHNSON & JOHNSON';
  if (name.includes('BIOFINITY') || name.includes('CLARITI') || name.includes('BIOMEDICS')) return 'COOPERVISION';
  if (name.includes('ULTRA') || name.includes('BIOTRUE') || name.includes('SOFLENS') || name.includes('OPTIMA')) return 'BAUSCH + LOMB';
  if (name.includes('AIR OPTIX') || name.includes('FRESHLOOK') || name.includes('DAILIES')) return 'ALCON';
  return 'LENTES DE CONTACTO';
}

/**
 * Determina el subtítulo descriptivo del lente
 */
export function getContactLensSubtitle(product: any): string {
  const name = String(product?.name || '').toUpperCase();
  if (name.includes('ASTIGMATIS') || name.includes('TORIC') || name.includes('TÓRICO')) {
    return 'Lente para Astigmatismo (Tórico)';
  }
  if (name.includes('MULTIFOCAL')) {
    return 'Lente Multifocal / Presbicia';
  }
  if (name.includes('COLOR') || name.includes('COLORS') || name.includes('FRESHLOOK')) {
    return 'Lente Cosmético de Color';
  }
  return 'Lente de Contacto Esférico';
}

/**
 * Extrae especificaciones clave para la tarjeta uniforme
 */
export function getContactLensCardSpecs(product: any) {
  const specs = getContactLensSpecs(product);
  const usage = getContactLensUsage(product?.name || '');
  const format = getContactLensFormat(product);

  const bcText = specs.bcOptions && specs.bcOptions.length > 0 
    ? `BC ${specs.bcOptions.join('/')}` 
    : 'BC 8.6';
  const diaText = specs.dia ? `DIA ${specs.dia}` : 'DIA 14.0';

  return {
    bc: bcText,
    dia: diaText,
    usage: usage === 'Todos' ? 'Uso Quincenal / Mensual' : usage,
    format,
    isMultipleBc: specs.isMultipleBc
  };
}
