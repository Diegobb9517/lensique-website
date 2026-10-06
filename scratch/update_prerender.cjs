const fs = require('fs');

const code = fs.readFileSync('scripts/prerender.js', 'utf8');

// The old PRERENDER logic for pageTitle:
// const brand = (p.brand && p.brand !== 'null') ? p.brand.trim() : '';
// const model = (p.model || p.name || '').trim();
// const isContact = String(p.category || '').toLowerCase().includes('contacto');
// const categoryLabel = isContact ? 'Lentes de Contacto' : 'Armazón oftálmico';
// ...
// const pageTitle = \`\${brand ? brand + ' ' : ''}\${model} | \${categoryLabel} | Óptica Lensique\`;
// const jsonLd = { ... "name": \`\${brand ? brand + ' ' : ''}\${model} - \${categoryLabel}\`, ...

const replacement = `  const brand = (p.brand && p.brand !== 'null') ? p.brand.trim() : '';
  let model = (p.model || p.name || '').trim();
  
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
  
  const isContact = String(p.category || '').toLowerCase().includes('contacto');
  const categoryLabel = isContact ? 'Lentes de Contacto' : 'Armazón oftálmico';
  
  const isFrame = !String(p.category || '').toLowerCase().includes('sol') && !isContact;
  if (isFrame) {
    model = model.replace(/^VISTA\\s+/i, '').trim();
  }
  
  model = model.replace(/^0(?=[A-Za-z]{2})/i, '');
  
  const displayName = p.display_name ? p.display_name.trim() : (brand ? brand + ' ' + model : model).trim();
  
  const slug = getProductSlug(p);
  const canonicalUrl = \`https://www.lensique.com.mx/producto/\${slug}\`;
  sitemapUrls.push(canonicalUrl);

  const isOutOfStock = p.stock != null && p.stock !== '' && Number(p.stock) <= 0;
  const availabilitySchema = isOutOfStock ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock';
  const availabilityText = isOutOfStock ? 'Sobre pedido' : 'En existencia';

  const basePrice = Number(p.price_incl_tax) || 0;
  const constantsPath = path.join(__dirname, '..', 'src', 'lib', 'constants.ts');
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');
  const match = constantsContent.match(/export const BASE_LENS_PRICE\\s*=\\s*(\\d+);/);
  const baseLensPrice = match ? parseInt(match[1], 10) : 1200;
  const finalPrice = basePrice + (isFrame ? baseLensPrice : 0);

  const numericPrice = finalPrice.toFixed(2);
  const formattedPriceMxn = \`\${formatPrice(finalPrice)} MXN\`;
  const absImg = resolveAbsImage(p.image_url);
  const pageTitle = \`\${displayName} | \${categoryLabel} | Óptica Lensique\`;
  let pageDesc = p.description || \`Compra \${displayName} (\${categoryLabel}) en Óptica Lensique. Respaldo de oftalmólogo en Zapopan y envíos a todo México.\`;
  if (isFrame) {
    pageDesc += ' Con micas antirreflejantes incluidas.';
  }

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": \`\${displayName} - \${categoryLabel}\`,`;

const patternToReplace = /const brand = \(p\.brand && p\.brand !== 'null'\) \? p\.brand\.trim\(\) : '';[\s\S]*?"name": `\$\{brand \? brand \+ ' ' : ''\}\$\{model\} - \$\{categoryLabel\}`\,/;

const newCode = code.replace(patternToReplace, replacement);

fs.writeFileSync('scripts/prerender.js', newCode);
