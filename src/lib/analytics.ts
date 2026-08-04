declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export const trackViewItem = (product: any) => {
  if (typeof window === 'undefined') return;
  const itemData = {
    item_id: product.id,
    item_name: product.name,
    item_brand: product.brand || 'Lensique',
    item_category: product.category || 'Armazón de vista',
    price: product.price_incl_tax || 1200
  };

  // GA4
  if (window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'MXN',
      value: itemData.price,
      items: [itemData]
    });
  }
  
  // Meta Pixel
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [itemData.item_id],
      content_name: itemData.item_name,
      content_type: 'product',
      value: itemData.price,
      currency: 'MXN'
    });
  }
};

export const trackAddToCart = (product: any, value: number = 1200) => {
  if (typeof window === 'undefined') return;
  
  const itemData = {
    item_id: product.id,
    item_name: product.name,
    price: value
  };

  if (window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'MXN',
      value: value,
      items: [itemData]
    });
  }
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [itemData.item_id],
      content_name: itemData.item_name,
      content_type: 'product',
      value: value,
      currency: 'MXN'
    });
  }
};

export const trackBeginCheckout = (cartTotal: number, items: any[]) => {
  if (typeof window === 'undefined') return;
  
  const mappedItems = items.map(i => ({
    item_id: i.id || i.product?.id || 'custom',
    item_name: i.name || i.product?.name || 'Micas',
    price: i.price
  }));

  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'MXN',
      value: cartTotal,
      items: mappedItems
    });
  }
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: cartTotal,
      currency: 'MXN',
      num_items: items.length
    });
  }
};

let purchaseTracked = false;

export const trackPurchase = (transactionId: string, value: number, items: any[]) => {
  if (typeof window === 'undefined' || purchaseTracked) return;
  purchaseTracked = true; // Guard anti-duplicado en memoria
  
  const mappedItems = items.map(i => ({
    item_id: i.id || i.product?.id || 'custom',
    item_name: i.name || i.product?.name || 'Lente',
    price: i.price
  }));

  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'MXN',
      items: mappedItems
    });
  }
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: value,
      currency: 'MXN',
      content_ids: mappedItems.map(i => i.item_id),
      content_type: 'product'
    });
  }
};
