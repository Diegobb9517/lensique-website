export const toTitleCase = (str: string) => {
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, s => s.toUpperCase());
};

export const formatBrandName = (brand: string): string => {
  if (!brand) return '';
  const b = brand.trim();
  if (/^ray-?ban$/i.test(b)) return 'Ray-Ban';
  if (/^oq optiqus$/i.test(b)) return 'OQ Optiqus';
  if (/^thf$/i.test(b) || /^tommy hilfiger$/i.test(b)) return 'Tommy Hilfiger';
  if (/^calvin klein$/i.test(b)) return 'Calvin Klein';
  if (/^pierre thomas$/i.test(b)) return 'Pierre Thomas';
  return toTitleCase(b);
};

/**
 * Normaliza y embellece el título de un lente de contacto:
 * - Elimina ruidos técnicos como "(blando Tórico)", "(Blando Cosmético)", etc.
 * - Limpia prefijos como "LC-" o "LC ".
 * - Corrige erratas comunes de catálogo.
 * - Aplica Title Case impecable respetando minúsculas en preposiciones españolas ("para Astigmatismo", "con Graduación").
 * - Garantiza la ortografía oficial de marcas: "Biotrue ONEday", "1-Day Acuvue Moist", "Air Optix", etc.
 */
export const formatContactLensTitle = (raw: string): string => {
  if (!raw) return 'Lentes de contacto';
  let n = raw.trim();

  // Overrides de SKUs conocidos
  if (n === 'LC-BIOTRUEONEDAY') return 'Biotrue ONEday';
  if (n === 'LC-BIOTRUEONEDAYAS') return 'Biotrue ONEday para Astigmatismo';

  // Quitar prefijo LC- o LC
  if (/^LC[\s-]+/i.test(n)) {
    n = n.replace(/^LC[\s-]+/i, '');
  }

  // Quitar ruidos en paréntesis técnicos del catálogo como "(blando Tórico)", "(Blando Cosmético)", etc.
  n = n.replace(/\s*\(\s*Blando(?:\s+[^)]+)?\s*\)/gi, '');
  n = n.replace(/\s*\(\s*(?:Esf[eé]rico|T[oó]rico|Multifocal|Cosm[eé]tico)\s*\)/gi, '');
  n = n.replace(/\s*\([^)]*\)\s*$/g, '');

  // Corregir erratas de catálogo
  n = n.replace(/\bdalies\b/gi, 'Dailies');
  n = n.replace(/\bbioinfinity\b/gi, 'Biofinity');

  // Normalizar palabras con Title Case inteligente
  const words = n.split(/\s+/);
  const lowerWords = ['para', 'con', 'de', 'en', 'por', 'y', 'o', 'del', 'los', 'las', 'with'];
  const formattedWords = words.map((w, i) => {
    const cleanW = w.toLowerCase();
    if (i > 0 && lowerWords.includes(cleanW)) return cleanW;
    return cleanW.charAt(0).toUpperCase() + cleanW.slice(1);
  });
  n = formattedWords.join(' ');

  // Marcas y modelos con ortografía oficial
  n = n.replace(/\bBiotrue\s+One\s*day\b/gi, 'Biotrue ONEday');
  n = n.replace(/\bBiotrue\s+Oneday\b/gi, 'Biotrue ONEday');
  n = n.replace(/\b1-day\s+Acuvue\s+Moist\b/gi, '1-Day Acuvue Moist');
  n = n.replace(/\bAcuvue\s+1\s*day\s*moist\b/gi, '1-Day Acuvue Moist');
  n = n.replace(/\bClariti\s+1\s*day\b/gi, 'Clariti 1 Day');
  n = n.replace(/\bFreshlook\s+One\s*day\b/gi, 'FreshLook One Day');
  n = n.replace(/\bFreshlook\s+Colorblends\b/gi, 'FreshLook ColorBlends');
  n = n.replace(/\bBausch\s*\+\s*Lomb\s+Ultra\b/gi, 'Bausch + Lomb Ultra');
  n = n.replace(/\bAir\s+Optix\s+Aqua\s+Night\s*&\s*Day\b/gi, 'Air Optix Night & Day');
  n = n.replace(/\bAir\s+Optix\s+Colors\b/gi, 'Air Optix Colors');
  n = n.replace(/\bAir\s+Optix\s+Plus\s+Hydraglyde\b/gi, 'Air Optix Plus HydraGlyde');
  n = n.replace(/\bAir\s+Optix\s+Hydraglyde\b/gi, 'Air Optix HydraGlyde');
  n = n.replace(/\bHydraluxe\b/gi, 'HydraLuxe');
  n = n.replace(/\bLunare\s+con\s+graduaci[oó]n\b/gi, 'Lunare con Graduación');
  n = n.replace(/\bLunare\s+neutros\b/gi, 'Lunare Neutros');
  n = n.replace(/\bSoflens\s+59\b/gi, 'SofLens 59');
  n = n.replace(/\bSoflens\s+Toric\b/gi, 'SofLens Toric');
  n = n.replace(/\bOptima\s+38\b/gi, 'Optima 38');
  n = n.replace(/\bSense\s+Toricos\b/gi, 'Sense Tóricos');
  n = n.replace(/\bBiofinity\s+Toric\b/gi, 'Biofinity Toric');
  n = n.replace(/\bBiofinity\s+Multifocal\b/gi, 'Biofinity Multifocal');
  n = n.replace(/\bBiofinity\s+Energys\b/gi, 'Biofinity Energys');
  n = n.replace(/\bBiofinity\s+Xr\b/gi, 'Biofinity XR');
  n = n.replace(/\bBiofinity\s+Toric\s+Xr\b/gi, 'Biofinity Toric XR');
  n = n.replace(/\bTorico\b/gi, 'Tórico');

  // Quitar la palabra redundante 'blandos' en títulos
  n = n.replace(/\bblandos\s+/gi, '');

  // Asegurar que Astigmatismo use 'para Astigmatismo' de forma natural
  if (/\bAstigmatismo\b/i.test(n) && !/\bpara\s+Astigmatismo\b/i.test(n)) {
    n = n.replace(/\bAstigmatismo\b/i, 'para Astigmatismo');
  }
  n = n.replace(/\bpara\s+para\s+Astigmatismo\b/gi, 'para Astigmatismo');

  return n.replace(/\s{2,}/g, ' ').trim();
};

