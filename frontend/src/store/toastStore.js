import { create } from 'zustand';

const useToastStore = create((set) => ({
    message: '',
    type: 'info', // 'success' | 'error' | 'info'
    isOpen: false,
    showToast: ({ message, type = 'info' }) => {
        set({ message, type, isOpen: true });
        setTimeout(() => {
            set({ isOpen: false });
        }, 3000);
    },
    hideToast: () => set({ isOpen: false }),
}));

export default useToastStore;
