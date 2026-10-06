const { FRAME_GRADUACION_OPTIONS, PHOTOCHROMIC_OPTIONS } = require('./src/lib/configuratorConstants');
// Ah wait, configuratorConstants is a TS file. I'll just copy the math.

function getOnlinePrice(storePrice) {
  if (!storePrice || storePrice <= 0) return 0;
  const rawPrice = (storePrice + 4.64) / (1 - 0.040484);
  if (rawPrice < 2000) {
    return Math.ceil(rawPrice / 10) * 10;
  } else {
    return Math.ceil(rawPrice / 50) * 50;
  }
}

const formatPrice = (price) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(price);

console.log("Bifocales:", formatPrice(getOnlinePrice(1034.48)));
console.log("Progresivos:", formatPrice(getOnlinePrice(1896.55)));
console.log("Fotocromático:", formatPrice(getOnlinePrice(1637.93)));
