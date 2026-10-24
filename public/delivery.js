// src/lib/delivery.ts
// Function to add business days to a date (Mon-Fri)
function addBusinessDays(startDate, daysToAdd) {
    const date = new Date(startDate.getTime());
    let daysAdded = 0;
    while (daysAdded < daysToAdd) {
        date.setDate(date.getDate() + 1);
        const day = date.getDay();
        // Skip weekends (0 is Sunday, 6 is Saturday)
        if (day !== 0 && day !== 6) {
            daysAdded++;
        }
    }
    return date;
}
const MONTHS = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];
function formatDate(date) {
    return `${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}
// -----------------------------------------------------------------------------
// TABLA DE TIEMPOS DE ENTREGA (DÍAS HÁBILES)
// Sincronizada con la tabla maestra de lensique-pos
// -----------------------------------------------------------------------------
const DELIVERY_DAYS = {
    frame: {
        instock: { min: 1, max: 1 },
        preorder: { min: 10, max: 14 },
        contact_spherical: { min: 3, max: 3 },
        contact_toric: { min: 8, max: 15 },
        contact_xr: { min: 40, max: 60 },
        contact_lumilent: { min: 8, max: 15 }
    },
    lens: {
        none: { min: 0, max: 0 },
        mono_basic: { min: 3, max: 4 }, // LENS_LAB_LOW (esfera <= 4, cil <= 2)
        mono_complex: { min: 5, max: 8 }, // LENS_LAB_HIGH
        zeiss: { min: 5, max: 7 }, // LENS_ZEISS
        progressive_bifocal: { min: 5, max: 8 },
        photochromic: { min: 5, max: 8 },
        special: { min: 5, max: 8 }
    },
    shipping: {
        pickup: { min: 0, max: 0 },
        zmg: { min: 1, max: 2 },
        national: { min: 3, max: 5 }
    }
};
// -----------------------------------------------------------------------------
function getDeliveryEstimate(frameAvailability, lensType = 'none', shippingMethod = 'pickup') {
    let minDays = 0;
    let maxDays = 0;
    // 1. Frame / Contacts time
    const fTime = DELIVERY_DAYS.frame[frameAvailability] || { min: 0, max: 0 };
    minDays += fTime.min;
    maxDays += fTime.max;
    // 2. Lens manufacturing time
    const lTime = DELIVERY_DAYS.lens[lensType] || { min: 0, max: 0 };
    minDays += lTime.min;
    maxDays += lTime.max;
    // 3. Shipping time
    const sTime = DELIVERY_DAYS.shipping[shippingMethod] || { min: 0, max: 0 };
    minDays += sTime.min;
    maxDays += sTime.max;
    const today = new Date();
    const minDate = addBusinessDays(today, minDays);
    const maxDate = addBusinessDays(today, maxDays);
    const isXr = frameAvailability === 'contact_xr';
    let dateRange = '';
    if (isXr) {
        dateRange = `Llega entre 8 y 12 semanas (a partir del ${formatDate(today)})`;
    }
    else if (minDate.getMonth() === maxDate.getMonth()) {
        dateRange = `Llega entre el ${minDate.getDate()} y el ${maxDate.getDate()} de ${MONTHS[maxDate.getMonth()]}`;
    }
    else {
        dateRange = `Llega entre el ${formatDate(minDate)} y el ${formatDate(maxDate)}`;
    }
    let labelShort = '';
    if (isXr) {
        labelShort = '8-12 sem';
    }
    else if (minDays === maxDays) {
        labelShort = `${maxDays} ${maxDays === 1 ? 'día hábil' : 'días hábiles'}`;
    }
    else {
        labelShort = `${minDays}-${maxDays} días hábiles`;
    }
    return {
        minDays,
        maxDays,
        labelShort,
        dateRange,
        isWeeks: isXr
    };
}
function calculateDeliveryTime(product, lensConfig, fulfillmentMethod) {
    const isContactLens = String((product === null || product === void 0 ? void 0 : product.category) || '').toLowerCase().includes('contacto');
    let frameAvailability = 'instock';
    if (isContactLens) {
        const textToSearch = [
            product === null || product === void 0 ? void 0 : product.name,
            product === null || product === void 0 ? void 0 : product.description,
            product === null || product === void 0 ? void 0 : product.sku,
            product === null || product === void 0 ? void 0 : product.brand
        ].filter(Boolean).join(' ').toLowerCase();
        if (textToSearch.includes('lumilent') || textToSearch.includes('confiablex')) {
            frameAvailability = 'contact_lumilent';
        }
        else {
            const hasXr = textToSearch.includes('xr');
            const hasToric = textToSearch.match(/t[oó]ric|astigmat/);
            const hasMulti = textToSearch.match(/multifocal|presbicia|presbyopia/);
            if (hasXr || (hasToric && hasMulti)) {
                frameAvailability = 'contact_xr';
            }
            else if (hasToric || hasMulti) {
                frameAvailability = 'contact_toric';
            }
            else {
                frameAvailability = 'contact_spherical';
            }
        }
    }
    else {
        const isOutOfStock = (product === null || product === void 0 ? void 0 : product.stock) != null && product.stock !== '' && Number(product.stock) <= 0;
        frameAvailability = isOutOfStock ? 'preorder' : 'instock';
    }
    let lensType = isContactLens ? 'none' : 'mono_basic';
    if (lensConfig && !isContactLens) {
        const searchTarget = [
            lensConfig.tipo,
            lensConfig.etiqueta,
            lensConfig.proveedor,
            lensConfig.ordenZEISS,
            lensConfig.productoZEISS
        ].filter(Boolean).join(' ').toLowerCase();
        const isZeiss = Boolean(lensConfig.proveedor === 'ZEISS' ||
            lensConfig.isZeiss ||
            searchTarget.includes('zeiss') ||
            searchTarget.includes('smartlife') ||
            searchTarget.includes('clearview'));
        if (isZeiss) {
            lensType = 'zeiss';
        }
        else {
            const isProgressive = searchTarget.includes('progresivo') || searchTarget.includes('bifocal') || searchTarget.includes('ocupacional');
            const isPhotochromic = searchTarget.includes('foto') || searchTarget.includes('transitions');
            const isSpecial = searchTarget.includes('polar') || searchTarget.includes('tinte');
            const isComplex = lensConfig.indice === '1.67' || lensConfig.indice === '1.74' || lensConfig.indice === '1.60';
            if (isProgressive || isPhotochromic || isSpecial || isComplex) {
                lensType = 'mono_complex';
            }
            else {
                lensType = 'mono_basic';
            }
        }
    }
    let shippingMethod = 'pickup';
    if (fulfillmentMethod === 'HOME_DELIVERY') {
        shippingMethod = 'national';
    }
    else if (fulfillmentMethod === 'STORE_PICKUP') {
        shippingMethod = 'pickup';
    }
    const est = getDeliveryEstimate(frameAvailability, lensType, shippingMethod);
    return {
        label: est.dateRange,
        subtitle: `Incluye ${lensConfig ? 'fabricación de micas' : 'preparación'}${frameAvailability === 'preorder' ? ' (sobre pedido)' : ''} · Te avisamos por WhatsApp cuando esté listo`,
        minDays: est.minDays,
        maxDays: est.maxDays,
        labelShort: est.labelShort,
        isWeeks: est.isWeeks
    };
}
