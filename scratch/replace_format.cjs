const fs = require('fs');

const newCode = `export const toTitleCase = (str: string) => {
  return str.toLowerCase().replace(/(?:^|\\s|-)\\S/g, s => s.toUpperCase());
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
    model = model.replace(/^VISTA\\s+/i, '').trim();
  }
  
  model = formatModelName(model);
  
  return (brand ? brand + ' ' + model : model).trim();
};

`;

let code = fs.readFileSync('src/lib/format.ts', 'utf8');
const oldStr = code.substring(0, code.indexOf('export const formatProductTitle'));
fs.writeFileSync('src/lib/format.ts', code.replace(oldStr, newCode));
