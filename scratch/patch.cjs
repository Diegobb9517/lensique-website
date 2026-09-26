const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `    return matchesSearch && matchesBrand && matchesCategory;
  });`;

const replace1 = `    const isContactLens = String(p.category || 'vista').toLowerCase().includes('contacto');
    const isOutOfStock = p.stock != null && p.stock !== '' && Number(p.stock) <= 0;
    const matchesAvailability = availabilityFilter === 'Todos' || isContactLens || !isOutOfStock;
    
    return matchesSearch && matchesBrand && matchesCategory && matchesAvailability;
  }).sort((a, b) => {
    const aIsContact = String(a.category || 'vista').toLowerCase().includes('contacto');
    const bIsContact = String(b.category || 'vista').toLowerCase().includes('contacto');
    
    if (!aIsContact && !bIsContact) {
      const aOutOfStock = a.stock != null && a.stock !== '' && Number(a.stock) <= 0;
      const bOutOfStock = b.stock != null && b.stock !== '' && Number(b.stock) <= 0;
      if (!aOutOfStock && bOutOfStock) return -1;
      if (aOutOfStock && !bOutOfStock) return 1;
    }
    return 0;
  });`;

code = code.replace(target1, replace1);

const target2 = `              <div className="filter-group" style={{ margin: 0 }}>
                <CustomSelect
                  value={availabilityFilter}
                  onChange={(val) => setAvailabilityFilter(val)}
                  options={[
                    { label: 'Disponibilidad', value: 'Todos' },
                    { label: 'En existencia', value: 'En existencia' },
                  ]}
                />
              </div>`;

const replace2 = `            {filter === 'Armazones' && (
              <div className="filter-group" style={{ margin: 0 }}>
                <CustomSelect
                  value={availabilityFilter}
                  onChange={(val) => {
                    setAvailabilityFilter(val);
                    const url = new URL(window.location.href);
                    if (val === 'En existencia') {
                      url.searchParams.set('disponibilidad', 'existencia');
                    } else {
                      url.searchParams.delete('disponibilidad');
                    }
                    window.history.pushState({}, '', url);
                  }}
                  options={[
                    { label: 'Disponibilidad', value: 'Todos' },
                    { label: 'En existencia', value: 'En existencia' },
                  ]}
                />
              </div>
            )}`;

code = code.replace(target2, replace2);

const target3 = `  const [catalogInitialFilter, setCatalogInitialFilter] = useState(() => {
    if (window.location.pathname === '/armazones') return 'Armazones';
    if (window.location.pathname === '/lentes-de-contacto') return 'Lentes de Contacto';
    return 'Todas';
  });`;

const replace3 = `  const [catalogInitialFilter, setCatalogInitialFilter] = useState(() => {
    if (window.location.pathname === '/armazones') return 'Armazones';
    if (window.location.pathname === '/lentes-de-contacto') return 'Lentes de Contacto';
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('disponibilidad') === 'existencia') return 'Armazones';
    return 'Todas';
  });`;

code = code.replace(target3, replace3);

fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log('App.tsx patched.');
