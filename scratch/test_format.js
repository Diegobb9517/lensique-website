const getDisplayName = (product) => {
  if (!product) return '';
  if (product.display_name) return product.display_name;
  
  const brand = (product.brand && product.brand !== 'null') ? product.brand.trim() : '';
  let model = (product.model || product.name || '').trim();
  
  // 1. Remove duplicated brand from the beginning
  if (brand) {
    const brandUpper = brand.toUpperCase().trim();
    // Using a loop to remove all instances of the brand from the start
    let cleaned = false;
    do {
      cleaned = false;
      if (model.toUpperCase().startsWith(brandUpper)) {
        model = model.substring(brandUpper.length).trim();
        cleaned = true;
      }
    } while (cleaned);
  }
  
  // 2. Remove redundant "VISTA" if it's an ophthalmic frame
  // The user says "eliminar palabras redundantes como VISTA si la categoría ya es armazón oftálmico"
  const isFrame = !String(product.category || '').toLowerCase().includes('sol') && !String(product.category || '').toLowerCase().includes('contacto');
  if (isFrame) {
    model = model.replace(/^VISTA\s+/i, '').trim();
  }
  
  // 3. Remove leading "0" before letters
  model = model.replace(/^0(?=[A-Za-z]{2})/i, '');
  
  return (brand ? brand + ' ' + model : model).trim();
};

fetch('https://lensique-pos.onrender.com/api/website/content')
  .then(r => r.json())
  .then(d => {
    const p = typeof d.full_catalog_data === 'string' ? JSON.parse(d.full_catalog_data) : d.full_catalog_data;
    
    console.log('Examples:');
    const examples = [
      p.find(x => x.name.includes('RAY-BAN VISTA 0RX3929V')),
      p.find(x => x.name.includes('ARNETTE 0AN4347U')),
      p.find(x => x.name.includes('L-2776-214')),
      p.find(x => x.name.includes('0RX3447V')),
      p.find(x => String(x.category).toLowerCase().includes('contacto')),
      p.find(x => x.name.includes('0RA')), // Ralph
      p.find(x => x.name.includes('PU')), // Puma
      p.find(x => x.name.includes('CK')), // Calvin klein
      p[10],
      p[20]
    ].filter(Boolean);
    
    examples.forEach(x => {
      console.log(`Original: ${x.name}\nResult  : ${getDisplayName(x)}\n`);
    });
  });
