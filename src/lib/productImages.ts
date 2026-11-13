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
  // ACUVUE (Johnson & Johnson)
  'LC-ACUVUE2': '/assets/products/acuvue2_hd.png',
  'LC-ACUVUEOASYS': '/assets/products/acuvue_oasys_hd.png',
  'LC-ACUVUEOASYSASTI': '/assets/products/acuvue_oasys_astigmatismo_hd.png',
  'LC-ACUVUE1DAYMOIST': '/assets/products/acuvue_1day_moist_hd.png',
  'LC-1DAYACUVUEMOIST': '/assets/products/acuvue_1day_moist_hd.png',
  'LC-ACUVUEOASYSWITH': '/assets/products/acuvue_oasys_hydraluxe_hd.png',
  'LC-ACUVUEVITATORIC': '/assets/products/acuvue_vita_toric_hd.png',

  // COOPERVISION (Biofinity, Clariti)
  'LC-BIOFINITY': '/assets/products/biofinity_hd.png',
  'LC-BIOFINITYTORIC': '/assets/products/biofinity_toric_hd.png',
  'LC-BIOFINITYMULTIF': '/assets/products/biofinity_multifocal_hd.png',
  'LC-CLARITI1DAYTORI': '/assets/products/clariti_1day_toric_hd.png',
  'LC-CLARITI1DAYMULT': '/assets/products/clariti_1day_multifocal_hd.png',
  'LC-BIOMEDICS55': '/assets/products/biomedics55_hd.png',

  // BAUSCH + LOMB (Ultra, Biotrue, SofLens)
  'LC-BAUSCHLOMBULTRA': '/assets/products/bausch_ultra_hd.png',
  'LC-BIOTRUEONEDAY': '/assets/products/biotrue_oneday_hd.png',
  'LC-BIOTRUEONEDAYAS': '/assets/products/biotrue_oneday_astigmatismo_hd.png',
  'LC-SOFLENS59': '/assets/products/soflens59_hd.png',
  'LC-OPTIMA38': '/assets/products/optima38_hd.png',

  // ALCON (Air Optix, FreshLook, Dailies)
  'LC-AIROPTIXAQUANIG': '/assets/products/air_optix_night_day_hd.png',
  'LC-AIROPTIXCOLORS': '/assets/products/air_optix_colors_hd.png',
  'LC-FRESHLOOKCOLORB': '/assets/products/freshlook_colorblends_hd.png'
};

/**
 * Mapeo alternativo por nombre normalizado (slug)
 */
export const OFFICIAL_HD_SLUG_IMAGES: Record<string, string> = {
  'acuvue-2': '/assets/products/acuvue2_hd.png',
  'acuvue-oasys': '/assets/products/acuvue_oasys_hd.png',
  'acuvue-oasys-astigmatismo': '/assets/products/acuvue_oasys_astigmatismo_hd.png',
  'acuvue-1-day-moist': '/assets/products/acuvue_1day_moist_hd.png',
  'biofinity': '/assets/products/biofinity_hd.png',
  'biofinity-toric': '/assets/products/biofinity_toric_hd.png',
  'biofinity-multifocal': '/assets/products/biofinity_multifocal_hd.png',
  'air-optix-aqua-night-day': '/assets/products/air_optix_night_day_hd.png',
  'soflens-59': '/assets/products/soflens59_hd.png',
  'biotrue-one-day': '/assets/products/biotrue_oneday_hd.png'
};

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
