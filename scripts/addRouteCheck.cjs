const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const isInitialRender = useRef\(true\);\s*useEffect\(\(\) => \{\s*if \(isInitialRender\.current\) \{\s*isInitialRender\.current = false;\s*\} else \{\s*import\('\.\/lib\/analytics'\)\.then\(\(\{ trackPageView \}\) => trackPageView\(\)\);\s*\}\s*\}, \[currentPath\]\);/m;

const repl = `const isInitialRender = useRef(true);
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    } else {
      import('./lib/analytics').then(({ trackPageView }) => trackPageView());
    }
    if (currentPath !== '/micas') {
      setSelectedMicaCard(null);
    }
  }, [currentPath]);`;

content = content.replace(regex, repl);
fs.writeFileSync('src/App.tsx', content);
console.log('Done');
