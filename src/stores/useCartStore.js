import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { SHIPPING_COST } from "@/lib/utils";
export const useCartStore = create()(persist((set, get) => ({
    items: [],
    addItem: (product, size, color, quantity = 1) => {
        // Stock validation
        if (product.stock_quantity <= 0)
            return false;
        const items = get().items;
        const existingItem = items.find((item) => item.productId === product.id &&
            item.size === size &&
            item.color === color);
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stock_quantity)
                return false;
            set({
                items: items.map((item) => item.id === existingItem.id
                    ? { ...item, quantity: newQuantity }
                    : item),
            });
        }
        else {
            if (quantity > product.stock_quantity)
                return false;
            const newItem = {
                id: `cart-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                productId: product.id,
                product,
                quantity,
                size,
                color,
            };
            set({ items: [...items, newItem] });
        }
        return true;
    },
    removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
    },
    updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(itemId);
            return;
        }
        const item = get().items.find((i) => i.id === itemId);
        if (!item)
            return;
        if (quantity > item.product.stock_quantity)
            return;
        set({
            items: get().items.map((i) => i.id === itemId ? { ...i, quantity } : i),
        });
    },
    clearCart: () => set({ items: [] }),
    getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    getSubtotal: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    getShipping: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0)
            return 0;
        const settings = useSettingsStore.getState();
        const threshold = parseFloat(settings.freeShippingThreshold) || 100;
        return subtotal >= threshold ? 0 : SHIPPING_COST;
    },
    getTax: () => {
        const settings = useSettingsStore.getState();
        const taxRate = (parseFloat(settings.taxRate) || 8) / 100;
        return get().getSubtotal() * taxRate;
    },
    getTotal: () => get().getSubtotal() + get().getShipping() + get().getTax(),
}), {
    name: "luxe-cart",
}));
