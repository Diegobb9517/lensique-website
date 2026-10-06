const fs = require('fs');
let modal = fs.readFileSync('src/components/ContactLensConfiguratorModal.tsx', 'utf8');

// Update Props interface
const propsRegex = /interface ContactLensConfiguratorModalProps \{[\s\S]*?\}/;
modal = modal.replace(propsRegex, `interface ContactLensConfiguratorModalProps {
  product: any;
  onClose: () => void;
  onComplete?: () => void;
  initialQuantityOD?: number;
  initialQuantityOS?: number;
}`);

// Update Component signature and state initialization
const compRegex = /export default function ContactLensConfiguratorModal\(\{ product, onClose, onComplete \}: ContactLensConfiguratorModalProps\) \{/;
modal = modal.replace(compRegex, `export default function ContactLensConfiguratorModal({ product, onClose, onComplete, initialQuantityOD = 1, initialQuantityOS = 0 }: ContactLensConfiguratorModalProps) {`);

// Update initial step and quantities
modal = modal.replace(/const \[step, setStep\] = useState\(1\);/, 'const [step, setStep] = useState(1);');
modal = modal.replace(/const \[quantityOD, setQuantityOD\] = useState\(1\);/, 'const [quantityOD, setQuantityOD] = useState(initialQuantityOD);');
modal = modal.replace(/const \[quantityOS, setQuantityOS\] = useState\(1\);/, 'const [quantityOS, setQuantityOS] = useState(initialQuantityOS);');

// Renumber steps and remove step 1
// We remove `case 1: ...` completely.
const case1Regex = /case 1:[\s\S]*?(?=case 2:)/;
modal = modal.replace(case1Regex, '');

// Now change `case 2:` to `case 1:`, and change `case 3:` to `case 2:`
modal = modal.replace(/case 2:/, 'case 1:');
modal = modal.replace(/case 3:/, 'case 2:');
modal = modal.replace(/Paso 2 de 3/g, 'Paso 1 de 2');
modal = modal.replace(/Paso 3 de 3/g, 'Paso 2 de 2');

// In case 1 (old case 2), the "Volver" button shouldn't exist because it's step 1 now.
// Let's remove the "Volver" button from what is now case 1:
modal = modal.replace(/<button className="contact-lens-step-indicator" onClick=\{\(\) => changeStep\(1\)\} style=\{\{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 \}\}>Volver<\/button>/g, '');

// In case 2 (old case 3), the "Volver" button should go to step 1 instead of step 2.
modal = modal.replace(/changeStep\(2\)/g, 'changeStep(1)');

// Update the "Continuar" button in what is now case 1 (old step 2)
modal = modal.replace(/changeStep\(3\)/g, 'changeStep(2)');

// Remove the "Paso 1 de 3" strings just in case
modal = modal.replace(/Paso 1 de 3/g, 'Paso 1 de 2');

fs.writeFileSync('src/components/ContactLensConfiguratorModal.tsx', modal);
console.log('Updated ContactLensConfiguratorModal.tsx');
