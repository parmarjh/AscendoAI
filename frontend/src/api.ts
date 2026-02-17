import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    login: (data: any) => api.post('/auth/login', data),
    register: (data: any) => api.post('/auth/register', data),
};

export const boards = {
    list: () => api.get('/boards'),
    create: (data: any) => api.post('/boards', data),
    get: (id: number) => api.get(`/boards/${id}`),
    delete: (id: number) => api.delete(`/boards/${id}`),
};

export const lists = {
    create: (data: any) => api.post('/lists', data),
    update: (id: number, data: any) => api.put(`/lists/${id}`, data),
    delete: (id: number) => api.delete(`/lists/${id}`),
};

export const cards = {
    create: (data: any) => api.post('/cards', data),
    move: (id: number, data: { new_list_id: number; new_position: number }) =>
        api.put(`/cards/${id}/move`, data),
    delete: (id: number) => api.delete(`/cards/${id}`),
};

export default api;
