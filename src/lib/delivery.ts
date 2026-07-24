export function calculateDeliveryTime(product: any, lensConfig?: any) {
  // 1. Días del armazón
  const isOutOfStock = product.stock != null && product.stock !== '' && Number(product.stock) <= 0;
  // Si está en stock, consideramos máximo 3 días. Si está agotado (sobre pedido), máximo 14 días.
  const frameDays = isOutOfStock ? 14 : 3;

  // 2. Días de la mica
  let lensDays = 0;
  if (lensConfig) {
    const isSpecial = 
      lensConfig.tipo?.toLowerCase().includes('progresivo') || 
      lensConfig.tipo?.toLowerCase().includes('bifocal') || 
      lensConfig.tipo?.toLowerCase().includes('ocupacional') ||
      lensConfig.etiqueta?.toLowerCase().includes('fotocromático'); // O algún otro trato especial si quisieras
    
    // Si tiene micas, al menos tarda 2 días. Si son especiales, hasta 5.
    lensDays = isSpecial ? 5 : 2;
  }

  // 3. Total
  const totalDays = frameDays + lensDays;

  // 4. Mapeo a rangos
  let label = '';
  if (totalDays <= 5) {
    label = '3 a 5 días hábiles';
  } else if (totalDays <= 12) {
    label = '1 a 2 semanas';
  } else if (totalDays <= 21) {
    label = '2 a 3 semanas';
  } else {
    label = '3 a 4 semanas';
  }

  return {
    label,
    subtitle: isOutOfStock && lensDays > 0 
      ? 'Armazón sobre pedido + elaboración de tus micas. Sujeto a tiempos de laboratorio.'
      : isOutOfStock 
        ? 'Armazón sobre pedido.'
        : lensDays > 0 
          ? 'Elaboración de tus micas según graduación.'
          : 'Armazón en stock, listo pronto.',
    maxDays: totalDays
  };
}
