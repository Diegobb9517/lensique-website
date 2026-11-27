import { BASE_LENS_PRICE } from './constants';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export const trackPageView = () => {
  if (typeof window === 'undefined') return;
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const trackViewItem = (product: any) => {
  if (typeof window === 'undefined') return;
  const isFrame = !String(product.category || '').toLowerCase().includes('sol') && !String(product.category || '').toLowerCase().includes('contacto');
  const basePrice = product.price_incl_tax || 0;
  const viewPrice = basePrice + (isFrame ? BASE_LENS_PRICE : 0);

  const itemData = {
    item_id: product.id,
    item_name: product.name,
    item_brand: product.brand || 'Lensique',
    item_category: product.category || 'Armazón de vista',
    price: viewPrice
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

export const trackAddToCart = (product: any, value: number) => {
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
  
  const mappedItems = (items || [])
    .filter(i => i.id !== 'SHIPPING' && !i._buyerInfo)
    .map(i => ({
      item_id: String(i.id || i.product?.id || 'custom'),
      item_name: String(i.title || i.name || i.product?.name || 'Producto Lensique'),
      price: Number(i.unit_price ?? i.price ?? 0),
      quantity: Number(i.quantity ?? 1)
    }));

  const numericTotal = Number(cartTotal || 0);

  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'MXN',
      value: numericTotal,
      items: mappedItems
    });
  }
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: numericTotal,
      currency: 'MXN',
      num_items: mappedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      content_ids: mappedItems.map(i => i.item_id)
    });
  }
};

export const trackPurchase = (transactionId: string, value: number, items: any[]) => {
  if (typeof window === 'undefined') return;
  
  // Guard anti-duplicado persistente (localStorage)
  const trackedOrders = JSON.parse(window.localStorage.getItem('lensique_tracked_orders') || '[]');
  if (trackedOrders.includes(String(transactionId))) {
    return; // Ya se registró esta compra antes
  }
  
  trackedOrders.push(String(transactionId));
  window.localStorage.setItem('lensique_tracked_orders', JSON.stringify(trackedOrders));
  
  const mappedItems = (items || [])
    .filter(i => i.id !== 'SHIPPING' && !i._buyerInfo)
    .map(i => ({
      item_id: String(i.id || i.product?.id || 'custom'),
      item_name: String(i.title || i.name || i.product?.name || 'Producto Lensique'),
      price: Number(i.unit_price ?? i.price ?? 0),
      quantity: Number(i.quantity ?? 1)
    }));

  const numericValue = Number(value || 0);

  if (window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: String(transactionId),
      value: numericValue,
      currency: 'MXN',
      items: mappedItems
    });
  }
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: numericValue,
      currency: 'MXN',
      content_ids: mappedItems.map(i => i.item_id),
      content_type: 'product'
    }, { eventID: String(transactionId) });
  }
};

export const trackLead = () => {
  if (typeof window === 'undefined') return;
  
  if (window.gtag) {
    window.gtag('event', 'generate_lead', {
      currency: 'MXN',
      value: 0
    });
  }
  
  if (window.fbq) {
    window.fbq('track', 'Lead');
  }
};
