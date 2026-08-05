import api from './api';

export const quizzesApi = {
  getWeeks: async () => {
    return await api.get('/user/quizzes/weeks');
  },

  getQuizzes: async (term: number, week: number) => {
    return await api.get(`/user/quizzes/${term}/${week}`);
  }
};