export const formatModelName = (modelRaw: string): string => {
  if (!modelRaw) return '';
  let cleaned = modelRaw.trim();
  cleaned = cleaned.replace(/^[0oO](?=[A-Za-z]{2})/i, '');
  return cleaned;
};

export const isProvisionalName = (product: any): boolean => {
  const isContact = String(product.category || '').toLowerCase().includes('contacto');
  if (!isContact) return false;
  let name = (product.name || product.model || '').trim();
  name = name.replace(/\s*\([^)]*\)\s*$/g, '').trim();
  return (!product.description && (/^LC-[A-Z0-9]+$/i.test(name) || name === product.sku));
};

export const getDisplayName = (product: any): string => {
  if (!product) return '';
  if (product.display_name) return product.display_name.trim();
  
  const brand = (product.brand && product.brand !== 'null') ? formatBrandName(product.brand) : '';
  const cleanModel = getCardDisplayName(product);
  
  if (!brand) return cleanModel;
  if (cleanModel.toUpperCase().startsWith(brand.toUpperCase())) {
    return cleanModel;
  }
  return `${brand} ${cleanModel}`.trim();
};

export const getCardDisplayName = (product: any): string => {
  if (!product) return '';
  
  const isContact = String(product.category || '').toLowerCase().includes('contacto') || String(product.sku || '').toUpperCase().startsWith('LC-');
  let brand = (product.brand && product.brand !== 'null') ? product.brand.trim() : '';
  let rawName = (product.model || product.name || '').trim();

  // 1. Lentes de contacto: formato limpio y unificado
  if (isContact) {
    return formatContactLensTitle(product.name || product.model || product.sku || '');
  }

  // 2. Armazones / Sol
  let clean = rawName;

  // Si no hay marca en product.brand, inferir si el nombre comienza con alguna marca conocida
  const KNOWN_BRANDS = [
    'RAY-BAN', 'RAY BAN', 'ARNETTE', 'VOGUE', 'CARRERA', 'CALVIN KLEIN',
    'TOMMY HILFIGER', 'LACOSTE', 'RALPH', 'OAKLEY', 'PUMA', 'SEMA', 'ACADEMIC', 'PIERRE THOMAS'
  ];
  if (!brand) {
    for (const kb of KNOWN_BRANDS) {
      if (clean.toUpperCase().startsWith(kb)) {
        brand = kb;
        clean = clean.substring(kb.length).trim();
        break;
      }
    }
  } else {
    // Si el nombre comienza con la marca, retirarla para no duplicar
    const bUpper = brand.toUpperCase();
    while (clean.toUpperCase().startsWith(bUpper)) {
      clean = clean.substring(bUpper.length).trim();
    }
  }

  // Quitar prefijos tipo "RAY-BAN VISTA" o "VISTA"
  clean = clean.replace(/^(?:RAY-?BAN\s+)?VISTA\s+/i, '');

  // Quitar "(Vista)", "Vista", "(Sol)", "Sol"
  clean = clean.replace(/\s*\((?:Vista|Sol)\)/gi, '');
  clean = clean.replace(/\b(?:Vista|Sol)\b/gi, '');

  // Quitar "Talla" y todo lo que venga después de "Talla"
  clean = clean.replace(/\s*Talla\b.*$/i, '');

  // Quitar paréntesis con códigos tipo (27581W)
  clean = clean.replace(/\s*\([^)]*\)/g, '');

  // Quitar sufijos de color/código tipo " - 770", " - 2500", " - W44", "- 6279", " - 5001"
  clean = clean.replace(/\s*-\s*[A-Za-z0-9\u00C0-\u017F/]+(?:\s+[A-Za-z0-9\u00C0-\u017F/]+)*\s*$/, '');

  // Códigos compuestos con guión como "CA-3033-807", "CK-18122-200", "L-2776-214", "CA-8901-BK/GD"
  const multiDashMatch = clean.match(/^([A-Za-z]{1,4}-\d+[A-Za-z]?)-([A-Za-z0-9/]+)$/);
  if (multiDashMatch) {
    clean = multiDashMatch[1];
  }

  // Quitar sufijo de color separado por espacio en modelos tipo Vogue: "0VO4321 280", "0VO5691 W44", "0VO5680B W656"
  clean = clean.replace(/^([0oO]?[A-Za-z]{2}\d+[A-Za-z]?)\s+[A-Za-z0-9/]+.*$/, '$1');

  // Limpiar prefijo 0 u O en modelos Luxottica (0AN6150 -> AN6150, 0VO5756 -> VO5756, 0RX3447V -> RX3447V)
  clean = formatModelName(clean);

  // Formatear tokens: respetar siglas y códigos de modelo en mayúsculas, y title-case para palabras comunes
  clean = clean.split(/\s+/).map(token => {
    if (/\d/.test(token) || /^(TH|CK|CA|ML|PU|SM|RA|RX|AN|VO)$/i.test(token)) {
      return token.toUpperCase();
    }
    return toTitleCase(token);
  }).join(' ');

  const formattedBrand = formatBrandName(brand);

  // Si clean repite la marca formateada, retirarla
  if (formattedBrand && clean.toUpperCase().startsWith(formattedBrand.toUpperCase())) {
    clean = clean.substring(formattedBrand.length).trim();
  }

  // Limpiar guiones o espacios huérfanos
  clean = clean.replace(/\s*-\s*$/, '').replace(/\s{2,}/g, ' ').trim();

  // Casos a cuidar: si al quitar la marca el nombre quedaría vacío, sin caracteres alfanuméricos,
  // o solo con la marca, dejar el nombre como está hoy (mejor repetir que dejar en blanco)
  if (!clean || !/[a-zA-Z0-9]/.test(clean) || (formattedBrand && clean.toUpperCase() === formattedBrand.toUpperCase())) {
    clean = (formattedBrand || rawName).trim();
  }

  return clean;
};

