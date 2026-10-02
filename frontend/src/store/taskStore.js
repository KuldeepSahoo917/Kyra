import { create } from 'zustand';
import { getTasks, createTask, updateTask, deleteTask } from '../api/api';

const useTaskStore = create((set, get) => ({
    tasks: [],
    selectedTask: null,
    loading: false,
    error: null,

    fetchTasks: async (projectId) => {
        set({ loading: true, error: null });
        try {
            const { data } = await getTasks(projectId);
            set({ tasks: data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch tasks', loading: false });
        }
    },

    setSelectedTask: (task) => set({ selectedTask: task }),

    createTask: async (taskData) => {
        try {
            const { data } = await createTask(taskData);
            set((state) => ({ tasks: [...state.tasks, data] }));
            return data;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to create task' });
            throw err;
        }
    },

    updateTask: async (id, updates) => {
        try {
            const { data } = await updateTask(id, updates);
            set((state) => ({ tasks: state.tasks.map((t) => (t._id === id ? data : t)) }));
            if (get().selectedTask?._id === id) set({ selectedTask: data });
            return data;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to update task' });
            throw err;
        }
    },

    deleteTask: async (id) => {
        try {
            await deleteTask(id);
            set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id), selectedTask: null }));
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to delete task' });
        }
    },

    // Called from socket real-time events
    socketTaskCreated: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
    socketTaskUpdated: (task) =>
        set((state) => ({ tasks: state.tasks.map((t) => (t._id === task._id ? task : t)) })),
    socketTaskDeleted: ({ taskId }) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t._id !== taskId) })),
    socketTaskMoved: ({ taskId, status, order }) =>
        set((state) => ({
            tasks: state.tasks.map((t) => (t._id === taskId ? { ...t, status, order } : t)),
        })),
}));

export default useTaskStore;
