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

// Extract historical/existing slugs from public/sitemap.xml
const sitemapSlugs = new Set();
const existingSitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
if (fs.existsSync(existingSitemapPath)) {
  const sitemapContent = fs.readFileSync(existingSitemapPath, 'utf8');
  const matches = sitemapContent.matchAll(/\/producto\/([a-zA-Z0-9_-]+)/g);
  for (const m of matches) {
    if (m[1]) sitemapSlugs.add(m[1].toLowerCase());
  }
  console.log(`[Sitemap] Found ${sitemapSlugs.size} existing product slugs to support.`);
}

const sitemapUrls = [
  'https://www.lensique.com.mx/',
  'https://www.lensique.com.mx/armazones',
  'https://www.lensique.com.mx/lentes-de-contacto',
  'https://www.lensique.com.mx/agendar-cita'
];

const addBusinessDays = (startDate, daysToAdd) => {
  const date = new Date(startDate.getTime());
  let daysAdded = 0;
  while (daysAdded < daysToAdd) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) daysAdded++;
  }
  return date;
};

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

const toTitleCase = (str) => {
  return String(str).toLowerCase().replace(/(?:^|\s|-)\S/g, s => s.toUpperCase());
};

const formatBrandName = (brand) => {
  if (!brand) return '';
  const b = brand.trim();
  if (/^ray-?ban$/i.test(b)) return 'Ray-Ban';
  if (/^oq optiqus$/i.test(b)) return 'OQ Optiqus';
  if (/^thf$/i.test(b) || /^tommy hilfiger$/i.test(b)) return 'Tommy Hilfiger';
  if (/^calvin klein$/i.test(b)) return 'Calvin Klein';
  if (/^pierre thomas$/i.test(b)) return 'Pierre Thomas';
  return toTitleCase(b);
};

const formatModelName = (modelRaw) => {
  if (!modelRaw) return '';
  let cleaned = modelRaw.trim();
  cleaned = cleaned.replace(/^[0oO](?=[A-Za-z]{2})/i, '');
  return cleaned;
};

const getCleanModelName = (product) => {
  if (!product) return '';
  const isContact = String(product.category || '').toLowerCase().includes('contacto');
  let brand = (product.brand && product.brand !== 'null') ? product.brand.trim() : '';
  let rawName = (product.model || product.name || '').trim();

  if (isContact) {
    rawName = (product.name || product.model || '').trim();
    rawName = rawName.replace(/\\s*\\([^)]*\\)\\s*$/g, '').trim();

    if (!product.description && (/^LC-[A-Z0-9]+$/i.test(rawName) || rawName === product.sku)) {
      let skuRaw = product.sku || rawName;
      return skuRaw.replace(/^LC-/i, '');
    }
    rawName = rawName.replace(/^LC[\s-]+/i, '');
    rawName = rawName.replace(/^dalies\s+/i, 'Dailies ');
    rawName = rawName.replace(/^bioinfinity\s+/i, 'Biofinity ');
    const formattedB = formatBrandName(brand);
    if (brand && rawName.toUpperCase().startsWith(brand.toUpperCase())) {
      rawName = rawName.substring(brand.length).trim();
    }
    if (rawName === rawName.toUpperCase() && !/\b[A-Z]{1,3}\d+\b/.test(rawName)) {
      rawName = toTitleCase(rawName);
    }
    if (formattedB && rawName.toUpperCase().includes(formattedB.toUpperCase())) {
      return rawName.trim();
    }
    return (formattedB ? `${formattedB} ${rawName}` : rawName).trim();
  }

  let clean = rawName;
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
    const bUpper = brand.toUpperCase();
    while (clean.toUpperCase().startsWith(bUpper)) {
      clean = clean.substring(bUpper.length).trim();
    }
  }

  clean = clean.replace(/^(?:RAY-?BAN\s+)?VISTA\s+/i, '');
  clean = clean.replace(/\s*\((?:Vista|Sol)\)/gi, '');
  clean = clean.replace(/\b(?:Vista|Sol)\b/gi, '');
  clean = clean.replace(/\s*Talla\b.*$/i, '');
  clean = clean.replace(/\s*\([^)]*\)/g, '');
  clean = clean.replace(/\s*-\s*[A-Za-z0-9\u00C0-\u017F/]+(?:\s+[A-Za-z0-9\u00C0-\u017F/]+)*\s*$/, '');

  const multiDashMatch = clean.match(/^([A-Za-z]{1,4}-\d+[A-Za-z]?)-([A-Za-z0-9/]+)$/);
  if (multiDashMatch) {
    clean = multiDashMatch[1];
  }

  clean = clean.replace(/^([0oO]?[A-Za-z]{2}\d+[A-Za-z]?)\s+[A-Za-z0-9/]+.*$/, '$1');
  clean = formatModelName(clean);

  clean = clean.split(/\s+/).map(token => {
    if (/\d/.test(token) || /^(TH|CK|CA|ML|PU|SM|RA|RX|AN|VO)$/i.test(token)) {
      return token.toUpperCase();
    }
    return toTitleCase(token);
  }).join(' ');

  const formattedBrand = formatBrandName(brand);
  if (formattedBrand && clean.toUpperCase().startsWith(formattedBrand.toUpperCase())) {
    clean = clean.substring(formattedBrand.length).trim();
  }

  clean = clean.replace(/\s*-\s*$/, '').replace(/\s{2,}/g, ' ').trim();
  if (!clean || !/[a-zA-Z0-9]/.test(clean) || (formattedBrand && clean.toUpperCase() === formattedBrand.toUpperCase())) {
    clean = (formattedBrand || rawName).trim();
  }
  return clean;
};

