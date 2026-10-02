import { create } from 'zustand';
import { getProjects, createProject, deleteProject, updateProject, addMember, removeMember } from '../api/api';

const useProjectStore = create((set, get) => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null,

    fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
            const { data } = await getProjects();
            set({ projects: data, loading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch projects', loading: false });
        }
    },

    setCurrentProject: (project) => set({ currentProject: project }),

    createProject: async (projectData) => {
        set({ loading: true, error: null });
        try {
            const { data } = await createProject(projectData);
            set((state) => ({ projects: [data, ...state.projects], loading: false }));
            return data;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to create project', loading: false });
            throw err;
        }
    },

    deleteProject: async (id) => {
        try {
            await deleteProject(id);
            set((state) => ({ projects: state.projects.filter((p) => p._id !== id) }));
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to delete project' });
        }
    },

    addMember: async (projectId, userId, role) => {
        try {
            const { data } = await addMember(projectId, { userId, role });
            set({ currentProject: data });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to add member' });
            throw err;
        }
    },

    removeMember: async (projectId, userId) => {
        try {
            await removeMember(projectId, userId);
            set((state) => ({
                currentProject: state.currentProject
                    ? { ...state.currentProject, members: state.currentProject.members.filter((m) => m.user._id !== userId) }
                    : null,
            }));
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to remove member' });
        }
    },
}));

export default useProjectStore;
