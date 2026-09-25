const https = require('https');

function ping() {
  https.get('https://lensique-pos.onrender.com/api/website/content', (res) => {
    console.log('[' + new Date().toISOString() + '] Ping status:', res.statusCode);
  }).on('error', (e) => {
    console.error('[' + new Date().toISOString() + '] Ping error:', e);
  });
}

console.log('Starting ping daemon...');
ping(); // initial ping
setInterval(ping, 5 * 60 * 1000);
