import api from './api';

export const dashboardApi = {
  getAccountView: async () => {
    return await api.get('/user/account/account_view');
  },

  getProfile: async () => {
    return await api.get('/user/account/profile');
  },

  getBacTime: async () => {
    return await api.get('/user/general/bac_time');
  },

  getBooks: async () => {
    return await api.get('/user/general/books');
  }
};
