import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const templatePath = path.join(distDir, 'index.html');
const dbPath = path.resolve(rootDir, '../lensique-pos/database.sqlite');

console.log('🚀 Starting Google Shopping SSG Prerender build script...');

const slugify = (str) => {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const fetchProductsFromAPI = async (attempts = 3, delayMs = 1000) => {
  const apiUrl = 'https://lensique-pos.onrender.com/api/website/content';
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return typeof data.full_catalog_data === 'string' ? JSON.parse(data.full_catalog_data) : data.full_catalog_data;
    } catch (err) {
      console.warn(`[API] Attempt ${i + 1} failed: ${err.message}`);
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return [];
};

const getProductSlug = (product) => {
  if (!product) return '';
  const brand = (product.brand && product.brand !== 'null') ? String(product.brand).trim() : '';
  const model = String(product.model || product.name || '').trim();
  const sku = String(product.sku || '').trim();
  const parts = [brand, model, sku].filter(Boolean);
  let slug = slugify(parts.join(' '));
  if (!slug) slug = `producto-${product.id}`;
  return slug;
};


let products = [];
const indexTemplate = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf8') : '';

const sitemapUrls = [
  'https://www.lensique.com.mx/',
  'https://www.lensique.com.mx/armazones',
  'https://www.lensique.com.mx/lentes-de-contacto',
  'https://www.lensique.com.mx/agendar-cita'
];

const formatPrice = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num);
};

const resolveAbsImage = (imgUrl) => {
  if (!imgUrl || imgUrl === 'null' || imgUrl === 'undefined') {
    return 'https://www.lensique.com.mx/hero-desktop.jpg';
  }
  let url = String(imgUrl).trim();
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `https://lensique-pos.onrender.com${url}`;
  return `https://lensique-pos.onrender.com/${url}`;
};

// Try fetching from API with retries
const apiProducts = await fetchProductsFromAPI();
if (apiProducts && apiProducts.length) {
  products = apiProducts.filter(p => (p.brand || '').toUpperCase().trim() !== 'CH' && String(p.published) !== '0' && String(p.published) !== 'false' && p.published !== false && p.published !== 0);
  console.log(`[API] Loaded ${products.length} products from API.`);
}

// If still empty, fallback to content2.json
if (products.length === 0) {
  const content2Path = path.join(rootDir, 'content2.json');
  if (fs.existsSync(content2Path)) {
    try {
      const content = JSON.parse(fs.readFileSync(content2Path, 'utf8'));
      const fullCat = typeof content.full_catalog_data === 'string'
        ? JSON.parse(content.full_catalog_data)
        : (content.full_catalog_data || []);
      products = fullCat.filter(p => (p.brand || '').toUpperCase().trim() !== 'CH' && String(p.published) !== '0' && String(p.published) !== 'false' && p.published !== false && p.published !== 0);
      console.log(`[content2.json] Loaded ${products.length} products.`);
    } catch (e) {
      console.warn('Failed to load fallback content2.json:', e.message);
    }
  }
}

// Process each product
let generatedCount = 0;
products.forEach(p => {
    const brand = (p.brand && p.brand !== 'null') ? p.brand.trim() : '';
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
    model = model.replace(/^VISTA\s+/i, '').trim();
  }
  
  model = model.replace(/^0(?=[A-Za-z]{2})/i, '');
  
  const displayName = p.display_name ? p.display_name.trim() : (brand ? brand + ' ' + model : model).trim();
  
  const slug = getProductSlug(p);
  const canonicalUrl = `https://www.lensique.com.mx/producto/${slug}`;
  sitemapUrls.push(canonicalUrl);

  const isOutOfStock = p.stock != null && p.stock !== '' && Number(p.stock) <= 0;
  const availabilitySchema = isOutOfStock ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock';
  const availabilityText = isOutOfStock ? 'Sobre pedido' : 'En existencia';

  const basePrice = Number(p.price_incl_tax) || 0;
  const constantsPath = path.join(__dirname, '..', 'src', 'lib', 'constants.ts');
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');
  const match = constantsContent.match(/export const BASE_LENS_PRICE\s*=\s*(\d+);/);
  const baseLensPrice = match ? parseInt(match[1], 10) : 1200;
  const finalPrice = basePrice + (isFrame ? baseLensPrice : 0);

  const numericPrice = finalPrice.toFixed(2);
  const formattedPriceMxn = `${formatPrice(finalPrice)} MXN`;
  const absImg = resolveAbsImage(p.image_url);
  const pageTitle = `${displayName} | ${categoryLabel} | Óptica Lensique`;
  let pageDesc = p.description || `Compra ${displayName} (${categoryLabel}) en Óptica Lensique. Respaldo de oftalmólogo en Zapopan y envíos a todo México.`;
  if (isFrame) {
    pageDesc += ' Con micas antirreflejantes incluidas.';
  }

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `${displayName} - ${categoryLabel}`,
    "image": [absImg],
    "description": pageDesc,
    "sku": p.sku || slug,
    "mpn": p.sku || slug,
    "brand": { "@type": "Brand", "name": brand || "Lensique" },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "MXN",
      "price": numericPrice,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": availabilitySchema,
      "seller": { "@type": "Organization", "name": "Óptica Lensique" }
    }
  };

  const headInjection = `
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDesc}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDesc}" />
    <meta property="og:image" content="${absImg}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="product" />
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
  `;

  const bodyInjection = `
    <div id="product-seo-fallback" style="max-width: 800px; margin: 40px auto; padding: 24px; font-family: sans-serif; border: 1px solid #eaeaea; border-radius: 16px; background: #ffffff;">
      <span style="font-size: 14px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em;">${brand || 'Óptica Lensique'} · ${categoryLabel}</span>
      <h1 style="font-size: 28px; font-weight: 700; color: #111827; margin: 8px 0;">${brand ? brand + ' ' : ''}${model}</h1>
      <p style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 12px 0;">${formattedPriceMxn}</p>
      <div style="display: inline-block; padding: 6px 12px; background: ${isOutOfStock ? '#fff7ed' : '#f0fdf4'}; color: ${isOutOfStock ? '#c2410c' : '#15803d'}; font-weight: 600; border-radius: 6px; font-size: 13px; margin-bottom: 16px;">
        Disponibilidad: ${availabilityText}
      </div>
      <div style="margin: 20px 0;">
        <img src="${absImg}" alt="${model}" style="max-width: 100%; height: auto; border-radius: 12px;" />
      </div>
      <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">${pageDesc}</p>
      <p style="font-size: 13px; color: #9ca3af; margin-top: 12px;">SKU: <strong>${p.sku || slug}</strong></p>
      <a href="${canonicalUrl}" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: #1b2436; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600;">Seleccionar micas y comprar</a>
    </div>
  `;

  let html = indexTemplate;
  if (html.includes('<title>')) {
    html = html.replace(/<title>.*?<\/title>/s, `<title>${pageTitle}</title>`);
  }
  html = html.replace('</head>', `${headInjection}\n</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyInjection}</div>`);

  
  const prodDir = path.join(distDir, 'producto', slug);
  if (!fs.existsSync(prodDir)) {
    fs.mkdirSync(prodDir, { recursive: true });
  }
  
  const filePath = path.join(prodDir, 'index.html');
  fs.writeFileSync(filePath, html, 'utf8');
  
  // Validation: Check if the file is 0 bytes
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    console.error(`[ERROR] Generado archivo vacío (0 bytes) para el producto: ${slug}`);
    process.exit(1);
  }
  
  generatedCount++;

});
// ----------------------------------------------------------
// Generate /catalogo prerender (static catalog page)
// ----------------------------------------------------------
const catalogTitle = "Catálogo de armazones y lentes | Óptica Lensique";
const catalogDesc = "Explora nuestro catálogo de armazones de diseño (Ray-Ban, Calvin Klein, Carrera y más) y lentes de contacto, con respaldo de oftalmólogo. Compra en línea o recoge en Zapopan.";
const catalogCanonical = "https://www.lensique.com.mx/catalogo";
// Add catalog URL to sitemap
sitemapUrls.push(catalogCanonical);