// Process each product
let generatedCount = 0;
products.forEach(p => {
  const brand = (p.brand && p.brand !== 'null') ? p.brand.trim() : '';
  const isContact = String(p.category || '').toLowerCase().includes('contacto');
  const categoryLabel = isContact ? 'Lentes de Contacto' : 'Armazón oftálmico';
  const brandLabel = brand ? formatBrandName(brand) : (isContact ? 'Lentes de Contacto' : 'Óptica Lensique');
  const cleanModel = getCleanModelName(p);
  const displayName = p.display_name ? p.display_name.trim() : (brandLabel && !cleanModel.toUpperCase().startsWith(brandLabel.toUpperCase()) ? `${brandLabel} ${cleanModel}` : cleanModel).trim();
  const isFrame = !String(p.category || '').toLowerCase().includes('sol') && !isContact;
  const model = cleanModel;
  
  const slug = getProductSlug(p);
  const canonicalUrl = `https://www.lensique.com.mx/producto/${slug}`;
  sitemapUrls.push(canonicalUrl);

  const isOutOfStock = p.stock != null && p.stock !== '' && Number(p.stock) <= 0;
  const availabilitySchema = isOutOfStock ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock';
  const availabilityText = isOutOfStock ? 'Sobre pedido' : 'En existencia';
  const estAvailabilityDate = addBusinessDays(new Date(), 10).toISOString().split('T')[0];

  const basePrice = Number(p.price_incl_tax) || 0;
  const finalPrice = basePrice;

  const numericPrice = finalPrice.toFixed(2);
  const formattedPriceMxn = `${formatPrice(finalPrice)} MXN`;
  const absImg = resolveAbsImage(p.image_url);
  const pageTitle = `${displayName} | ${categoryLabel} | Óptica Lensique`;
  let pageDesc = p.description || `Compra ${displayName} (${categoryLabel}) en Óptica Lensique. Respaldo de oftalmólogo en Zapopan y envíos a todo México.`;
  if (isFrame) {
    pageDesc += ` Armazón desde ${formattedPriceMxn} con opción de micas graduadas ZEISS.`;
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
      ...(isOutOfStock ? { "availabilityDate": estAvailabilityDate } : {}),
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
    <script type="application/ld+json" id="product-jsonld">
${JSON.stringify(jsonLd, null, 2)}
    </script>
  `;

  const bodyInjection = `
    <div id="product-seo-fallback" style="max-width: 800px; margin: 40px auto; padding: 24px; font-family: sans-serif; border: 1px solid #eaeaea; border-radius: 16px; background: #ffffff;">
      <span style="font-size: 14px; font-weight: 500; color: #6b7280; letter-spacing: 0.05em;">${brandLabel} · ${categoryLabel}</span>
      <h1 style="font-size: 28px; font-weight: 700; color: #111827; margin: 8px 0;">${cleanModel}</h1>
      <p style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 12px 0;">${formattedPriceMxn} ${isFrame ? `<span style="font-size: 14px; font-weight: normal; color: #6b7280;">· Armazón solo (desde ${formatPrice(finalPrice + 1899)} MXN con micas ZEISS)</span>` : ''}</p>
      <div style="display: inline-block; padding: 6px 12px; background: ${isOutOfStock ? '#fff7ed' : '#f0fdf4'}; color: ${isOutOfStock ? '#c2410c' : '#15803d'}; font-weight: 600; border-radius: 6px; font-size: 13px; margin-bottom: 16px;">
        Disponibilidad: ${availabilityText}
      </div>
      <div style="margin: 20px 0;">
        <img src="${absImg}" alt="${model}" style="max-width: 100%; height: auto; border-radius: 12px;" />
      </div>
      <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">${pageDesc}</p>
      <p style="font-size: 13px; color: #9ca3af; margin-top: 12px;">SKU: <strong>${p.sku || slug}</strong></p>
      <a href="${canonicalUrl}?configurar=true" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: #1b2436; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600;">${isContact ? 'Comprar lentes de contacto' : 'Elegir micas'}</a>
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

  // Pre-render common alternative slugs for backward compatibility & robustness
  const extraSlugs = new Set();
  const brandSlug = slugify(p.brand || '');
  const modelSlug = slugify(p.model || p.name || '');
  const skuSlug = slugify(p.sku || '');

  // 1. Variations of oneday / one-day (vital for contact lenses)
  if (slug.includes('oneday')) {
    extraSlugs.add(slug.replace(/oneday/g, 'one-day'));
  }
  if (slug.includes('one-day')) {
    extraSlugs.add(slug.replace(/one-day/g, 'oneday'));
  }

  // 2. Brand + SKU combinations
  if (brandSlug && skuSlug) {
    extraSlugs.add(`${brandSlug}-${skuSlug}`);
    extraSlugs.add(`${brandSlug}-${skuSlug}-${skuSlug}`);
    if (modelSlug) {
      extraSlugs.add(`${brandSlug}-${modelSlug}`);
      extraSlugs.add(`${brandSlug}-${modelSlug}-${skuSlug}`);
    }
  }

  // 3. Model/Name + SKU combinations
  if (modelSlug && skuSlug) {
    extraSlugs.add(`${modelSlug}-${skuSlug}`);
    extraSlugs.add(`${modelSlug}-${skuSlug}-${skuSlug}`);
    if (modelSlug.includes('oneday')) {
      const withHyphen = modelSlug.replace(/oneday/g, 'one-day');
      extraSlugs.add(`${withHyphen}-${skuSlug}`);
      extraSlugs.add(`${withHyphen}-${skuSlug}-${skuSlug}`);
    }
    if (modelSlug.includes('one-day')) {
      const withoutHyphen = modelSlug.replace(/one-day/g, 'oneday');
      extraSlugs.add(`${withoutHyphen}-${skuSlug}`);
      extraSlugs.add(`${withoutHyphen}-${skuSlug}-${skuSlug}`);
    }
  }

  // 4. SKU alone
  if (skuSlug) {
    extraSlugs.add(skuSlug);
  }

  // 5. Match against historical sitemap slugs
  for (const oldSlug of sitemapSlugs) {
    if (skuSlug && (oldSlug.endsWith(`-${skuSlug}`) || oldSlug === skuSlug || oldSlug.includes(skuSlug))) {
      extraSlugs.add(oldSlug);
    }
  }

  for (const extraSlug of extraSlugs) {
    if (extraSlug && extraSlug !== slug) {
      const extraProdDir = path.join(distDir, 'producto', extraSlug);
      if (!fs.existsSync(extraProdDir)) {
        fs.mkdirSync(extraProdDir, { recursive: true });
      }
      fs.writeFileSync(path.join(extraProdDir, 'index.html'), html, 'utf8');
    }
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
const micasTitle = "Micas ZEISS · Lensique";
const micasDesc = "Todas nuestras micas son ZEISS: tecnología óptica alemana de precisión, diseñada para cada necesidad de tu vista.";
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

const micasBodyInjection = `
  <div class="micas-zeiss-page">
    <div class="mz-hero">
      <img class="mz-zl" src="/assets/zeiss_logo.png" alt="ZEISS" />
      <h1>Micas ZEISS</h1>
      <p>Todas nuestras micas son ZEISS: tecnología óptica alemana de precisión, diseñada para cada necesidad de tu vista.</p>
    </div>
    <div class="mz-wrap">
      <div class="mz-lead">
        <div class="mz-k">Tecnología ZEISS</div>
        <h2>Elige la mica según tu día a día</h2>
      </div>
      <div class="mz-grid">
        <div class="mz-card">
          <div class="mz-imgwrap"><img src="/assets/zeiss/blueguard.jpg" alt="ZEISS BlueGuard" /></div>
          <div class="mz-cbody"><div class="mz-ct">ZEISS BlueGuard</div><div class="mz-cb">Filtra la luz azul de pantallas; menos fatiga visual.</div></div>
        </div>
        <div class="mz-card">
          <div class="mz-imgwrap"><img src="/assets/zeiss/photofusion.jpg" alt="ZEISS PhotoFusion X" /></div>
          <div class="mz-cbody"><div class="mz-ct">ZEISS PhotoFusion X</div><div class="mz-cb">Fotocromático: se oscurece al sol y se aclara en interiores.</div></div>
        </div>
        <div class="mz-card">
          <div class="mz-imgwrap"><img src="/assets/zeiss/duravision.jpg" alt="ZEISS DuraVision" /></div>
          <div class="mz-cbody"><div class="mz-ct">ZEISS DuraVision</div><div class="mz-cb">Antirreflejante premium: más nitidez, menos reflejos, más resistencia.</div></div>
        </div>
        <div class="mz-card">
          <div class="mz-imgwrap"><img src="/assets/zeiss/smartlife.jpg" alt="ZEISS Progresivo" /></div>
          <div class="mz-cbody"><div class="mz-ct">ZEISS Progresivo</div><div class="mz-cb">Visión clara en todo lugar, adaptada a tu edad y tu día digital.</div></div>
        </div>
        <div class="mz-card">
          <div class="mz-imgwrap"><img src="/assets/zeiss/uvprotect.jpg" alt="ZEISS UVProtect" /></div>
          <div class="mz-cbody"><div class="mz-ct">ZEISS UVProtect</div><div class="mz-cb">Protección UV total en lentes transparentes.</div></div>
        </div>
      </div>
      <div class="mz-cta">
        <a href="#cotizador-micas">Elegir mis micas</a>
        <span class="mz-s">Cotiza tus micas en menos de un minuto con tecnología ZEISS.</span>
      </div>
      <div class="mz-note">Imágenes y marca ZEISS usadas con autorización. © Carl Zeiss. Lensique es distribuidor autorizado de lentes oftálmicos Carl Zeiss Vision en México.</div>
    </div>
    <section id="cotizador-micas" class="mz-cotizador-section" style="padding: 72px 24px 96px; background-color: #f8fafc; border-top: 1px solid #e8eaed;">
      <div class="mz-cotizador-header" style="text-align: center; max-width: 760px; margin: 0 auto 36px;">
        <div class="mz-k" style="font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #2f6bff; font-weight: 700;">Cotizador Interactivo</div>
        <h2 class="mz-cotizador-title" style="font-family: Georgia, serif; font-size: 32px; font-weight: 700; color: #16223f; margin: 8px 0 12px;">Cotiza tus micas en menos de un minuto</h2>
        <p class="mz-cotizador-sub" style="color: #7b7b7b; font-size: 16px; margin: 0;">Descubre las opciones de micas monofocales, bifocales o progresivas con tecnología ZEISS y calcula el costo exacto según tu receta y necesidades.</p>
      </div>
      <div class="mz-cotizador-iframe-wrap" style="max-width: 1100px; margin: 0 auto; min-height: 580px; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.1);">
        <iframe src="/asesor_zeiss.html" title="Asesor Visual ZEISS · Cotizador de Micas" style="width: 100%; height: 100%; border: none;"></iframe>
      </div>
    </section>
  </div>
`;
let micasHtml = fs.readFileSync(templatePath, 'utf8').replace(/<title>.*<\/title>/, '');
micasHtml = micasHtml.replace('</head>', micasHeadInjection + '</head>');
micasHtml = micasHtml.replace('<div id="root"></div>', `<div id="root">${micasBodyInjection}</div>`);
const micasDir = path.join(distDir, 'micas');
if (!fs.existsSync(micasDir)) fs.mkdirSync(micasDir, { recursive: true });
fs.writeFileSync(path.join(micasDir, 'index.html'), micasHtml, 'utf8');
console.log('✅ Pre-rendered /micas/index.html');

// Generate /lentes-de-contacto prerender
const lentesContactoTitle = "Lentes de Contacto en Zapopan y Guadalajara | Guía y Compra | Lensique";
const lentesContactoDesc = "Descubre cómo usar, ponerte y cuidar tus lentes de contacto en Zapopan y Guadalajara. Guía paso a paso, validación por optometrista y marcas líderes originales.";
const lentesContactoCanonical = "https://www.lensique.com.mx/lentes-de-contacto";

const lentesContactoHeadInjection = `
    <title>${lentesContactoTitle}</title>
    <meta name="description" content="${lentesContactoDesc}" />
    <link rel="canonical" href="${lentesContactoCanonical}" />
    <meta property="og:title" content="${lentesContactoTitle}" />
    <meta property="og:description" content="${lentesContactoDesc}" />
    <meta property="og:url" content="${lentesContactoCanonical}" />
    <meta property="og:type" content="website" />
`;

const lentesContactoBodyInjection = `
  <main style="max-width: 960px; margin: 40px auto; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
    <h1 style="font-size: 38px; font-weight: 700; margin-bottom: 8px;">Lentes de contacto</h1>
    <p style="font-size: 22px; color: #475569; font-style: italic; margin-bottom: 24px;">Visión libre y cómoda</p>
    <p style="font-size: 18px; line-height: 1.6; color: #334155; margin-bottom: 32px;">
      Los lentes de contacto te dan libertad: ver bien sin que un armazón se interponga, para el deporte, el trabajo o simplemente para verte distinto. Pero no son «una caja que pides y ya» — cada ojo es diferente. Aquí te explicamos cómo usarlos, cómo cuidarlos y cómo elegirlos bien, con la validación de un optometrista de por medio. La idea es que los uses con seguridad y comodidad, no a prueba y error.
    </p>

    <h2 style="font-size: 28px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">Cómo ponerte los lentes de contacto</h2>
    <ol style="font-size: 16px; line-height: 1.8; color: #334155; padding-left: 20px;">
      <li><strong>Lávate y seca bien las manos</strong> con una toalla sin pelusa. Es el paso más importante.</li>
      <li><strong>Saca el lente</strong> del estuche o blíster y ponlo en la yema del dedo índice. Revisa que no esté roto.</li>
      <li><strong>Verifica que no esté al revés:</strong> un lente bien puesto parece un tazón con bordes rectos hacia arriba; si los bordes se abren como un plato, está volteado.</li>
      <li>Con la otra mano, <strong>sujeta el párpado de arriba</strong> para que no parpadees.</li>
      <li><strong>Baja el párpado de abajo</strong> con el dedo medio de la mano que tiene el lente.</li>
      <li><strong>Mira hacia arriba o al frente</strong> y acerca el lente despacio hasta tocar el ojo; suéltalo.</li>
      <li><strong>Cierra el ojo un momento</strong>, mira en varias direcciones para acomodarlo, y suelta los párpados. Parpadea suave. Listo.</li>
    </ol>

    <h2 style="font-size: 28px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">Cómo quitártelos</h2>
    <ol style="font-size: 16px; line-height: 1.8; color: #334155; padding-left: 20px;">
      <li><strong>Lávate y seca las manos</strong> otra vez.</li>
      <li><strong>Mira hacia arriba</strong> y baja el párpado inferior con el dedo medio.</li>
      <li>Con el índice, <strong>desliza el lente suavemente hacia abajo</strong> (a la parte blanca del ojo).</li>
      <li><strong>Pellízcalo con cuidado</strong> entre el pulgar y el índice para sacarlo.</li>
      <li>Si es <strong>mensual</strong>, guárdalo en su estuche con solución nueva (no la reuses). Si es <strong>diario</strong>, tíralo.</li>
    </ol>

    <h2 style="font-size: 28px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">Higiene y cuidado: lo que sí y lo que no</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <div style="background: #f0fdf4; padding: 20px; border-radius: 16px;">
        <h3 style="color: #166534; margin-top: 0;">Lo que Sí debes hacer</h3>
        <ul style="color: #14532d; line-height: 1.6;">
          <li>Manos limpias y secas siempre.</li>
          <li>Usa solo la solución recomendada, y cambia el estuche cada ~3 meses.</li>
          <li>Respeta el tiempo de uso (un diario es de un día).</li>
          <li>Quítatelos antes de dormir (salvo que sean de uso prolongado).</li>
        </ul>
      </div>
      <div style="background: #fef2f2; padding: 20px; border-radius: 16px;">
        <h3 style="color: #991b1b; margin-top: 0;">Lo que No debes hacer</h3>
        <ul style="color: #7f1d1d; line-height: 1.6;">
          <li>Nunca uses agua de la llave ni saliva.</li>
          <li>No reutilices un lente diario.</li>
          <li>No los compartas con nadie.</li>
          <li>No te bañes ni nades con ellos puestos (salvo indicación).</li>
        </ul>
      </div>
    </div>

    <h2 style="font-size: 28px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">Tipos que manejamos</h2>
    <ul style="font-size: 16px; line-height: 1.8; color: #334155;">
      <li><strong>Diarios:</strong> un par nuevo cada día, lo más higiénico y sin limpieza.</li>
      <li><strong>Mensuales / quincenales:</strong> más económicos por día; requieren cuidado.</li>
      <li><strong>Tóricos:</strong> para astigmatismo.</li>
      <li><strong>Multifocales:</strong> para ver de lejos y cerca (presbicia).</li>
      <li><strong>De color / cosméticos:</strong> con materiales de grado oftálmico.</li>
    </ul>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px 24px; margin: 32px 0;">
      <p style="font-size: 16px; line-height: 1.6; color: #166534; margin: 0;">
        <strong>Garantía Lensique:</strong> Venta de cajas selladas originales, validación de receta por optometrista antes de surtir y devolución de cajas selladas hasta 15 días.
      </p>
    </div>

    <h2 style="font-size: 28px; font-weight: 700; margin-top: 40px; margin-bottom: 16px;">Marcas</h2>
    <p style="font-size: 16px; line-height: 1.7; color: #334155;">
      Acuvue, Biofinity (CooperVision), Bausch + Lomb, Biotrue, Air Optix y más.
    </p>

    <div style="margin-top: 32px;">
      <a href="/catalogo?tipo=contacto" style="display: inline-block; padding: 14px 28px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; margin-right: 12px;">Ver lentes de contacto</a>
    </div>
  </main>
`;

let lentesContactoHtml = indexTemplate;
if (lentesContactoHtml.includes('<title>')) {
  lentesContactoHtml = lentesContactoHtml.replace(/<title>.*?<\/title>/s, `<title>${lentesContactoTitle}</title>`);
}
lentesContactoHtml = lentesContactoHtml.replace('</head>', `${lentesContactoHeadInjection}\n</head>`);
lentesContactoHtml = lentesContactoHtml.replace('<div id="root"></div>', `<div id="root">${lentesContactoBodyInjection}</div>`);

const lentesContactoDir = path.join(distDir, 'lentes-de-contacto');
if (!fs.existsSync(lentesContactoDir)) {
  fs.mkdirSync(lentesContactoDir, { recursive: true });
}
fs.writeFileSync(path.join(lentesContactoDir, 'index.html'), lentesContactoHtml, 'utf8');
console.log('✅ Pre-rendered /lentes-de-contacto/index.html');

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

// Generate /seguimiento prerender (noindex, do NOT add to sitemap)
const trackingTitle = 'Seguimiento de tu pedido | Lensique';
const trackingDesc = 'Consulta el estado de tu pedido en Óptica Lensique con tu número de folio o enlace directo.';
const trackingHeadInjection = `
  <title>${trackingTitle}</title>
  <meta name="description" content="${trackingDesc}" />
  <meta name="robots" content="noindex, follow" />
`;

const trackingBodyInjection = `
  <div style="max-width: 600px; margin: 40px auto; padding: 24px; font-family: sans-serif;">
    <h1 style="font-size: 28px; font-weight: 700; color: #111827;">Seguimiento de tu pedido</h1>
    <p style="font-size: 16px; color: #4b5563;">Consulta el estado de tu pedido en Óptica Lensique.</p>
  </div>
`;

let trackingHtml = indexTemplate;
if (trackingHtml.includes('<title>')) {
  trackingHtml = trackingHtml.replace(/<title>.*?<\/title>/s, `<title>${trackingTitle}</title>`);
}
trackingHtml = trackingHtml.replace('</head>', `${trackingHeadInjection}\n</head>`);
trackingHtml = trackingHtml.replace('<div id="root"></div>', `<div id="root">${trackingBodyInjection}</div>`);

const trackingDir = path.join(distDir, 'seguimiento');
if (!fs.existsSync(trackingDir)) {
  fs.mkdirSync(trackingDir, { recursive: true });
}
fs.writeFileSync(path.join(trackingDir, 'index.html'), trackingHtml, 'utf8');
console.log('✅ Pre-rendered /seguimiento/index.html (noindex)');

// Generate /aviso-de-privacidad prerender
const privTitle = "Aviso de Privacidad | Óptica Lensique";
const privDesc = "Aviso de Privacidad de Óptica Lensique conforme a la LFPDPPP. Consulta el tratamiento y protección de tus datos personales y sensibles.";
const privCanonical = "https://www.lensique.com.mx/aviso-de-privacidad";
sitemapUrls.push(privCanonical);

const privHeadInjection = `
    <title>${privTitle}</title>
    <meta name="description" content="${privDesc}" />
    <link rel="canonical" href="${privCanonical}" />
`;
let privHtml = indexTemplate;
if (privHtml.includes('<title>')) privHtml = privHtml.replace(/<title>.*?<\/title>/s, `<title>${privTitle}</title>`);
privHtml = privHtml.replace('</head>', `${privHeadInjection}\n</head>`);

const privDir = path.join(distDir, 'aviso-de-privacidad');
if (!fs.existsSync(privDir)) {
  fs.mkdirSync(privDir, { recursive: true });
}
fs.writeFileSync(path.join(privDir, 'index.html'), privHtml, 'utf8');
console.log('✅ Pre-rendered /aviso-de-privacidad/index.html');

// Generate /terminos prerender
const termTitle = "Términos y Condiciones | Óptica Lensique";
const termDesc = "Términos y condiciones de compra, validación de recetas por optometrista y servicios de Óptica Lensique Zapopan.";
const termCanonical = "https://www.lensique.com.mx/terminos";
sitemapUrls.push(termCanonical);

const termHeadInjection = `
    <title>${termTitle}</title>
    <meta name="description" content="${termDesc}" />
    <link rel="canonical" href="${termCanonical}" />
`;
let termHtml = indexTemplate;
if (termHtml.includes('<title>')) termHtml = termHtml.replace(/<title>.*?<\/title>/s, `<title>${termTitle}</title>`);
termHtml = termHtml.replace('</head>', `${termHeadInjection}\n</head>`);

const termDir = path.join(distDir, 'terminos');
if (!fs.existsSync(termDir)) {
  fs.mkdirSync(termDir, { recursive: true });
}
fs.writeFileSync(path.join(termDir, 'index.html'), termHtml, 'utf8');
console.log('✅ Pre-rendered /terminos/index.html');

// Generate /cookies prerender
const cookTitle = "Política de Cookies | Óptica Lensique";
const cookDesc = "Conoce las cookies esenciales y analíticas utilizadas en Óptica Lensique para optimizar tu navegación y compra.";
const cookCanonical = "https://www.lensique.com.mx/cookies";
sitemapUrls.push(cookCanonical);

const cookHeadInjection = `
    <title>${cookTitle}</title>
    <meta name="description" content="${cookDesc}" />
    <link rel="canonical" href="${cookCanonical}" />
`;
let cookHtml = indexTemplate;
if (cookHtml.includes('<title>')) cookHtml = cookHtml.replace(/<title>.*?<\/title>/s, `<title>${cookTitle}</title>`);
cookHtml = cookHtml.replace('</head>', `${cookHeadInjection}\n</head>`);

const cookDir = path.join(distDir, 'cookies');
if (!fs.existsSync(cookDir)) {
  fs.mkdirSync(cookDir, { recursive: true });
}
fs.writeFileSync(path.join(cookDir, 'index.html'), cookHtml, 'utf8');
console.log('✅ Pre-rendered /cookies/index.html');

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
      slug: 'guia-indices-micas-lentes-delgados-zeiss-174',
      title: 'Índice de refracción en micas: cómo tener lentes delgados y estéticos con graduación alta (1.50 vs 1.60 vs 1.67 vs 1.74) | Óptica Lensique',
      metaDescription: '¿Tienes miopía o astigmatismo alto y temes que tus micas queden gruesas o pesadas? Guía completa sobre los índices de refracción (1.50, 1.60, 1.67 y ZEISS 1.74 Ultra Delgada), comparativa de grosor y cómo elegir armazón en Lensique, Zapopan.',
      image: 'https://www.lensique.com.mx/assets/DSC09710.jpg',
      author: 'Equipo Óptica Lensique (revisado por oftalmólogo)',
      datePublished: '2024-03-26T10:00:00Z',
      excerpt: '¿Graduación alta y miedo al efecto "fondo de botella"? Conoce cómo funcionan los índices de refracción (1.50, 1.60, 1.67 y ZEISS 1.74), qué tanto adelgazan tus micas y cómo elegir el armazón ideal.',
      body: `# Índice de refracción en micas: cómo tener lentes delgados con graduación alta (1.50 vs 1.60 vs 1.67 vs 1.74)

Si tienes miopía, hipermetropía o astigmatismo medio o alto (más de 3, 4 o hasta 8 dioptrías), es muy probable que hayas pasado por esta frustración: vas a una óptica, eliges un armazón bonito y ligero, pero al momento de la entrega las micas sobresalen por los lados, pesan sobre la nariz y hacen que tus ojos se vean notablemente más pequeños detrás del lente.

Durante décadas, la respuesta común era resignarse: *"con esa graduación, es normal que quede grueso"*, o te obligaban a usar armazones toscos de pasta negra para ocultar el borde del lente.

Afortunadamente, la tecnología óptica ha evolucionado. Hoy en día, gracias a los **materiales de alto índice de refracción y el tallado digital de precisión alemana (como ZEISS)**, es totalmente posible tener lentes graduados delgados, ligeros y estéticos, incluso con recetas elevadas. Aquí te explicamos sin tecnicismos cómo funciona y cuál índice le corresponde a tus ojos.

## ¿Qué es el "índice de refracción" en español sencillo?

En óptica, el índice de refracción es simplemente un número que mide **qué tan eficiente es el material de la mica para doblar y enfocar la luz**.

- **A menor índice:** el material necesita **más volumen y espesor** para lograr desviar los rayos de luz y corregir tu vista.
- **A mayor índice:** el material desvía la luz con mayor facilidad, por lo que se requiere **mucho menos grosor de material** para lograr exactamente la misma graduación.

El resultado práctico: dos micas con exactamente la misma graduación pueden tener un espesor drásticamente distinto dependiendo del índice de refracción con el que fueron fabricadas.

## Comparativa de índices: ¿cuál es la diferencia entre 1.50, 1.60, 1.67 y 1.74?

### 1. Índice 1.50 (Estándar · El material clásico)
Es el material orgánico convencional (CR-39) que se utiliza de base en la mayoría de las ópticas.
- **Para quién es:** graduaciones bajas (entre 0.00 y ±2.00 dioptrías).
- **Ventajas:** excelente claridad óptica y precio más económico.
- **Limitación:** en graduaciones mayores a -2.50 D, el borde de la mica comienza a engrosarse visiblemente y a ganar peso.

### 2. Índice 1.60 (Adelgazada · 20% más fina)
Es el primer salto hacia el alto índice.
- **Para quién es:** graduaciones medias (entre ±2.00 y ±4.00 dioptrías).
- **Ventajas:** es aproximadamente un **20% más delgada y ligera** que la mica estándar. Además, es un material con altísima resistencia a impactos y fracturas, ideal para armazones ranurados o perforados.
- **Limitación:** en graduaciones superiores a -4.50 D, el borde aún puede asomarse en armazones delgados de metal.

### 3. Índice 1.67 (Extra Delgada · 30% a 35% más fina)
Un material de alto índice diseñado para quienes buscan mayor estética y ligereza.
- **Para quién es:** graduaciones medias a altas (entre ±4.00 y ±6.00 dioptrías).
- **Ventajas:** hasta **35% más delgada** que una mica estándar. Reduce drásticamente el peso sobre el puente nasal y oculta el espesor en la mayoría de armazones de acetato o metal.

### 4. Índice 1.74 (ZEISS Ultra Delgada · La máxima delgadez mundial)
El material orgánico más delgado y avanzado disponible en la industria óptica moderna.
- **Para quién es:** miopías y astigmatismos altos (desde -4.00 hasta -12.00 dioptrías o más).
- **Ventajas:** hasta **40% más delgada y ligera** que una mica convencional. Su diseño asférico y tallado digital punto por punto de ZEISS permite que el lente quede **al ras del armazón**, eliminando el temido borde pesado y desbordado.
- **Beneficio estético único:** mantiene la proporción y el tamaño natural de tus ojos sin distorsiones en la mirada.

## ¿Por qué se ven los ojos "chiquitos" con miopía y cómo lo soluciona el 1.74?

Las micas para miopía son cóncavas: delgadas en el centro y gruesas en los extremos. Ópticamente, funcionan como un lente reductor, lo que provoca el famoso efecto de "ojos achicados" cuando alguien te mira desde afuera.

Al usar una mica de **alto índice 1.74 con tecnología ZEISS**:
1. **La curvatura es mucho más plana (diseño asférico):** la mica se coloca más cerca del ojo, disminuyendo el efecto óptico de minimización.
2. **Menos peso y menos presión:** al pesar hasta un 40% menos, el armazón no se desliza constantemente por tu nariz a lo largo del día.
3. **Nitidez periférica total:** se eliminan las distorsiones molestas en los extremos laterales del campo visual.

## 3 Consejos de oro para elegir armazón con graduación alta

1. **Cuida el tamaño del armazón (calibre):** en miopía, el grosor aumenta conforme te alejas del centro hacia los bordes. Un armazón con aros de tamaño mediano (48 a 52 mm) reduce drásticamente el grosor visible frente a un armazón gigante "oversize".
2. **Formas redondeadas o suaves:** los armazones con esquinas muy afiladas o rectangulares alargadas tienden a mostrar más grosor en los vértices externos. Las formas ligeramente redondeadas o tipo panto disimulan el grosor a la perfección.
3. **Centrado pupilar exacto:** en Lensique medimos tu distancia interpupilar y altura de montaje milimétricamente con equipo de diagnóstico digital, asegurando que el centro óptico quede justo frente a tu pupila.

## ¿Tienes dudas sobre qué índice necesita tu receta?

En **Óptica Lensique (Zapopan, Guadalajara)** contamos con optometristas y respaldo de oftalmólogo para revisar tu graduación de forma personalizada. 

- Puedes **enviarnos una foto de tu receta por WhatsApp** y te decimos con total honestidad qué material te conviene.
- O puedes **agendar tu examen de la vista completo** en nuestro consultorio en Av. Guadalupe.

[Agenda tu examen de la vista en Zapopan](/#servicios) · [Ver catálogo de armazones](/catalogo) · [Conoce nuestras micas ZEISS](/micas) · [Cotizador en línea](/cotizador)`
    },
    {
    slug: 'monofocal-bifocal-o-progresivo',
    title: 'Monofocales, bifocales o progresivos: ¿cuál necesitas? | Óptica Lensique',
    metaDescription: 'Diferencias claras entre micas monofocales, bifocales y progresivas: para quién es cada una, ventajas, adaptación y precio. Explicado por Óptica Lensique, Zapopan.',
    image: 'https://www.lensique.com.mx/blog/monofocal-bifocal-o-progresivo.jpg',
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
    image: 'https://www.lensique.com.mx/blog/examen-de-la-vista.jpg',
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
    image: 'https://www.lensique.com.mx/blog/filtro-luz-azul.jpg',
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

// 5. Prerender Hero into dist/index.html for immediate mobile LCP paint
if (fs.existsSync(templatePath)) {
  let homeHtml = fs.readFileSync(templatePath, 'utf8');
  const heroPrerender = `<div class="app-container"><header class="navbar" style="position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);padding:12px 20px;"><div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;"><a href="/" class="logo"><img src="/logo.png" alt="Lensique" class="logo-img" width="160" height="40" style="display:block;max-height:38px;width:auto;" /></a></div></header><main class="main-content"><section class="hero" style="position:relative;overflow:hidden;display:flex;align-items:center;min-height:85vh;"><picture style="position:absolute;top:0;left:0;width:100%;height:100%;"><source srcset="/hero-mobile.webp" media="(max-width: 768px)" width="1080" height="1350" /><img src="/hero-desktop.webp" alt="Persona probándose lentes en una óptica" class="hero-background-img" loading="eager" fetchpriority="high" width="1920" height="1080" style="position:relative;width:100%;height:100%;object-fit:cover;" /></picture><div class="hero-content" style="position:relative;z-index:2;padding:40px 24px;max-width:650px;"><span class="hero-eyebrow" style="display:inline-block;font-size:13px;text-transform:uppercase;letter-spacing:0.15em;font-weight:600;color:#1b2436;margin-bottom:12px;">Óptica Boutique en Zapopan</span><h1 class="hero-title" style="font-family:'Playfair Display',serif;font-size:clamp(32px,5vw,56px);font-weight:700;color:#1b2436;line-height:1.15;margin:0 0 16px;">La perfección en tu mirada</h1><p class="hero-subheading" style="font-size:clamp(16px,2vw,18px);color:#475569;line-height:1.6;margin:0 0 28px;">Armazones de diseñador, micas de alta tecnología y examen visual respaldado por oftalmólogo.</p><div class="hero-actions-left" style="display:flex;gap:12px;flex-wrap:wrap;"><a href="#contacto" class="btn btn-wp-primary" style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;background:#1b2436;color:#ffffff;border-radius:50px;text-decoration:none;font-weight:600;"><span>Agenda tu examen</span></a><a href="/catalogo" class="btn btn-wp-secondary" style="display:inline-flex;align-items:center;padding:14px 28px;background:rgba(255,255,255,0.9);color:#1b2436;border:1px solid #e2e8f0;border-radius:50px;text-decoration:none;font-weight:600;">Ver Armazones</a></div></div></section></main></div>`;
  homeHtml = homeHtml.replace('<div id="root"></div>', `<div id="root">${heroPrerender}</div>`);
  fs.writeFileSync(templatePath, homeHtml, 'utf8');
  console.log('✅ Injected Prerendered Hero into dist/index.html for near-instant LCP.');
}




