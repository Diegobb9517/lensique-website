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

const getInventedName = (productName, category = '') => {
  if (!productName) return '';
  const isContact = String(category).toLowerCase().includes('contacto');
  if (isContact) return productName;
  let hash = 0;
  for (let i = 0; i < productName.length; i++) {
    hash = productName.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  return WP_NAMES[hash % WP_NAMES.length];
};

async function checkSizes() {
  const r = await fetch('https://lensique-pos.onrender.com/api/website/content');
  const d = await r.json();
  const prods = typeof d.full_catalog_data === 'string' ? JSON.parse(d.full_catalog_data) : d.full_catalog_data;
  
  let heavyCount = 0;
  for (const p of prods) {
    if (p.image_url) {
      try {
        let url = p.image_url;
        if (url.startsWith('/')) url = `https://lensique-pos.onrender.com${url}`;
        
        const head = await fetch(url, { method: 'HEAD' });
        const len = head.headers.get('content-length');
        if (len) {
          const kb = (parseInt(len) / 1024).toFixed(2);
          const name = getInventedName(p.name, p.category);
          if (name === 'Leo' || name === 'Levi') {
             console.log(`[${name}] ${kb} KB`);
          }
          if (parseInt(len) > 300 * 1024) {
             heavyCount++;
          }
        }
      } catch (e) {
         // ignore
      }
    }
  }
  console.log(`Heavy catalog images (>300KB): ${heavyCount}`);
}

checkSizes();
