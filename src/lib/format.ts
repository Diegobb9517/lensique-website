const WP_NAMES = [
  "Esme", "Franny", "Melva", "Aldous", "Percey", "Winston", "Felix", "Durand", 
  "Wilkie", "Haskell", "Louise", "Maren", "Whiting", "Laurel", "Simon", "Oliver",
  "Daisy", "Arthur", "Amelia", "Fiona", "Jasper", "Cora", "Stella", "Miles",
  "Chloe", "Theo", "Hazel", "Finn", "Ruby", "Leo", "Iris", "Silas", "Clara",
  "Ezra", "Luna", "Milo", "Ivy", "Asher", "Lily", "Jude", "Nora", "Rowan",
  "Sadie", "Levi", "Eva", "Eli", "Rose", "Owen", "Lucy", "Caleb", "Grace",
  "Gideon", "Anna", "Micah", "Ella", "Luke", "Mia", "Adam", "Aria", "Noah",
  "Cleo", "Hugh", "Faye", "Dane", "Hope", "Zane", "Dawn", "Seth", "Eve",
  "Tate", "Blythe", "Reid", "Mae", "Gage", "June", "Cole", "Tess", "Lane",
  "Gwen", "Jace", "Ruth", "Nash", "Jane", "Knox", "Pearl", "Beau", "Maia",
  "Vance", "Wren", "Flynn", "Skye", "Hayes", "Fawn", "Rhys", "Lark", "Jett",
  "Sage", "Elm", "Brooks", "Plum", "Beck", "Fern", "Penn", "Ash"
];

export const toTitleCase = (str: string) => {
  return str.toLowerCase().replace(/\b(\w)/g, s => s.toUpperCase());
};

export const getInventedName = (productName: string, category: string = '') => {
  if (!productName) return '';
  const isContact = String(category).toLowerCase().includes('contacto');
  if (isContact) return toTitleCase(productName);
  
  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    hash = productName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return WP_NAMES[hash % WP_NAMES.length];
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
