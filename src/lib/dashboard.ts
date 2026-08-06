import api from './api';

export const dashboardApi = {
  getAccountView: async () => {
    try {
      return await api.get('/user/account/account_view');
    } catch (error) {
      console.warn('dashboardApi.getAccountView failed:', error);
      return null;
    }
  },

  getProfile: async () => {
    // Backend route: GET /user/account (same as getUserProfile)
    return await api.get('/user/account');
  },

  getBacTime: async () => {
    return await api.get('/user/general/bac_time');
  },

  getBooks: async () => {
    return await api.get('/user/general/books');
  },

  getNotifications: async (page: number = 1) => {
    return await api.get(`/user/general/notifications?page=${page}`);
  }
};
