import { create } from 'zustand';
import { getNotifications, markNotificationRead } from '../api/api';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const { data } = await getNotifications();
            set({
                notifications: data,
                unreadCount: data.filter(n => !n.read).length,
                loading: false
            });
        } catch (err) {
            console.error(err);
            set({ loading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            await markNotificationRead(id);
            const updated = get().notifications.map(n =>
                n._id === id ? { ...n, read: true } : n
            );
            set({
                notifications: updated,
                unreadCount: updated.filter(n => !n.read).length
            });
        } catch (err) {
            console.error(err);
        }
    },

    addSocketNotification: (notification) => {
        set(state => {
            const newNotifications = [notification, ...state.notifications];
            return {
                notifications: newNotifications,
                unreadCount: newNotifications.filter(n => !n.read).length
            };
        });
    }
}));

export default useNotificationStore;
