// src/lib/delivery.ts
// Function to add business days to a date
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
// Diego: Puedes editar estos números directamente. 
// Cada paso suma días al tiempo total.
// -----------------------------------------------------------------------------
const DELIVERY_DAYS = {
    frame: {
        instock: { min: 2, max: 3 },
        preorder: { min: 7, max: 14 },
        contact_spherical: { min: 3, max: 5 },
        contact_toric: { min: 7, max: 14 }
    },
    lens: {
        none: { min: 0, max: 0 },
        mono_basic: { min: 1, max: 2 },
        mono_complex: { min: 2, max: 3 },
        progressive_bifocal: { min: 4, max: 7 },
        photochromic: { min: 4, max: 7 },
        special: { min: 4, max: 7 }
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
    let dateRange = '';
    if (minDate.getMonth() === maxDate.getMonth()) {
        dateRange = `Llega entre el ${minDate.getDate()} y el ${maxDate.getDate()} de ${MONTHS[maxDate.getMonth()]}`;
    }
    else {
        dateRange = `Llega entre el ${formatDate(minDate)} y el ${formatDate(maxDate)}`;
    }
    let labelShort = '';
    if (maxDays <= 5) {
        labelShort = `${minDays}-${maxDays} días`;
    }
    else if (maxDays <= 14) {
        labelShort = '1-2 sem';
    }
    else {
        labelShort = '2-3 sem';
    }
    return {
        minDays,
        maxDays,
        labelShort,
        dateRange
    };
}
function calculateDeliveryTime(product, lensConfig, fulfillmentMethod) {
    var _a, _b, _c, _d, _e, _f;
    const isContactLens = String((product === null || product === void 0 ? void 0 : product.category) || '').toLowerCase().includes('contacto');
    let frameAvailability = 'instock';
    if (isContactLens) {
        const isToricOrMultifocal = String((product === null || product === void 0 ? void 0 : product.name) || '').toLowerCase().match(/tóric|toric|astigmatism|multifocal|presbicia|presbyopia/);
        frameAvailability = isToricOrMultifocal ? 'contact_toric' : 'contact_spherical';
    }
    else {
        const isOutOfStock = (product === null || product === void 0 ? void 0 : product.stock) != null && product.stock !== '' && Number(product.stock) <= 0;
        frameAvailability = isOutOfStock ? 'preorder' : 'instock';
    }
    let lensType = isContactLens ? 'none' : 'mono_basic';
    if (lensConfig) {
        const isProgressive = ((_a = lensConfig.tipo) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('progresivo')) || ((_b = lensConfig.tipo) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('bifocal')) || ((_c = lensConfig.tipo) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes('ocupacional'));
        const isPhotochromic = (_d = lensConfig.etiqueta) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes('fotocromático');
        const isSpecial = ((_e = lensConfig.tipo) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes('polar')) || ((_f = lensConfig.etiqueta) === null || _f === void 0 ? void 0 : _f.toLowerCase().includes('tinte'));
        const isComplex = lensConfig.indice === '1.67' || lensConfig.indice === '1.74' || lensConfig.indice === '1.60';
        if (isProgressive)
            lensType = 'progressive_bifocal';
        else if (isPhotochromic)
            lensType = 'photochromic';
        else if (isSpecial)
            lensType = 'special';
        else if (isComplex)
            lensType = 'mono_complex';
        else
            lensType = 'mono_basic';
    }
    let shippingMethod = 'pickup';
    if (fulfillmentMethod === 'HOME_DELIVERY') {
        // We can assume national for safety if we don't know the exact address, 
        // but in CartDrawer we'll just show 'national' as standard delivery.
        shippingMethod = 'national';
    }
    else if (fulfillmentMethod === 'STORE_PICKUP') {
        shippingMethod = 'pickup';
    }
    const est = getDeliveryEstimate(frameAvailability, lensType, shippingMethod);
    return {
        label: est.dateRange,
        subtitle: `Incluye ${lensConfig ? 'fabricación de micas' : 'preparación'}${frameAvailability === 'preorder' ? ' (sobre pedido)' : ''} · Te avisamos por WhatsApp cuando esté listo`,
        maxDays: est.maxDays,
        labelShort: est.labelShort
    };
}
