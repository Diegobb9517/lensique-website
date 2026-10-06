const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="wp-section-header" style=\{\{ marginBottom: '48px'[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/;

const newHeader = `<div className="wp-section-header" style={{ marginBottom: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 'var(--max-width)', margin: '0 auto 48px' }}>
            <h2 className="wp-section-title" style={{ margin: 0, textAlign: 'center', fontFamily: '"Playfair Display", serif' }}>Tecnologías de visión</h2>
          </div>`;

appTsx = appTsx.replace(regex, newHeader);

fs.writeFileSync('src/App.tsx', appTsx);
console.log('done JSX fix');
