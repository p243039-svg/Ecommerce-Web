import { create } from "zustand";
export const useToastStore = create((set, get) => ({
    toasts: [],
    addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const duration = toast.duration || 4000;
        set({ toasts: [...get().toasts, { ...toast, id }] });
        setTimeout(() => {
            set({ toasts: get().toasts.filter((t) => t.id !== id) });
        }, duration);
    },
    removeToast: (id) => {
        set({ toasts: get().toasts.filter((t) => t.id !== id) });
    },
}));
