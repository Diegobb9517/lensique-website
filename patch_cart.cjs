const fs = require('fs');

const path = 'src/components/CartDrawer.tsx';
let content = fs.readFileSync(path, 'utf8');

const regexToReplace = /let finalMaxDeliveryDays[\s\S]*?else maxDelStr = '3 a 4 semanas';/g;

const replacement = `let finalMaxDeliveryDays = items.length > 0 ? Math.max(...items.map(i => i.maxDeliveryDays || 0)) : 0;
  let minDelDays = items.length > 0 ? Math.max(...items.map(i => (i as any).minDeliveryDays || Math.max(0, (i.maxDeliveryDays||3)-3))) : 0;
  if (deliveryMethod === 'HOME_DELIVERY' && shippingQuote?.transitDays) {
    finalMaxDeliveryDays += shippingQuote.transitDays;
    minDelDays += Math.max(1, shippingQuote.transitDays - 2);
  } else if (deliveryMethod === 'HOME_DELIVERY') {
    finalMaxDeliveryDays += 5;
    minDelDays += 3;
  }
  
  function addBizDays(start: Date, days: number): Date {
    const d = new Date(start.getTime());
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d;
  }
  const today = new Date();
  const dMin = addBizDays(today, minDelDays);
  const dMax = addBizDays(today, finalMaxDeliveryDays);
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  
  let maxDelStr = '';
  if (dMin.getMonth() === dMax.getMonth()) {
    maxDelStr = \`Llega entre el \${dMin.getDate()} y el \${dMax.getDate()} de \${months[dMax.getMonth()]}\`;
  } else {
    maxDelStr = \`Llega entre el \${dMin.getDate()} de \${months[dMin.getMonth()]} y el \${dMax.getDate()} de \${months[dMax.getMonth()]}\`;
  }`;

if (regexToReplace.test(content)) {
  content = content.replace(regexToReplace, replacement);
  fs.writeFileSync(path, content);
  console.log('CartDrawer updated');
} else {
  console.log('Regex not found in CartDrawer');
}