const catalogHeadInjection = `
    <title>${catalogTitle}</title>
    <meta name="description" content="${catalogDesc}" />
    <link rel="canonical" href="${catalogCanonical}" />
    <meta property="og:title" content="${catalogTitle}" />
    <meta property="og:description" content="${catalogDesc}" />
    <meta property="og:url" content="${catalogCanonical}" />
    <meta property="og:type" content="website" />
`;

// Build list of product links
const catalogLinks = products.map(p => {
  const slug = getProductSlug(p);
  const label = `${p.brand ? p.brand + ' ' : ''}${p.model || p.name}`;
  return `<li><a href="/producto/${slug}">${label}</a></li>`;
}).join('\n');

const catalogBodyInjection = `
  <section class="catalog-page" style="max-width: 800px; margin: 40px auto; font-family: sans-serif;">
    <h1 class="section-title" style="font-family:'Playfair Display', serif; text-align:center; margin-bottom:2rem;">Catálogo</h1>
    <ul style="list-style:none; padding:0;">
      ${catalogLinks}
    </ul>
  </section>
`;

let catalogHtml = indexTemplate;
if (catalogHtml.includes('<title>')) {
  catalogHtml = catalogHtml.replace(/<title>.*?<\/title>/s, `<title>${catalogTitle}</title>`);
}
// Insert head injection right after opening <head>
catalogHtml = catalogHtml.replace('<head>', `<head>\n${catalogHeadInjection}`);
// Replace the root div with our catalog body
catalogHtml = catalogHtml.replace('<div id="root"></div>', `<div id="root">${catalogBodyInjection}</div>`);

const catalogDir = path.join(distDir, 'catalogo');
if (!fs.existsSync(catalogDir)) { fs.mkdirSync(catalogDir, { recursive: true }); }
fs.writeFileSync(path.join(catalogDir, 'index.html'), catalogHtml, 'utf8');
console.log('✅ Pre-rendered /catalogo/index.html');

// ----------------------------------------------------------
// Generate /armazones prerender (static armazones page)
// ----------------------------------------------------------
const armazonesTitle = "Armazones de diseño en Zapopan | Óptica Lensique";
const armazonesDesc = "Armazones de diseño y lentes oftálmicos en Zapopan (zona Guadalajara), con respaldo de oftalmólogo. Compra en línea o agenda tu cita.";
const armazonesCanonical = "https://www.lensique.com.mx/armazones";

const armazonesHeadInjection = `
    <title>${armazonesTitle}</title>
    <meta name="description" content="${armazonesDesc}" />
    <link rel="canonical" href="${armazonesCanonical}" />
    <meta property="og:title" content="${armazonesTitle}" />
    <meta property="og:description" content="${armazonesDesc}" />
    <meta property="og:url" content="${armazonesCanonical}" />
    <meta property="og:type" content="website" />
`;

let armazonesHtml = indexTemplate;
if (armazonesHtml.includes('<title>')) {
  armazonesHtml = armazonesHtml.replace(/<title>.*?<\/title>/s, `<title>${armazonesTitle}</title>`);
}
armazonesHtml = armazonesHtml.replace('</head>', `<head>\n${armazonesHeadInjection}`);
armazonesHtml = armazonesHtml.replace('<div id="root"></div>', `<div id="root">${catalogBodyInjection}</div>`);

const armazonesDir = path.join(distDir, 'armazones');
if (!fs.existsSync(armazonesDir)) { fs.mkdirSync(armazonesDir, { recursive: true }); }
fs.writeFileSync(path.join(armazonesDir, 'index.html'), armazonesHtml, 'utf8');
console.log('✅ Pre-rendered /armazones/index.html');

console.log(`✅ Pre-rendered ${generatedCount} static product HTML pages in /dist/producto/[slug]/index.html`);


// Generate /micas prerender
const micasTitle = "Micas y Tecnologías de Visión | Óptica Lensique Zapopan";
const micasDesc = "Conoce nuestras opciones de micas: monofocales, progresivos, antirreflejante y más. Calcula el costo en nuestro cotizador de micas.";
const micasCanonical = "https://www.lensique.com.mx/micas";

