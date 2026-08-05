import api from './api';

export const generalApi = {
  getTeachers: async () => {
    return await api.get('/general/teachers');
  },
  
  getBooks: async () => {
    return await api.get('/general/books');
  },
  
  getAppReviews: async (type: 'teacher' | 'book', id: number) => {
    return await api.get(`/general/app_reviews/${type}/${id}`);
  }
};