export const formatProductTitle = (product: any, prefix: string = 'Lentes') => {
  if (!product) return prefix;
  
  const brand = (product.brand && product.brand !== 'null') ? product.brand.trim() : '';
  const name = (product.model || product.name || '').trim();
  
  if (brand && name.toUpperCase().startsWith(brand.toUpperCase())) {
     // Si el nombre ya incluye la marca al principio, no la duplicamos
     return `${prefix} ${name}`.trim();
  }
  
  return `${prefix} ${brand ? brand + ' ' : ''}${name}`.trim();
};

export const getContactLensUsage = (name: string): string => {
  const n = (name ? name.toString() : '').toUpperCase();
  if (n.includes('1 DAY') || n.includes('1-DAY') || n.includes('DAILY') || n.includes('DAILIES') || n.includes('DIARIO') || n.includes('ONE DAY') || n.includes('ONEDAY') || n.includes('PRECISION1')) return 'Uso Diario';
  if (n.includes('BIWEEKLY') || n.includes('QUINCENAL') || (n.includes('OASYS') && !n.includes('1 DAY') && !n.includes('1-DAY'))) return 'Uso Quincenal';
  if (n.includes('MONTHLY') || n.includes('MENSUAL') || n.includes('ULTRA') || n.includes('AIR OPTIX') || n.includes('BIOFINITY')) return 'Uso Mensual';
  if (n.includes('YEARLY') || n.includes('ANUAL') || n.includes('ANNUAL') || n.includes('LUNARE') || n.includes('STARS') || n.includes('SENSE') || n.includes('OPTIMA 38')) return 'Uso Anual';
  return 'Todos';
};

