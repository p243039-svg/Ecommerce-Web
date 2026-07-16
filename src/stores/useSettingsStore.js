import { create } from "zustand";
import { persist } from "zustand/middleware";

export const STORE_NAME = "ANTIQUE";

export const useSettingsStore = create()(persist((set) => ({
    storeName: STORE_NAME,
    contactEmail: "contact@antique.com",
    supportPhone: "+1 (555) 123-4567",
    currency: "USD",
    taxRate: "8.5",
    freeShippingThreshold: "200",
    orderFormat: "#ANT-[YYYY]-[ID]",
    requireEmailVerification: true,
    enableGuestCheckout: true,
    notifyOnNewOrder: true,
    notifyOnLowStock: true,
    updateSettings: (newSettings) => set((state) => ({
        ...state,
        ...newSettings,
        storeName: STORE_NAME, // Always locked to ANTIQUE
    })),
}), {
    name: "antique-settings-storage",
}));
