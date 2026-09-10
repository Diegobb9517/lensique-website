const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes('import BlogList')) {
  app = app.replace(
    'import { useCart } from \'./context/CartContext\';',
    'import { useCart } from \'./context/CartContext\';\nimport BlogList from \'./components/BlogList\';\nimport BlogPost from \'./components/BlogPost\';\nimport { blogPosts } from \'./data/blogPosts\';'
  );
}

app = app.replace(
  '      }\n  \n    if ([\'/armazones\', \'/cotizador\', \'/lentes-de-contacto\'].includes(currentPath)) {',
  '      } else if (currentPath === \'/blog\') {\n        title = \'Blog de Salud Visual | Óptica Lensique\';\n        desc = \'Consejos, guías y verdades sobre salud visual, explicadas con honestidad por nuestros expertos. Lee nuestro blog y agenda tu cita en Zapopan.\';\n      } else if (currentPath.startsWith(\'/blog/\')) {\n        const slug = currentPath.split(\'/blog/\')[1];\n        const post = blogPosts.find(p => p.slug === slug);\n        if (post) {\n          title = post.title;\n          desc = post.metaDescription;\n        }\n      }\n  \n    if ([\'/armazones\', \'/cotizador\', \'/lentes-de-contacto\', \'/blog\'].includes(currentPath) || currentPath.startsWith(\'/blog/\')) {'
);
app = app.replace(
  '      }\r\n  \r\n    if ([\'/armazones\', \'/cotizador\', \'/lentes-de-contacto\'].includes(currentPath)) {',
  '      } else if (currentPath === \'/blog\') {\n        title = \'Blog de Salud Visual | Óptica Lensique\';\n        desc = \'Consejos, guías y verdades sobre salud visual, explicadas con honestidad por nuestros expertos. Lee nuestro blog y agenda tu cita en Zapopan.\';\n      } else if (currentPath.startsWith(\'/blog/\')) {\n        const slug = currentPath.split(\'/blog/\')[1];\n        const post = blogPosts.find(p => p.slug === slug);\n        if (post) {\n          title = post.title;\n          desc = post.metaDescription;\n        }\n      }\n  \n    if ([\'/armazones\', \'/cotizador\', \'/lentes-de-contacto\', \'/blog\'].includes(currentPath) || currentPath.startsWith(\'/blog/\')) {'
);

app = app.replace(
  '        {![\'/armazones\', \'/cotizador\', \'/lentes-de-contacto\'].includes(currentPath) && (',
  '        {currentPath === \'/blog\' && <BlogList />}\n        {currentPath.startsWith(\'/blog/\') && <BlogPost slug={currentPath.split(\'/blog/\')[1]} />}\n        {![\'/armazones\', \'/cotizador\', \'/lentes-de-contacto\', \'/blog\'].includes(currentPath) && !currentPath.startsWith(\'/blog/\') && ('
);

fs.writeFileSync('src/App.tsx', app, 'utf8');
