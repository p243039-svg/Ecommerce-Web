import { create } from "zustand";
const initialState = {
    category: "",
    priceRange: [0, 10000],
    brands: [],
    sizes: [],
    colors: [],
    rating: 0,
    sortBy: "newest",
    search: "",
};
export const useFilterStore = create((set, get) => ({
    ...initialState,
    setCategory: (category) => set({ category }),
    setPriceRange: (priceRange) => set({ priceRange }),
    toggleBrand: (brand) => {
        const brands = get().brands;
        set({
            brands: brands.includes(brand)
                ? brands.filter((b) => b !== brand)
                : [...brands, brand],
        });
    },
    toggleSize: (size) => {
        const sizes = get().sizes;
        set({
            sizes: sizes.includes(size)
                ? sizes.filter((s) => s !== size)
                : [...sizes, size],
        });
    },
    toggleColor: (color) => {
        const colors = get().colors;
        set({
            colors: colors.includes(color)
                ? colors.filter((c) => c !== color)
                : [...colors, color],
        });
    },
    setRating: (rating) => set({ rating }),
    setSortBy: (sortBy) => set({ sortBy }),
    setSearch: (search) => set({ search }),
    resetFilters: () => set(initialState),
}));
