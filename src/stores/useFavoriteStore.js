import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useFavoriteStore = create()(persist((set, get) => ({
    favorites: [],
    toggleFavorite: (product) => {
        const currentFavorites = get().favorites;
        const exists = currentFavorites.some((p) => p.id === product.id);
        if (exists) {
            set({
                favorites: currentFavorites.filter((p) => p.id !== product.id),
            });
        }
        else {
            set({
                favorites: [...currentFavorites, product],
            });
        }
    },
    isFavorite: (productId) => {
        return get().favorites.some((p) => p.id === productId);
    },
    clearFavorites: () => set({ favorites: [] }),
}), {
    name: "luxe-favorites",
}));