export const getContactLensFormat = (product: any): string => {
  const n = String(product?.name || (typeof product === 'string' ? product : '')).toUpperCase();
  if (n.includes('COLOR') || n.includes('LUNARE') || n.includes('STARS') || n.includes('AIR OPTIX COLORS') || n.includes('FRESHLOOK')) {
    if (n.includes('AIR OPTIX')) return 'Caja con 2 lentes · uso mensual por lente';
    if (n.includes('FRESHLOOK')) {
      if (n.includes('ONE') || n.includes('1 DAY') || n.includes('1-DAY') || n.includes('DAILY')) return 'Caja con 10 lentes · uso diario';
      return 'Caja con 2 lentes · uso mensual';
    }
    if (n.includes('LUNARE') || n.includes('STARS')) return 'Lente individual · uso anual';
    return 'Lentes de contacto cosméticos de color';
  }
  if (n.includes('SENSE') || n.includes('ANUAL') || n.includes('LIBERTI') || n.includes('OPTIMA 38')) return 'Lente individual · uso anual';
  if (n.includes('1 DAY') || n.includes('1-DAY') || n.includes('DAILY') || n.includes('DAILIES') || n.includes('DIARIO') || n.includes('ONE DAY') || n.includes('ONEDAY') || n.includes('PRECISION1')) {
    return 'Caja con 30 lentes · uso diario';
  }
  if (n.includes('BIWEEKLY') || n.includes('QUINCENAL') || (n.includes('OASYS') && !n.includes('1 DAY') && !n.includes('1-DAY'))) {
    return 'Caja con 6 lentes · uso quincenal';
  }
  if (n.includes('MONTHLY') || n.includes('MENSUAL') || n.includes('ULTRA') || n.includes('AIR OPTIX') || n.includes('BIOFINITY')) {
    return 'Caja con 6 lentes · uso mensual';
  }
  return 'Caja con 6 lentes · uso mensual';
};

