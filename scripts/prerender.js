import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
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

// 1. Fetch Products
let products = [];
if (fs.existsSync(dbPath)) {
  try {
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(dbPath);
    products = db.prepare(`
      SELECT p.id, p.name, p.sku, p.brand, p.price_incl_tax, p.stock, c.name as category, p.image_url, p.description
      FROM products p 
      JOIN product_categories c ON p.category_id = c.id 
      WHERE p.status = 'ACTIVE' 
      AND UPPER(TRIM(COALESCE(p.brand, ''))) != 'CH'
      ORDER BY p.brand ASC, p.name ASC
    `).all();
    console.log(`[Database] Loaded ${products.length} products from SQLite database.`);
  } catch (err) {
    console.warn('[Database] Error loading from SQLite, falling back to content2.json:', err.message);
  }
}

if (products.length === 0) {
  const content2Path = path.join(rootDir, 'content2.json');
  if (fs.existsSync(content2Path)) {
    try {
      const content = JSON.parse(fs.readFileSync(content2Path, 'utf8'));
      const fullCat = typeof content.full_catalog_data === 'string' ? JSON.parse(content.full_catalog_data) : (content.full_catalog_data || []);
      products = fullCat.filter(p => (p.brand || '').toUpperCase().trim() !== 'CH');
      console.log(`[content2.json] Loaded ${products.length} products.`);
    } catch (e) {
      console.error('[content2.json] Error reading content2.json:', e);
    }
  }
}

if (products.length === 0) {
  console.error('❌ Error: No products found for prerendering!');
  process.exit(1);
}

const templatePath = path.join(distDir, 'index.html');
if (!fs.existsSync(templatePath)) {
  console.error(`❌ Template not found at ${templatePath}. Run vite build first.`);
  process.exit(1);
}

const indexTemplate = fs.readFileSync(templatePath, 'utf8');

const formatPrice = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num);
};

const resolveAbsImage = (imgUrl) => {
  if (!imgUrl || imgUrl === 'null' || imgUrl === 'undefined') {
    return 'https://www.lensique.com.mx/hero_glasses.jpg';
  }
  let url = String(imgUrl).trim();
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `https://lensique-pos.onrender.com${url}`;
  return `https://lensique-pos.onrender.com/${url}`;
};

const sitemapUrls = [
  'https://www.lensique.com.mx/',
  'https://www.lensique.com.mx/armazones',
  'https://www.lensique.com.mx/lentes-de-contacto'
];

let generatedCount = 0;

products.forEach(p => {
  const brand = (p.brand && p.brand !== 'null') ? p.brand.trim() : '';
  const model = (p.model || p.name || '').trim();
  const isContact = String(p.category || '').toLowerCase().includes('contacto');
  const categoryLabel = isContact ? 'Lentes de Contacto' : 'Armazón oftálmico';
  const slug = getProductSlug(p);
  const canonicalUrl = `https://www.lensique.com.mx/producto/${slug}`;
  sitemapUrls.push(canonicalUrl);

  const isOutOfStock = p.stock != null && p.stock !== '' && Number(p.stock) <= 0;
  const availabilitySchema = isOutOfStock ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock';
  const availabilityText = isOutOfStock ? 'Sobre pedido' : 'En existencia';
  
  const numericPrice = (Number(p.price_incl_tax) || 0).toFixed(2);
  const formattedPriceMxn = `${formatPrice(p.price_incl_tax)} MXN`;
  const absImg = resolveAbsImage(p.image_url);
  const pageTitle = `${brand ? brand + ' ' : ''}${model} | ${categoryLabel} | Óptica Lensique`;
  const pageDesc = p.description || `Compra ${brand ? brand + ' ' : ''}${model} (${categoryLabel}) en Óptica Lensique. Examen de vista gratis en Zapopan y envío a todo México.`;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `${brand ? brand + ' ' : ''}${model} - ${categoryLabel}`,
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
      <a href="${canonicalUrl}" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: #1b2436; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600;">
        Seleccionar micas y comprar
      </a>
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
  fs.writeFileSync(path.join(prodDir, 'index.html'), html, 'utf8');
  generatedCount++;
});

console.log(`✅ Pre-rendered ${generatedCount} static product HTML pages in /dist/producto/[slug]/index.html`);

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
    <h1>404 - Producto no encontrado</h1>
    <p>El producto o enlace que buscas no existe en nuestro catálogo.</p>
    <a href="https://www.lensique.com.mx/armazones">Explorar Catálogo</a>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, '404.html'), fourOhFourHtml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'public', '404.html'), fourOhFourHtml, 'utf8');
console.log('✅ Generated /404.html page.');