const micasHeadInjection = `
    <title>${micasTitle}</title>
    <meta name="description" content="${micasDesc}" />
    <link rel="canonical" href="${micasCanonical}" />
    <meta property="og:title" content="${micasTitle}" />
    <meta property="og:description" content="${micasDesc}" />
    <meta property="og:url" content="${micasCanonical}" />
    <meta property="og:type" content="website" />
`;
let micasHtml = fs.readFileSync(templatePath, 'utf8').replace(/<title>.*<\/title>/, '');
micasHtml = micasHtml.replace('</head>', micasHeadInjection + '</head>');
const micasDir = path.join(distDir, 'micas');
if (!fs.existsSync(micasDir)) fs.mkdirSync(micasDir, { recursive: true });
fs.writeFileSync(path.join(micasDir, 'index.html'), micasHtml, 'utf8');
console.log('✅ Pre-rendered /micas/index.html');

// Generate /nosotros prerender
const nosotrosTitle = "Nosotros | Óptica Lensique Zapopan";
const nosotrosDesc = "Nuestra Pasión es tu Visión. Conoce la historia de Óptica Lensique y nuestro compromiso con tu salud visual y tu estilo.";
const nosotrosCanonical = "https://www.lensique.com.mx/nosotros";

const nosotrosHeadInjection = `
    <title>${nosotrosTitle}</title>
    <meta name="description" content="${nosotrosDesc}" />
    <link rel="canonical" href="${nosotrosCanonical}" />
    <meta property="og:title" content="${nosotrosTitle}" />
    <meta property="og:description" content="${nosotrosDesc}" />
    <meta property="og:url" content="${nosotrosCanonical}" />
    <meta property="og:type" content="website" />
`;
let nosotrosHtml = fs.readFileSync(templatePath, 'utf8').replace(/<title>.*<\/title>/, '');
nosotrosHtml = nosotrosHtml.replace('</head>', nosotrosHeadInjection + '</head>');
const nosotrosDir = path.join(distDir, 'nosotros');
if (!fs.existsSync(nosotrosDir)) fs.mkdirSync(nosotrosDir, { recursive: true });
fs.writeFileSync(path.join(nosotrosDir, 'index.html'), nosotrosHtml, 'utf8');
console.log('✅ Pre-rendered /nosotros/index.html');

// Generate /agendar-cita prerender
const agendarTitle = "Agenda tu Examen Visual | Óptica Lensique Zapopan";
const agendarDesc = "Agenda tu examen visual en Zapopan. Realizado por oftalmólogo certificado. Elige día y hora en línea.";
const agendarCanonical = "https://www.lensique.com.mx/agendar-cita";

const agendarHeadInjection = `
    <title>${agendarTitle}</title>
    <meta name="description" content="${agendarDesc}" />
    <link rel="canonical" href="${agendarCanonical}" />
    <meta property="og:title" content="${agendarTitle}" />
    <meta property="og:description" content="${agendarDesc}" />
    <meta property="og:image" content="https://www.lensique.com.mx/hero-desktop.jpg" />
    <meta property="og:url" content="${agendarCanonical}" />
    <meta property="og:type" content="website" />
`;

const agendarBodyInjection = `
  <div style="max-width: 600px; margin: 40px auto; padding: 24px; text-align: center; font-family: sans-serif;">
    <h1 style="font-size: 28px; font-weight: 700; color: #111827;">Agenda tu Examen Visual</h1>
    <p style="font-size: 16px; color: #4b5563;">El examen no tiene costo y es realizado por un oftalmólogo certificado.</p>
    <a href="${agendarCanonical}" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: #1b2436; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600;">Confirmar y enviar WhatsApp</a>
  </div>
`;

let agendarHtml = indexTemplate;
if (agendarHtml.includes('<title>')) {
  agendarHtml = agendarHtml.replace(/<title>.*?<\/title>/s, `<title>${agendarTitle}</title>`);
}
agendarHtml = agendarHtml.replace('</head>', `${agendarHeadInjection}\n</head>`);
agendarHtml = agendarHtml.replace('<div id="root"></div>', `<div id="root">${agendarBodyInjection}</div>`);

const agendarDir = path.join(distDir, 'agendar-cita');
if (!fs.existsSync(agendarDir)) {
  fs.mkdirSync(agendarDir, { recursive: true });
}
fs.writeFileSync(path.join(agendarDir, 'index.html'), agendarHtml, 'utf8');
console.log('✅ Pre-rendered /agendar-cita/index.html');

// Generate /devoluciones prerender
const devTitle = "Política de devoluciones, cambios y garantías | Óptica Lensique";
const devDesc = "Consulta nuestra política de cambios, devoluciones y garantías de adaptación para armazones y micas en Óptica Lensique Zapopan.";
const devCanonical = "https://www.lensique.com.mx/devoluciones";
sitemapUrls.push(devCanonical);

const devHeadInjection = `
    <title>${devTitle}</title>
    <meta name="description" content="${devDesc}" />
    <link rel="canonical" href="${devCanonical}" />
`;
let devHtml = indexTemplate;
if (devHtml.includes('<title>')) devHtml = devHtml.replace(/<title>.*?<\/title>/s, `<title>${devTitle}</title>`);
devHtml = devHtml.replace('</head>', `${devHeadInjection}\n</head>`);

const devDir = path.join(distDir, 'devoluciones');
if (!fs.existsSync(devDir)) {
  fs.mkdirSync(devDir, { recursive: true });
}
fs.writeFileSync(path.join(devDir, 'index.html'), devHtml, 'utf8');
console.log('✅ Pre-rendered /devoluciones/index.html');

// Generate /cotizador prerender
const cotizadorTitle = "Cotizador de Micas y Lentes Graduados | Óptica Lensique Zapopan";
const cotizadorDesc = "Calcula el costo de tus micas en menos de un minuto. Monofocales, progresivos, antirreflejante y filtro azul. Óptica en Zapopan.";
const cotizadorCanonical = "https://www.lensique.com.mx/cotizador";
sitemapUrls.push(cotizadorCanonical);

