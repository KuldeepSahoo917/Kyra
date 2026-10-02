import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
    withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Redirect to /login on 401
API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const searchUsers = (search) => API.get(`/auth/users?search=${search}`);

// Projects
export const getProjects = () => API.get('/projects');
export const getProjectById = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post('/projects', data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const addMember = (projectId, data) => API.post(`/projects/${projectId}/members`, data);
export const removeMember = (projectId, userId) => API.delete(`/projects/${projectId}/members/${userId}`);

// Tasks
export const getTasks = (projectId) => API.get(`/tasks?projectId=${projectId}`);
export const getTaskById = (id) => API.get(`/tasks/${id}`);
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const uploadAttachment = (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post(`/tasks/${taskId}/attachments`, formData);
};
export const deleteAttachment = (taskId, attachmentId) =>
    API.delete(`/tasks/${taskId}/attachments/${attachmentId}`);

// Comments
export const getComments = (taskId) => API.get(`/comments?taskId=${taskId}`);
export const addComment = (data) => API.post('/comments', data);
export const deleteComment = (id) => API.delete(`/comments/${id}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');

export default API;
