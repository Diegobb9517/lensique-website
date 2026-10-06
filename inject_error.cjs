const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Inject the error
const injected = content.replace('function App() {', 'function App() {\n  console.log(variableQueNoExiste);');
fs.writeFileSync(path, injected);