const cotizadorHeadInjection = `
    <title>${cotizadorTitle}</title>
    <meta name="description" content="${cotizadorDesc}" />
    <link rel="canonical" href="${cotizadorCanonical}" />
    <meta property="og:title" content="${cotizadorTitle}" />
    <meta property="og:description" content="${cotizadorDesc}" />
    <meta property="og:url" content="${cotizadorCanonical}" />
    <meta property="og:type" content="website" />
`;

const cotizadorBodyInjection = `
  <div style="max-width: 600px; margin: 40px auto; padding: 24px; font-family: sans-serif;">
    <h1 style="font-size: 28px; font-weight: 700; color: #111827;">Cotiza tus micas en menos de un minuto</h1>
    <p style="font-size: 16px; color: #4b5563;">Descubre las opciones de micas monofocales, bifocales, progresivos, fotocromáticos, filtro azul y antirreflejante.</p>
  </div>
`;

let cotizadorHtml = indexTemplate;
if (cotizadorHtml.includes('<title>')) {
  cotizadorHtml = cotizadorHtml.replace(/<title>.*?<\/title>/s, `<title>${cotizadorTitle}</title>`);
}
cotizadorHtml = cotizadorHtml.replace('</head>', `${cotizadorHeadInjection}\n</head>`);
cotizadorHtml = cotizadorHtml.replace('<div id="root"></div>', `<div id="root">${cotizadorBodyInjection}</div>`);

const cotizadorDir = path.join(distDir, 'cotizador');
if (!fs.existsSync(cotizadorDir)) {
  fs.mkdirSync(cotizadorDir, { recursive: true });
}
fs.writeFileSync(path.join(cotizadorDir, 'index.html'), cotizadorHtml, 'utf8');
console.log('✅ Pre-rendered /cotizador/index.html');

// Generate /marca/[slug] prerender
const uniqueBrandsMap = new Map();
products.forEach(p => {
  const brand = (p.brand && p.brand !== 'null') ? String(p.brand).trim() : '';
  if (brand && brand.toLowerCase() !== 'ch') {
    const slug = slugify(brand);
    if (!uniqueBrandsMap.has(slug)) {
      uniqueBrandsMap.set(slug, { name: brand, products: [] });
    }
    uniqueBrandsMap.get(slug).products.push(p);
  }
});

let brandCount = 0;
for (const [slug, brandData] of uniqueBrandsMap.entries()) {
  const brandName = brandData.name;
  const brandTitle = `Armazones ${brandName} en Zapopan | Óptica Lensique`;
  const brandDesc = `Armazones ${brandName} originales en Zapopan. Respaldo de oftalmólogo certificado. Cotiza en línea.`;
  const brandCanonical = `https://www.lensique.com.mx/marca/${slug}`;
  sitemapUrls.push(brandCanonical);
  
  const brandHeadInjection = `
    <title>${brandTitle}</title>
    <meta name="description" content="${brandDesc}" />
    <link rel="canonical" href="${brandCanonical}" />
    <meta property="og:title" content="${brandTitle}" />
    <meta property="og:description" content="${brandDesc}" />
    <meta property="og:url" content="${brandCanonical}" />
    <meta property="og:type" content="website" />
  `;
  
  const productsHtml = brandData.products.slice(0, 24).map(p => 
    `<li>${p.model || p.name} - $${Math.round(p.price_incl_tax)}</li>`
  ).join('');

  const brandBodyInjection = `
    <div style="max-width: 800px; margin: 40px auto; padding: 24px; font-family: sans-serif;">
      <h1 style="font-size: 32px; font-weight: 700;">Armazones ${brandName} en Zapopan | Óptica Lensique</h1>
      <p style="font-size: 16px; color: #4b5563;">Descubre nuestra colección de ${brandName}. Agenda tu examen visual con oftalmólogo en Chapalita, Zapopan.</p>
      <ul style="margin-top: 20px;">
        ${productsHtml}
      </ul>
    </div>
  `;

  let brandHtml = indexTemplate;
  if (brandHtml.includes('<title>')) {
    brandHtml = brandHtml.replace(/<title>.*?<\/title>/s, `<title>${brandTitle}</title>`);
  }
  brandHtml = brandHtml.replace('</head>', `${brandHeadInjection}\n</head>`);
  brandHtml = brandHtml.replace('<div id="root"></div>', `<div id="root">${brandBodyInjection}</div>`);

  const brandDir = path.join(distDir, 'marca', slug);
  if (!fs.existsSync(brandDir)) {
    fs.mkdirSync(brandDir, { recursive: true });
  }
  fs.writeFileSync(path.join(brandDir, 'index.html'), brandHtml, 'utf8');
  brandCount++;
}
console.log(`✅ Pre-rendered ${brandCount} brand HTML pages in /dist/marca/[slug]/index.html`);


// Generate /blog prerender
const blogIndexTitle = "Blog de Salud Visual | Óptica Lensique";
const blogIndexDesc = "Consejos, guías y respuestas sobre salud visual, lentes y tratamientos. Todo lo que necesitas saber para cuidar tus ojos, escrito por oftalmólogos.";
const blogIndexCanonical = "https://www.lensique.com.mx/blog";
sitemapUrls.push(blogIndexCanonical);

