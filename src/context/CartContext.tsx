import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackAddToCart } from '../lib/analytics';

export interface CartItem {
  id: string; // Unique ID for the cart line item (e.g., timestamp or uuid)
  type: 'frame_with_lenses' | 'product' | 'care_kit';
  concept_type?: string;
  title: string;
  quantity: number;
  unit_price: number;
  product?: any; // The base product (frame or contact lens)
  lensConfig?: any; // If applicable
  image?: string;
  estimatedDeliveryStr?: string;
  estimatedDeliverySubtitle?: string;
  maxDeliveryDays?: number;
  minDeliveryDays?: number;
  isCareKit?: boolean;
}

export function isKitItem(item: CartItem | any): boolean {
  if (!item) return false;
  if (item.isCareKit) return true;
  if (item.type === 'care_kit' || item.concept_type === 'ACCESSORY') return true;
  if (item.product?.id && (String(item.product.id) === '1338' || String(item.product.id) === '1446' || item.product.is_kit)) return true;
  const title = (item.title || item.product?.name || '').toLowerCase();
  if (title.includes('kit de cuidado') || title.includes('solución + estuche') || title.includes('solucion + estuche')) {
    return true;
  }
  return false;
}

export function isContactLensItem(item: CartItem | any): boolean {
  if (!item) return false;
  if (isKitItem(item)) return false;
  return item.type === 'contact_lens' ||
         item.lensConfig?.prescriptionOD !== undefined ||
         item.lensConfig?.quantityOD !== undefined ||
         Boolean(item.product?.category && String(item.product.category).toLowerCase().includes('contacto')) ||
         (item.title || '').toLowerCase().includes('contacto') ||
         Boolean(item.product?.base_curve) ||
         Boolean(item.lensConfig?.tab);
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemPrice: (id: string, newUnitPrice: number) => void;
  setCartItems: (newItems: CartItem[]) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Auto-clear cart on payment success page
    if (window.location.pathname.includes('/pago/exito')) {
      localStorage.removeItem('lensique_cart');
      return [];
    }
    try {
      const saved = localStorage.getItem('lensique_cart');
      if (!saved) return [];
      const parsed: CartItem[] = JSON.parse(saved);
      const hasContactLens = parsed.some(isContactLensItem);
      return hasContactLens ? parsed : parsed.filter(i => !isKitItem(i));
    } catch (e) {
      return [];
    }
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('lensique_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    if (item.product) {
      trackAddToCart(item.product, item.unit_price * item.quantity);
    }
    setItems(prev => {
      // Regla de negocio: El kit de cuidado no se puede duplicar y su cantidad es fija en 1
      if (isKitItem(item)) {
        const alreadyHasKit = prev.some(isKitItem);
        if (alreadyHasKit) {
          return prev;
        }
        return [...prev, { ...item, quantity: 1, isCareKit: true, id: 'care-kit-' + Date.now() }];
      }

      const key = (it: Omit<CartItem, 'id'>) => `${it.product?.id || ''}|${it.lensConfig?.etiqueta || ''}|${it.lensConfig?.indice || ''}|${it.lensConfig?.tipoFab || ''}`;
      const itemKey = key(item);
      
      const existingIndex = prev.findIndex(it => {
        // Only deduplicate if it has a product ID
        if (!it.product?.id || !item.product?.id) return false;
        return key(it) === itemKey;
      });

      if (existingIndex >= 0) {
        const newItems = [...prev];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + (item.quantity || 1)
        };
        return newItems;
      }
      
      return [...prev, { ...item, id: Date.now().toString() + Math.random().toString(36).substring(2, 7) }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const remaining = prev.filter(i => i.id !== id);
      // Si el cliente elimina todos los lentes de contacto, el kit se elimina solo
      const hasContactLens = remaining.some(isContactLensItem);
      if (!hasContactLens) {
        return remaining.filter(i => !isKitItem(i));
      }
      return remaining;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev => {
      const updated = prev.map(i => {
        if (i.id === id) {
          // Cantidad del kit no editable (fija en 1)
          if (isKitItem(i)) return { ...i, quantity: 1 };
          return { ...i, quantity };
        }
        return i;
      });
      const hasContactLens = updated.some(isContactLensItem);
      if (!hasContactLens) {
        return updated.filter(i => !isKitItem(i));
      }
      return updated;
    });
  };

  const updateItemPrice = (id: string, newUnitPrice: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, unit_price: newUnitPrice } : i));
  };

  const setCartItems = (newItems: CartItem[]) => {
    const hasContactLens = newItems.some(isContactLensItem);
    const cleaned = hasContactLens ? newItems : newItems.filter(i => !isKitItem(i));
    setItems(cleaned);
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('lensique_cart');
  };

  const total = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, updateItemPrice, setCartItems, clearCart, isCartOpen, setIsCartOpen, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
