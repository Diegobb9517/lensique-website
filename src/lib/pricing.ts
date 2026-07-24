/**
 * Si cambias esto, cambia también el archivo espejo en lensique-web / lensique-pos.
 * 
 * Fórmula: precioWeb = (precioTienda + 4.64) / (1 - 0.040484)
 * Nota: El cargo fijo de $4.64 de MercadoPago se absorbe por ítem 
 * (en carritos de 2+ ítems o configuraciones separadas se cobra el fijo de más, dirección segura aceptada).
 */
export function getOnlinePrice(storePrice: number): number {
  if (!storePrice || storePrice <= 0) return 0;
  
  const rawPrice = (storePrice + 4.64) / (1 - 0.040484);
  
  if (rawPrice < 2000) {
    return Math.ceil(rawPrice / 10) * 10;
  } else {
    return Math.ceil(rawPrice / 50) * 50;
  }
}