const blogPostsData = [
    {
    slug: 'monofocal-bifocal-o-progresivo',
    title: 'Monofocales, bifocales o progresivos: ¿cuál necesitas? | Óptica Lensique',
    metaDescription: 'Diferencias claras entre micas monofocales, bifocales y progresivas: para quién es cada una, ventajas, adaptación y precio. Explicado por Óptica Lensique, Zapopan.',
    image: 'https://www.lensique.com.mx/assets/lentes_progresivos.jpg',
    author: 'Equipo Óptica Lensique (revisado por oftalmólogo)',
    datePublished: new Date().toISOString(),
    excerpt: '¿Te dijeron que necesitas ver de lejos y de cerca? Conoce las diferencias reales entre monofocal, bifocal y progresivo para tomar la mejor decisión.',
    body: `# Monofocales, bifocales o progresivos: ¿cuál necesitas?

Si te acaban de decir que ya necesitas "ver de lejos y de cerca", o si tienes más de 40 y las letras chicas empezaron a alejarse, tarde o temprano vas a escuchar estas tres palabras: **monofocal, bifocal y progresivo**. Son los tres tipos de micas que existen, y elegir bien entre ellas cambia por completo cómo se sienten tus lentes todos los días. Aquí te explicamos cada una sin tecnicismos, para quién es y qué esperar.

## Primero, ¿por qué hay tres tipos?

Todo se reduce a **cuántas distancias necesitas corregir**:

- Si solo necesitas ver bien **de lejos** (miopía) o **solo de cerca** (hipermetropía o vista cansada), te basta **una** graduación.
- Si necesitas **ambas** —lo más común a partir de los 40, cuando aparece la presbicia—, necesitas que una misma mica te dé **dos o más** distancias.

De ahí salen las tres opciones.

## Monofocales: una sola distancia

La mica monofocal tiene **una sola graduación en toda su superficie**. Es la más sencilla, la más económica y la que usa la mayoría de las personas menores de 40.

- **Para quién:** miopía, hipermetropía o astigmatismo cuando solo necesitas corregir una distancia. También para quien usa lentes "solo para leer" o "solo para manejar".
- **Ventajas:** campo de visión completo, cero adaptación, precio más accesible.
- **Límite:** si ya necesitas lejos y cerca, tendrías que cargar dos pares (o quitarte los lentes para leer).

## Bifocales: dos distancias con una línea visible

La bifocal tiene **dos zonas**: la parte superior para lejos y una "ventanita" inferior para cerca, separadas por una **línea visible**.

- **Para quién:** personas con presbicia que quieren una solución práctica y económica, y a quienes no les molesta la línea.
- **Ventajas:** funciona muy bien para lejos y cerca, adaptación rápida, cuesta menos que un progresivo.
- **Límites:** no tiene distancia intermedia (la de la computadora), el salto entre zonas se nota, y la línea es visible desde afuera. Por eso hoy se usan cada vez menos.

## Progresivos: lejos, intermedio y cerca, sin línea

El progresivo corrige **todas las distancias en una sola mica**, con una transición suave de arriba (lejos) al centro (intermedio, como la computadora) y abajo (cerca, como el celular). **No tiene línea**: por fuera se ve como un lente normal.

- **Para quién:** la mayoría de las personas con presbicia que quieren un solo par para todo el día.
- **Ventajas:** visión natural a todas las distancias, estética limpia, un solo par de lentes.
- **Lo que debes saber:** requiere un **periodo de adaptación** (normalmente unos días, a veces un par de semanas) porque el cerebro aprende a "buscar" cada zona moviendo la cabeza y no solo los ojos. Y la calidad del diseño importa muchísimo: un progresivo de entrada tiene campos más estrechos; uno de gama alta tiene zonas más amplias y una adaptación más fácil.

## Comparación rápida

| | Monofocal | Bifocal | Progresivo |
|---|---|---|---|
| Distancias | 1 | 2 (lejos y cerca) | 3 (lejos, intermedio y cerca) |
| Línea visible | No | Sí | No |
| Adaptación | Ninguna | Rápida | Días a semanas |
| Computadora | Solo si es "de cerca" | No cubre bien | Sí |
| Precio | El más accesible | Intermedio | El más alto (varía por diseño) |

## ¿Cuál te conviene? Tres preguntas que te lo dicen

1. **¿Necesitas ver bien a más de una distancia?** Si no, monofocal y listo.
2. **¿Pasas horas frente a la computadora?** Si sí y necesitas dos distancias, el progresivo es la opción que cubre el intermedio; la bifocal no.
3. **¿Te importa que no se note la línea?** Si sí, progresivo. Si te da igual y buscas lo más práctico y económico para lejos y cerca, la bifocal sigue siendo válida.

Y una honesta: **el progresivo no es para todos.** Hay personas a las que, por su graduación o su forma de trabajar, les funciona mejor una bifocal o incluso dos monofocales (uno para lejos, otro para cerca). Por eso la decisión final debe tomarse **con tu graduación en la mano y con un especialista**, no solo con una tabla.

## ¿Y el precio?

Aquí va el dato que casi nadie explica: **el precio de un lente completo es el armazón más las micas**, y las micas cambian según el tipo. En Lensique lo mostramos desde el principio para que no haya sorpresas: cada armazón del catálogo ya incluye micas monofocales antirreflejantes en el precio que ves, y si necesitas bifocales o progresivos, el asistente te muestra exactamente cuánto suma cada opción **antes** de decidir. Un progresivo de entrada cuesta menos de lo que muchos creen, y los de gama alta se justifican cuando pasas el día cambiando de distancia.

## Preguntas frecuentes

**¿Cuánto tarda uno en acostumbrarse a los progresivos?**
La mayoría se adapta en unos días; algunas personas tardan hasta dos semanas. Ayuda usarlos de forma continua desde el primer día y mover la cabeza (no solo los ojos) para enfocar. Si después de dos semanas no te acomodas, vuelve con nosotros: revisamos el centrado y la graduación, y aplica nuestra garantía de adaptación.

**¿Los progresivos sirven para la computadora?**
Sí, la zona intermedia está pensada para eso. Si trabajas muchas horas frente a pantalla, coméntalo en tu examen: existen diseños con zona intermedia más amplia.

**¿Puedo usar bifocales si ya usé progresivos?**
Sí. No hay problema en cambiar de un tipo a otro; solo requiere un breve reajuste.

**¿Cada cuánto debo revisar mi graduación si uso progresivos?**
A partir de los 40, lo recomendable es una revisión anual: la presbicia avanza gradualmente y la graduación de cerca suele cambiar.

## En resumen

- **Una distancia:** monofocal.
- **Lejos y cerca, práctico y económico, línea visible:** bifocal.
- **Todas las distancias, sin línea, un solo par:** progresivo (con periodo de adaptación).

La mejor forma de decidir es con tu graduación actual y una valoración. En **Óptica Lensique**, en Zapopan, tu examen lo realiza un **oftalmólogo**, y con tu graduación puedes elegir armazón y micas en el asistente de nuestro sitio, ver el precio total desde el inicio, y recibir tus lentes en casa o recogerlos en tienda.

> **¿Quieres saber cuál te toca?** [Agenda tu examen con nuestro oftalmólogo](/agendar-cita) o [explora el catálogo](/catalogo) y prueba el asistente de micas: te muestra monofocal, bifocal y progresivo con su precio, sin sorpresas.

---
*Artículo informativo del equipo de Óptica Lensique (Zapopan, Guadalajara), revisado por oftalmólogo. No sustituye una consulta profesional.*`,
  },
  {
    slug: 'cada-cuanto-examen-de-la-vista',
    title: '¿Cada cuánto hacerte un examen de la vista? | Óptica Lensique',
    metaDescription: '¿Cada cuánto debes revisarte la vista? Guía por edad y señales de alerta, explicada por el equipo de Óptica Lensique en Zapopan. Agenda tu examen con oftalmólogo.',
    image: 'https://www.lensique.com.mx/assets/eye_exam_2.jpg',
    author: 'Equipo Óptica Lensique (revisado por oftalmólogo)',
    datePublished: '2024-03-20T10:00:00Z',
    excerpt: 'Muchos problemas visuales avanzan en silencio, así que revisarte a tiempo es la mejor forma de cuidar tus ojos. Aquí te explicamos cuándo acudir según tu edad y síntomas.',
    body: `# ¿Cada cuánto debes hacerte un examen de la vista?

Es una de las preguntas que más nos hacen en Lensique, y la respuesta corta es: **depende de tu edad y de tus factores de riesgo, pero casi nunca es "solo cuando algo se siente mal".** Muchos problemas visuales avanzan en silencio, así que revisarte a tiempo es la mejor forma de cuidar tus ojos. Aquí te lo explicamos claro.

## La regla general, según tu edad

Aunque cada caso es distinto, estas son las frecuencias que recomiendan los especialistas para una persona sana:

- **Niños y adolescentes:** al menos un examen antes de entrar a primaria, y luego cada año o dos años. La miopía está creciendo rapidísimo en los niños por el uso de pantallas.
- **Adultos de 18 a 39 años:** si ves bien y no tienes molestias ni antecedentes, **cada 1 a 2 años** suele ser suficiente.
- **A partir de los 40 años:** idealmente **una vez al año**. Es la edad en la que aparece la presbicia (el famoso "brazo corto" para leer) y sube el riesgo de otras condiciones.
- **60 años o más:** **revisión anual**, sin excepción.

## Cuándo revisarte antes de lo previsto

No esperes a tu fecha "programada" si notas alguna de estas señales:

- Ves borroso de lejos o de cerca, o te cuesta enfocar.
- Dolores de cabeza frecuentes, sobre todo al final del día.
- Cansancio o ardor en los ojos al usar la computadora o el celular.
- Ves halos alrededor de las luces, o te molesta más la luz de lo normal.
- Ya usas lentes y sientes que "ya no te gradúan" como antes.

Cualquiera de estas es motivo suficiente para agendar una revisión, aunque haya pasado poco tiempo desde la última.

## ¿Por qué revisarte aunque veas bien?

Aquí está lo importante: **algunas de las enfermedades más serias de los ojos no dan síntomas al principio.** El glaucoma, por ejemplo, es conocido como "el ladrón silencioso de la vista" porque puede dañar tu visión sin que lo notes hasta que es difícil recuperarla. Lo mismo pasa con etapas tempranas de la retinopatía diabética.

Un examen no solo mide "cuánto ves": también permite detectar a tiempo estas condiciones. Por eso, si tienes **diabetes, presión alta o antecedentes familiares de glaucoma**, lo recomendable es una revisión **anual**, sin importar tu edad.

## Qué debe incluir un buen examen (y por qué importa quién lo hace)

Un examen de la vista completo va más allá de leer letras en una pantalla. Debe evaluar tu agudeza visual, tu graduación exacta, la salud de la parte frontal e interna del ojo y, cuando corresponde, la presión intraocular.

En **Óptica Lensique** tu examen lo realiza un **oftalmólogo**, no solo un aparato automático. Eso hace la diferencia entre "una graduación aproximada" y una **valoración profesional** que cuida de verdad tu salud visual, y que se refleja en unos lentes que se sienten cómodos desde el primer día.

## En resumen

- Sin problemas y menos de 40 años: **cada 1-2 años**.
- 40 años o más: **cada año**.
- Con síntomas, lentes actuales o factores de riesgo (diabetes, glaucoma en la familia): **anual o antes** si algo cambia.

Cuidar tu vista es más barato y más fácil cuando lo haces a tiempo. Si ya te tocaba o notaste alguna de las señales de arriba, **agenda tu examen con nuestro oftalmólogo en Zapopan** — y de paso, aprovecha para probarte los nuevos armazones. 🔓

> **¿Listo para revisarte?** [Agenda tu cita aquí](/#servicios) o escríbenos por WhatsApp. Y si ya tienes tu graduación, puedes elegir tus [Ver nuestro catálogo](/catalogo) en línea y recibirlos en casa o recogerlos en tienda.

*Artículo informativo del equipo de Óptica Lensique (Zapopan, Guadalajara), revisado por oftalmólogo. No sustituye una consulta profesional.*`
  },
  {
    slug: 'filtro-luz-azul-sirve',
    title: 'Lentes con filtro de luz azul: ¿de verdad sirven? | Óptica Lensique',
    metaDescription: '¿Los lentes con filtro de luz azul reducen la fatiga o protegen tus ojos? Esto es lo que dice la ciencia, explicado con honestidad por Óptica Lensique en Zapopan.',
    image: 'https://www.lensique.com.mx/hero-desktop.jpg',
    author: 'Equipo Óptica Lensique (revisado por oftalmólogo)',
    datePublished: '2024-03-21T10:00:00Z',
    excerpt: 'Vas a encontrar el "filtro de luz azul" en casi cualquier anuncio de lentes. Aquí te explicamos qué es real, qué es marketing, y si de verdad vale la pena.',
    body: `# Lentes con filtro de luz azul: ¿de verdad sirven?

Vas a encontrar el "filtro de luz azul" en casi cualquier anuncio de lentes: que si descansa tus ojos, que si te protege de las pantallas, que si te ayuda a dormir. En Lensique preferimos decirte la verdad, aunque no sea la más comercial: **la mayoria de esas promesas no están respaldadas por la ciencia.** Aquí te explicamos qué es real y qué es marketing, para que decidas informado.

## ¿Qué es la luz azul?

Es una parte de la luz visible, de longitud de onda corta y alta energía. La fuente **más grande de luz azul con diferencia es el sol**; las pantallas de tu celular o computadora emiten una cantidad muchísimo menor. Ese dato por sí solo ya pone en perspectiva varias de las promesas que verás abajo.

## Lo que promete el marketing vs. lo que dice la evidencia

**"Reduce la fatiga visual de las pantallas."**
La evidencia dice que **no**. Una revisión sistemática de Cochrane (2023) que analizó varios estudios concluyó que los lentes con filtro de luz azul **no reducen la fatiga visual** por uso de pantallas frente a los lentes normales. La Academia Americana de Oftalmología tampoco los recomienda para eso. La fatiga frente a pantallas viene de que **parpadeamos menos**, del esfuerzo de enfoque sostenido y del deslumbramiento, no de la luz azul.

**"Protege tus ojos del daño de las pantallas."**
**No hay evidencia** de que la luz azul que emiten las pantallas dañe la retina o cause enfermedades oculares. Las cantidades son bajas y muy lejanas a las del sol. Aquí el que sí importa es el sol: para proteger tus ojos a largo plazo, lo respaldado es usar **lentes con protección UV** al aire libre.

**"Te ayuda a dormir mejor."**
Esta es la más matizada. La luz azul por la noche sí puede afectar tu ritmo de sueño, pero la evidencia de que unos lentes lo mejoren es **débil y mixta**. Lo que de verdad funciona es **reducir pantallas antes de dormir** y usar el modo nocturno del dispositivo.

## Entonces, ¿por qué alguien elegiría un filtro de luz azul?

No todo es blanco o negro. Hay razones **legítimas** para elegirlo, siempre que no esperes un milagro de salud:

- **Comodidad subjetiva:** a algunas personas simplemente les resulta más cómodo el tono, sobre todo de noche. Si a ti te gusta, es válido.
- **Estética:** ciertos filtros reducen el reflejo azulado en fotos y videollamadas.

Lo importante es que lo elijas **sabiendo qué hace y qué no**, no porque un anuncio te prometió proteger tu vista.

## Lo que SÍ ayuda a tus ojos frente a las pantallas

Si lo que buscas es dejar de sentir los ojos cansados, esto es lo que de verdad tiene respaldo:

- **La regla 20-20-20:** cada 20 minutos, mira algo a 20 pies (unos 6 metros) durante 20 segundos.
- **Parpadea a conciencia** y usa lágrimas artificiales si sientes los ojos secos.
- **Cuida la iluminación** para reducir reflejos y deslumbramiento en la pantalla.
- **Antirreflejante (AR):** este sí tiene un beneficio real y notable — **reduce los reflejos** de la pantalla y las luces, y mejora la nitidez y el confort. Es, honestamente, mucho más útil que un filtro azul.
- **La graduación correcta:** gran parte de la "fatiga" es simplemente una graduación mal hecha o desactualizada. Un examen bien hecho lo resuelve.

## En resumen

El filtro de luz azul **no reduce la fatiga ni protege tus ojos del daño de las pantallas** — eso es marketing, no ciencia. Si te gusta por comodidad, adelante; pero si tu meta es sentirte mejor frente a la computadora, invierte en un **antirreflejante** y, sobre todo, en una **graduación correcta**.

En Óptica Lensique preferimos que gastes tu dinero en lo que de verdad funciona. Si quieres, **agenda tu examen con nuestro oftalmólogo** y te asesoramos con honestidad sobre qué micas te convienen —incluido el antirreflejante— según tu caso. 🔓

**¿Los ojos cansados frente a la pantalla?** [Agenda tu cita aquí](/#servicios) y te decimos qué necesitas de verdad. También puedes [Ver nuestras micas](/#micas) o [Ir al cotizador](/cotizador).

*Artículo informativo del equipo de Óptica Lensique (Zapopan, Guadalajara), revisado por oftalmólogo. Basado en evidencia científica disponible (revisión Cochrane 2023; recomendaciones de la Academia Americana de Oftalmología). No sustituye una consulta profesional.*`
  }
];

