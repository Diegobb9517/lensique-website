const fs = require('fs');
const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add availability filter state
if (!content.includes('const [availabilityFilter, setAvailabilityFilter]')) {
  content = content.replace(
    /const \[contactUsageFilter, setContactUsageFilter\] = useState\('Todos'\);/,
    "const [contactUsageFilter, setContactUsageFilter] = useState('Todos');\n  const [availabilityFilter, setAvailabilityFilter] = useState('Todos');"
  );
  
  // 2. Read query params on open
  content = content.replace(
    /setContactUsageFilter\('Todos'\);/,
    `setContactUsageFilter('Todos');\n      const searchParams = new URLSearchParams(window.location.search);\n      if (searchParams.get('disponibilidad') === 'existencia') {\n        setAvailabilityFilter('En existencia');\n      } else {\n        setAvailabilityFilter('Todos');\n      }`
  );

  // 3. Update filteredProducts logic to handle availability and sort
  const filteredProductsRegex = /const filteredProducts = \(catalogData \|\| \[\]\)\.map\([\s\S]*?return matchesSearch && matchesBrand && matchesCategory;\n  \}\);/g;
  
  const replacement = `const filteredProducts = (catalogData || []).map(p => {
    let displayName = p.name;
    if (String(p.category || '').toLowerCase().includes('contacto')) {
      displayName = \`\${p.name} (\${getContactLensType(p.name || '')})\`;
    }
    return {
      ...p,
      name: displayName,
      image: resolveImageUrl(p.image_url, p.image),
      model: p.sku 
    };
  }).filter(p => {
    const searchLower = searchQuery.toLowerCase();
    const nameLower = (p.name || '').toLowerCase();
    const brandLower = (p.brand || '').toLowerCase();
    const modelLower = (p.model || '').toLowerCase();
    
    const matchesSearch = searchQuery === '' || 
                         nameLower.includes(searchLower) || 
                         brandLower.includes(searchLower) ||
                         modelLower.includes(searchLower);

    const matchesBrand = searchQuery !== '' || selectedBrand === 'Todas' || (p.brand || 'Varios') === selectedBrand;
    const matchesCategory = searchQuery !== '' || filter === 'Todas' || (
      filter === 'Armazones' ? !(p.category || 'vista').toLowerCase().includes('contacto') :
      filter === 'Lentes de Contacto' ? ((p.category || 'vista').toLowerCase().includes('contacto') && (contactUsageFilter === 'Todos' || getContactLensUsage(p.name) === contactUsageFilter)) :
      (p.category || 'vista').toLowerCase().includes(filter.toLowerCase())
    );
    
    const isOutOfStock = p.stock != null && p.stock !== '' && Number(p.stock) <= 0;
    const isPreorder = isOutOfStock;
    const matchesAvailability = availabilityFilter === 'Todos' || 
                               (availabilityFilter === 'En existencia' && !isPreorder) ||
                               (availabilityFilter === 'Sobre pedido' && isPreorder);
    
    return matchesSearch && matchesBrand && matchesCategory && matchesAvailability;
  }).sort((a, b) => {
    const aOut = a.stock != null && a.stock !== '' && Number(a.stock) <= 0;
    const bOut = b.stock != null && b.stock !== '' && Number(b.stock) <= 0;
    if (aOut && !bOut) return 1;
    if (!aOut && bOut) return -1;
    return 0; // maintain relative order otherwise
  });`;

  content = content.replace(filteredProductsRegex, replacement);

  // 4. Add UI for the availability filter
  const uiRegex = /\{filter === 'Lentes de Contacto' && \(/;
  const uiReplacement = `<div className="filter-group" style={{ margin: 0 }}>
                <CustomSelect
                  value={availabilityFilter}
                  onChange={(val) => setAvailabilityFilter(val)}
                  options={[
                    { label: 'Disponibilidad', value: 'Todos' },
                    { label: 'En existencia', value: 'En existencia' },
                    { label: 'Sobre pedido', value: 'Sobre pedido' }
                  ]}
                />
              </div>\n\n              {filter === 'Lentes de Contacto' && (`;

  content = content.replace(uiRegex, uiReplacement);

  fs.writeFileSync(path, content);
  console.log('App.tsx catalog updated');
} else {
  console.log('Catalog already updated or target missed');
}