export const slugify = (str: string): string => {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getProductSlug = (product: any): string => {
  if (!product) return '';
  const brand = (product.brand && product.brand !== 'null') ? product.brand.trim() : '';
  const model = (product.model || product.name || '').trim();
  const sku = (product.sku || '').trim();
  
  const parts = [brand, model, sku].filter(Boolean);
  let slug = slugify(parts.join(' '));
  if (!slug) slug = `producto-${product.id}`;
  return slug;
};

export const findProductBySlug = (catalog: any[], slug: string): any | null => {
  if (!catalog || !Array.isArray(catalog) || !slug) return null;
  const targetSlug = slug.toLowerCase().trim();
  
  // 1. Exact match with canonical getProductSlug
  const exact = catalog.find(p => getProductSlug(p) === targetSlug);
  if (exact) return exact;

  // 2. ID match: '52' or 'producto-52'
  const idMatch = catalog.find(p => p.id && (String(p.id) === targetSlug || `producto-${p.id}` === targetSlug));
  if (idMatch) return idMatch;

  // 3. Match by SKU or combinations (brand-sku, brand-sku-sku, brand-name, etc.)
  const skuMatches = catalog.filter(p => {
    if (!p.sku) return false;
    const skuSlug = slugify(p.sku);
    if (!skuSlug) return false;
    if (skuSlug === targetSlug) return true;

    const brandSlug = slugify(p.brand || '');
    if (brandSlug) {
      if (`${brandSlug}-${skuSlug}` === targetSlug) return true;
      if (`${brandSlug}-${skuSlug}-${skuSlug}` === targetSlug) return true;
    }
    const nameSlug = slugify(p.name || '');
    if (nameSlug && `${brandSlug}-${nameSlug}` === targetSlug) return true;
    return false;
  });
  if (skuMatches.length === 1) return skuMatches[0];

  // 4. Substring SKU match if SKU has significant length (>= 5 chars)
  const substrMatches = catalog.filter(p => {
    if (!p.sku) return false;
    const skuSlug = slugify(p.sku);
    if (skuSlug.length >= 5 && targetSlug.includes(skuSlug)) {
      return true;
    }
    return false;
  });
  if (substrMatches.length === 1) return substrMatches[0];
  if (substrMatches.length > 1) {
    const brandMatch = substrMatches.find(p => {
      const brandSlug = slugify(p.brand || '');
      return brandSlug && targetSlug.includes(brandSlug);
    });
    if (brandMatch) return brandMatch;
    return substrMatches[0];
  }

  return null;
};

export const isInStock = (product: any): boolean => {
  if (!product) return false;
  return product.stock != null && product.stock !== '' && Number(String(product.stock).trim()) > 0;
};

export interface CartItemDisplayInfo {
  title: string;
  color?: string;
}

/**
 * Formatea el título de un ítem en el carrito para presentarlo estéticamente limpio,
 * eliminando paréntesis redundantes como "(Blando Cosmético)" o "(Color: ...)" y extrayendo
 * el color a una línea descriptiva propia.
 */
export const parseCartItemDisplay = (title: string, lensConfig?: any): CartItemDisplayInfo => {
  let cleanTitle = title || '';
  let color = lensConfig?.selectedColor || '';

  // Extraer color si viene en el título ej. "(Color: Blue (Azul))" o "(Color: Blue)"
  const colorMatch = cleanTitle.match(/\s*\(\s*Color:\s*(.+?)\)(?=\s*(?:\(|$))/i);
  if (colorMatch) {
    if (!color) color = colorMatch[1].trim();
    cleanTitle = cleanTitle.replace(colorMatch[0], '').trim();
  }

  // Eliminar clasificaciones de tipo en paréntesis ej. "(Blando Cosmético)", "(Blando Esférico)"
  cleanTitle = cleanTitle
    .replace(/\s*\(\s*Blando\s+[^)]+\s*\)/gi, '')
    .replace(/\s*\(\s*(?:Esf[eé]rico|T[oó]rico|Multifocal|Cosm[eé]tico)\s*\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Normalizar nombres todo en mayúsculas a Title Case estético
  cleanTitle = cleanTitle
    .replace(/\bLUNARE CON GRADUACI[OÓ]N\b/gi, 'Lunare con Graduación')
    .replace(/\bLUNARE NEUTROS\b/gi, 'Lunare Neutros')
    .replace(/\bOPTIMA 38\b/gi, 'Optima 38')
    .replace(/\bSOFLENS TORIC\b/gi, 'SofLens Toric')
    .replace(/\bSOFLENS 59\b/gi, 'SofLens 59')
    .replace(/\bFRESHLOOK ONE DAY\b/gi, 'FreshLook One Day')
    .replace(/\bLC CLARITI 1 DAY\b/gi, 'Clariti 1 Day')
    .replace(/\bLIBERTI TORICO\b/gi, 'Liberti Tórico')
    .replace(/\bDAILIES TOTAL\b/gi, 'Dailies Total')
    .replace(/\bBIOMEDICS NOW\b/gi, 'Biomedics Now')
    .replace(/\bBIOMEDICS 55\b/gi, 'Biomedics 55')
    .trim();

  // Asegurar formato estético unificado para lentes de contacto
  const isContact = cleanTitle.toLowerCase().includes('lente') || !!lensConfig;
  if (isContact) {
    const hasPrefix = /^Lentes de contacto\s+/i.test(cleanTitle);
    const sub = cleanTitle.replace(/^Lentes de contacto\s+/i, '');
    cleanTitle = (hasPrefix ? 'Lentes de contacto ' : '') + formatContactLensTitle(sub);
  }

  let colorDisplay = '';
  if (color) {
    colorDisplay = `Color: ${color}`;
  }

  return { title: cleanTitle, color: colorDisplay };
};