function cleanMetaTags(html) {
  let cleaned = html.replace(/<title>.*?<\/title>/si, '');
  cleaned = cleaned.replace(/<meta name="description"[^>]*>/gi, '');
  cleaned = cleaned.replace(/<meta property="og:[^>]*>/gi, '');
  return cleaned;
}

const blogIndexHeadInjection = `
    <title>${blogIndexTitle}</title>
    <meta name="description" content="${blogIndexDesc}" />
    <link rel="canonical" href="${blogIndexCanonical}" />
    <meta property="og:title" content="${blogIndexTitle}" />
    <title>${blogIndexTitle}</title>
    <meta name="description" content="${blogIndexDesc}" />
    <link rel="canonical" href="${blogIndexCanonical}" />
    <meta property="og:title" content="${blogIndexTitle}" />
    <meta property="og:description" content="${blogIndexDesc}" />
    <meta property="og:url" content="${blogIndexCanonical}" />
    <meta property="og:type" content="website" />
`;

const blogIndexBodyInjection = `
  <div style="max-width: 800px; margin: 40px auto; padding: 24px; font-family: sans-serif;">
    <h1 style="font-size: 32px; font-weight: 700;">Blog de Salud Visual</h1>
    ${blogPostsData.map(p => `<article style="margin-bottom: 24px;"><h2 style="font-size: 24px;"><a href="/blog/${p.slug}">${p.title}</a></h2><p>${p.excerpt}</p></article>`).join('')}
  </div>
`;

let blogIndexHtml = indexTemplate;
blogIndexHtml = cleanMetaTags(blogIndexHtml);
blogIndexHtml = blogIndexHtml.replace('</head>', `${blogIndexHeadInjection}\n</head>`);
blogIndexHtml = blogIndexHtml.replace('<div id="root"></div>', `<div id="root">${blogIndexBodyInjection}</div>`);

const blogDir = path.join(distDir, 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}
fs.writeFileSync(path.join(blogDir, 'index.html'), blogIndexHtml, 'utf8');
console.log('✅ Pre-rendered /blog/index.html');

// Generate /blog/:slug prerender
for (const post of blogPostsData) {
  const postTitle = post.title;
  const postDesc = post.metaDescription;
  const postCanonical = `https://www.lensique.com.mx/blog/${post.slug}`;
  sitemapUrls.push(postCanonical);
  
  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.metaDescription,
    "image": post.image,
    "datePublished": post.datePublished,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Óptica Lensique",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.lensique.com.mx/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postCanonical
    }
  };

  let finalJsonLd = postJsonLd;

  if (post.slug === 'monofocal-bifocal-o-progresivo') {
    finalJsonLd = [
      postJsonLd,
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "¿Cuánto tarda uno en acostumbrarse a los progresivos?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "La mayoría se adapta en unos días; algunas personas tardan hasta dos semanas. Ayuda usarlos de forma continua desde el primer día y mover la cabeza (no solo los ojos) para enfocar. Si después de dos semanas no te acomodas, vuelve con nosotros: revisamos el centrado y la graduación, y aplica nuestra garantía de adaptación."
            }
          },
          {
            "@type": "Question",
            "name": "¿Los progresivos sirven para la computadora?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí, la zona intermedia está pensada para eso. Si trabajas muchas horas frente a pantalla, coméntalo en tu examen: existen diseños con zona intermedia más amplia."
            }
          },
          {
            "@type": "Question",
            "name": "¿Puedo usar bifocales si ya usé progresivos?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Sí. No hay problema en cambiar de un tipo a otro; solo requiere un breve reajuste."
            }
          },
          {
            "@type": "Question",
            "name": "¿Cada cuánto debo revisar mi graduación si uso progresivos?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A partir de los 40, lo recomendable es una revisión anual: la presbicia avanza gradualmente y la graduación de cerca suele cambiar."
            }
          }
        ]
      }
    ];
  }

  const postHeadInjection = `
    <title>${postTitle}</title>
    <meta name="description" content="${postDesc}" />
    <link rel="canonical" href="${postCanonical}" />
    <meta property="og:title" content="${postTitle}" />
    <meta property="og:description" content="${postDesc}" />
    <meta property="og:image" content="${post.image}" />
    <meta property="og:url" content="${postCanonical}" />
    <meta property="og:type" content="article" />
    <meta property="article:published_time" content="${post.datePublished}" />
    <meta property="article:author" content="${post.author}" />
    <script type="application/ld+json">${JSON.stringify(finalJsonLd)}</script>
  `;

  const fullBodyHtml = marked.parse(post.body);

  const postBodyInjection = `
    <div style="max-width: 800px; margin: 40px auto; padding: 24px; font-family: sans-serif;" class="blog-content-wrapper">
      <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 24px;">${postTitle}</h1>
      <img src="${post.image}" alt="${post.title}" style="width: 100%; max-height: 400px; object-fit: cover; margin-bottom: 24px; border-radius: 8px;" />
      ${fullBodyHtml}
    </div>
  `;

  let postHtml = indexTemplate;
  postHtml = cleanMetaTags(postHtml);
  postHtml = postHtml.replace('</head>', `${postHeadInjection}\n</head>`);
  postHtml = postHtml.replace('<div id="root"></div>', `<div id="root">${postBodyInjection}</div>`);

  const postDir = path.join(blogDir, post.slug);
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }
  fs.writeFileSync(path.join(postDir, 'index.html'), postHtml, 'utf8');
}
console.log(`✅ Pre-rendered ${blogPostsData.length} blog post HTML pages in /dist/blog/[slug]/index.html`);


