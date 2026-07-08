import { create } from "zustand";
export const useNotificationStore = create((set, get) => ({
    notifications: [
        {
            id: "1",
            title: "System Update",
            message: "The admin portal has been updated with new inventory tracking features.",
            type: "info",
            timestamp: new Date(),
            isRead: false,
        },
        {
            id: "2",
            title: "Low Stock Alert",
            message: "Technical Knit Sweater is running low on stock (2 units left).",
            type: "warning",
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            isRead: false,
        }
    ],
    addNotification: (n) => set((state) => ({
        notifications: [
            {
                ...n,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date(),
                isRead: false,
            },
            ...state.notifications
        ],
    })),
    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
    })),
    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
    clearNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
    })),
    clearAll: () => set({ notifications: [] }),
    unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
}));
