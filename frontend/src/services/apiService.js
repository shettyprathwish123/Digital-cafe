import api from './api';

// Auth API
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Menu API
export const menuAPI = {
  getAllItems: async () => {
    const response = await api.get('/menu');
    return response.data;
  },
  
  getItem: async (id) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },
  
  createItem: async (data) => {
    const response = await api.post('/menu', data);
    return response.data;
  },
  
  updateItem: async (id, data) => {
    const response = await api.put(`/menu/${id}`, data);
    return response.data;
  },
  
  deleteItem: async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },
};

// Order API
export const orderAPI = {
  createOrder: async (data) => {
    const response = await api.post('/orders', data);
    return response.data;
  },
  
  getAllOrders: async (status) => {
    const response = await api.get('/orders', { params: { status } });
    return response.data;
  },
  
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  
  getOrderByNumber: async (orderNumber) => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
  },
  
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  deleteOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  getQueuePosition: async (id) => {
    const response = await api.get(`/orders/queue/position/${id}`);
    return response.data;
  },
};
