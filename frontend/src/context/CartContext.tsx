import React, { createContext, useContext, useState } from 'react';
import { MenuItem } from '../models/menu';
import { Canteen } from '../models/campus';
import { OrderType } from '../models/order';
import { PickupSlot } from '../models/settings';

export interface CartItem {
  item: MenuItem;
  quantity: number;
  subtotal: number;
}

interface CartContextType {
  items: CartItem[];
  canteen: Canteen | null;
  orderType: OrderType;
  selectedSlot: PickupSlot | null;
  isPolicyAccepted: boolean;
  policyAcceptedAt: string | null;
  subtotal: number;
  total: number;
  itemCount: number;
  addToCart: (item: MenuItem, targetCanteen: Canteen) => { success: boolean; conflict?: boolean };
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  setOrderType: (type: OrderType) => void;
  setSelectedSlot: (slot: PickupSlot | null) => void;
  setPolicyAccepted: (accepted: boolean) => void;
  replaceCartWithItem: (item: MenuItem, targetCanteen: Canteen) => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('instant');
  const [selectedSlot, setSelectedSlot] = useState<PickupSlot | null>(null);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);
  const [policyAcceptedAt, setPolicyAcceptedAt] = useState<string | null>(null);

  const subtotal = items.reduce((sum, ci) => sum + ci.subtotal, 0);
  const total = subtotal;
  const itemCount = items.reduce((sum, ci) => sum + ci.quantity, 0);

  const addToCart = (item: MenuItem, targetCanteen: Canteen): { success: boolean; conflict?: boolean } => {
    // If cart has items from another canteen, enforce single canteen restriction
    if (canteen && canteen.canteenId !== targetCanteen.canteenId && items.length > 0) {
      return { success: false, conflict: true };
    }

    if (!canteen) {
      setCanteen(targetCanteen);
    }

    setItems((prev) => {
      const existing = prev.find((ci) => ci.item.itemId === item.itemId);
      if (existing) {
        return prev.map((ci) =>
          ci.item.itemId === item.itemId
            ? { ...ci, quantity: ci.quantity + 1, subtotal: (ci.quantity + 1) * item.price }
            : ci
        );
      }
      return [...prev, { item, quantity: 1, subtotal: item.price }];
    });

    return { success: true };
  };

  const replaceCartWithItem = (item: MenuItem, targetCanteen: Canteen) => {
    setCanteen(targetCanteen);
    setItems([{ item, quantity: 1, subtotal: item.price }]);
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => {
      const next = prev.filter((ci) => ci.item.itemId !== itemId);
      if (next.length === 0) {
        setCanteen(null);
      }
      return next;
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) => {
      const next = prev
        .map((ci) => {
          if (ci.item.itemId === itemId) {
            const newQty = ci.quantity + delta;
            if (newQty <= 0) return null;
            return { ...ci, quantity: newQty, subtotal: newQty * ci.item.price };
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];

      if (next.length === 0) {
        setCanteen(null);
      }
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    setCanteen(null);
    setSelectedSlot(null);
    setIsPolicyAccepted(false);
    setPolicyAcceptedAt(null);
  };

  const handlePolicyAcceptance = (accepted: boolean) => {
    setIsPolicyAccepted(accepted);
    setPolicyAcceptedAt(accepted ? new Date().toISOString() : null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        canteen,
        orderType,
        selectedSlot,
        isPolicyAccepted,
        policyAcceptedAt,
        subtotal,
        total,
        itemCount,
        addToCart,
        replaceCartWithItem,
        removeFromCart,
        updateQuantity,
        clearCart,
        setOrderType,
        setSelectedSlot,
        setPolicyAccepted: handlePolicyAcceptance,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

