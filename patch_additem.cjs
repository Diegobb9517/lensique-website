const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace addItem payload
if (!content.includes('minDeliveryDays: delTime.minDays')) {
  content = content.replace(/maxDeliveryDays: delTime\.maxDays/g, 'maxDeliveryDays: delTime.maxDays,\n                          minDeliveryDays: delTime.minDays');
  fs.writeFileSync(path, content);
  console.log('App.tsx addItem updated');
}
