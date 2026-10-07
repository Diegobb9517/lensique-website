export const toTitleCase = (str: string) => {
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, s => s.toUpperCase());
};

export const formatModelName = (modelRaw: string): string => {
  if (!modelRaw) return '';
  let cleaned = modelRaw.trim();
  cleaned = cleaned.replace(/^0(?=[A-Za-z]{2})/i, '');
  return cleaned;
};

export const getDisplayName = (product: any): string => {
  if (!product) return '';
  if (product.display_name) return product.display_name.trim();
  
  const brand = (product.brand && product.brand !== 'null') ? product.brand.trim() : '';
  let model = (product.model || product.name || '').trim();
  
  if (model.toUpperCase().startsWith('LC-') || model === product.sku) {
    const desc = (product.short_description || 'Lentes').trim();
    return (brand ? brand + ' ' + desc : desc).trim();
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
