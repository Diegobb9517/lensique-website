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

export const formatModelName = (modelRaw: string): string => {
  if (!modelRaw) return '';
  let cleaned = modelRaw.trim();
  cleaned = cleaned.replace(/^[0oO](?=[A-Za-z]{2})/i, '');
  return cleaned;
};

export const isProvisionalName = (product: any): boolean => {
  const isContact = String(product.category || '').toLowerCase().includes('contacto');
  if (!isContact) return false;
  let model = (product.model || product.name || '').trim();
  return (!product.description && (/^LC-/i.test(model) || model === product.sku));
};

export const getDisplayName = (product: any): string => {
  if (!product) return '';
  if (product.display_name) return product.display_name.trim();
  
  const brand = (product.brand && product.brand !== 'null') ? product.brand.trim() : '';
  let model = (product.model || product.name || '').trim();
  
  const isContact = String(product.category || '').toLowerCase().includes('contacto');
  if (isContact && (/^LC-/i.test(model) || model === product.sku)) {
    let descText = '';
    if (product.description) {
      descText = toTitleCase(product.description.split(/\s+/).slice(0, 6).join(' '));
      return (brand ? brand + ' ' + descText : descText).trim();
    } else {
      let skuRaw = product.sku || model;
      return skuRaw.replace(/^LC-/i, '');
    }
  }
  
  if (brand) {
    const brandUpper = brand.toUpperCase().trim();
    let cleaned = false;
    do {
      cleaned = false;
      if (model.toUpperCase().startsWith(brandUpper)) {
        model = model.substring(brandUpper.length).trim();
        cleaned = true;
      }
    } while (cleaned);
  }
  
  const isFrame = !String(product.category || '').toLowerCase().includes('sol') && !String(product.category || '').toLowerCase().includes('contacto');
  if (isFrame) {
    model = model.replace(/^VISTA\s+/i, '').trim();
  }
  
  model = formatModelName(model);
  
  return (brand ? brand + ' ' + model : model).trim();
};

export const getCardDisplayName = (product: any): string => {
  if (!product) return '';
  
  const isContact = String(product.category || '').toLowerCase().includes('contacto');
  let brand = (product.brand && product.brand !== 'null') ? product.brand.trim() : '';
  let rawName = (product.model || product.name || '').trim();

  // 1. Lentes de contacto: mantener la lógica actual
  if (isContact) {
    if (!product.description && (/^LC-/i.test(rawName) || rawName === product.sku)) {
      let descText = '';
      if (product.description) {
        descText = toTitleCase(product.description.split(/\s+/).slice(0, 6).join(' '));
        return (brand ? `${formatBrandName(brand)} ${descText}` : descText).trim();
      } else {
        let skuRaw = product.sku || rawName;
        return skuRaw.replace(/^LC-/i, '');
      }
    }
    if (brand && rawName.toUpperCase().startsWith(brand.toUpperCase())) {
      rawName = rawName.substring(brand.length).trim();
    }
    return (brand ? `${formatBrandName(brand)} ${rawName}` : rawName).trim();
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

  // Combinar Marca + Modelo
  let result = (formattedBrand ? `${formattedBrand} ${clean}` : clean).trim();

  // Limpiar guiones o espacios huérfanos
  result = result.replace(/\s*-\s*$/, '').replace(/\s{2,}/g, ' ');

  return result;
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

export const getContactLensUsage = (name: string) => {
  const n = (name ? name.toString() : '').toUpperCase();
  if (n.includes('1 DAY') || n.includes('DAILY') || n.includes('DIARIO') || n.includes('ONE DAY')) return 'Uso Diario';
  if (n.includes('BIWEEKLY') || n.includes('QUINCENAL') || n.includes('OASYS')) return 'Uso Quincenal';
  if (n.includes('MONTHLY') || n.includes('MENSUAL') || n.includes('ULTRA') || n.includes('AIR OPTIX') || n.includes('BIOFINITY')) return 'Uso Mensual';
  if (n.includes('YEARLY') || n.includes('ANUAL') || n.includes('ANNUAL')) return 'Uso Anual';
  return 'Todos';
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
  
  const exact = catalog.find(p => getProductSlug(p) === targetSlug);
  if (exact) return exact;

  return catalog.find(p => {
    if (p.id && String(p.id) === targetSlug) return true;
    if (p.sku && slugify(p.sku) === targetSlug) return true;
    return false;
  }) || null;
};

export const isInStock = (product: any): boolean => {
  if (!product) return false;
  return product.stock != null && product.stock !== '' && Number(String(product.stock).trim()) > 0;
};