// 2. Generate sitemap.xml
const todayStr = new Date().toISOString().split('T')[0];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${url.includes('/producto/') ? '0.8' : '1.0'}</priority>
  </url>`).join('\n')}

  <url>
    <loc>https://www.lensique.com.mx/blog/monofocal-bifocal-o-progresivo</loc>
    <lastmod>2026-10-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'public', 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`✅ Generated /sitemap.xml with ${sitemapUrls.length} URLs.`);

// 3. Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://www.lensique.com.mx/sitemap.xml
`;

fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8');
fs.writeFileSync(path.join(rootDir, 'public', 'robots.txt'), robotsTxt, 'utf8');
console.log('✅ Generated /robots.txt with Sitemap directive.');

// 4. Generate 404.html page to prevent soft 404s
const fourOhFourHtml = `<!doctype html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8" />
  <title>Página no encontrada (404) | Óptica Lensique</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: sans-serif; text-align: center; padding: 60px 20px; background: #f8f6f2; color: #1b2436; margin: 0; }
    .card { max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    h1 { font-size: 32px; font-weight: 700; margin: 0 0 12px; color: #1b2436; }
    p { font-size: 16px; color: #666; margin: 0 0 28px; line-height: 1.5; }
    a { display: inline-block; padding: 14px 28px; background: #1b2436; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    
    <h1>Página no encontrada</h1>
    <p>La página o enlace que buscas no existe o cambió.</p>
    <a href="/catalogo" style="margin-right: 10px; margin-bottom: 10px;">Ir al catálogo</a>
    <a href="/blog">Ir al blog</a>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, '404.html'), fourOhFourHtml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'public', '404.html'), fourOhFourHtml, 'utf8');
console.log('✅ Generated /404.html page.');
