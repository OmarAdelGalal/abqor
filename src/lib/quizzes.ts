import api from './api';

export const quizzesApi = {
  getWeeks: async () => {
    return await api.get('/user/quizzes/weeks');
  },

  getQuizzes: async (term: number, week: number) => {
    return await api.get(`/user/quizzes/${term}/${week}`);
  },

  getQuizDetails: async (quizId: number | string) => {
    // Attempting to fetch specific quiz details.
    return await api.get(`/user/quizzes/${quizId}`);
  },

  submitQuizAnswer: async (quizId: number | string, data: { question_id: number, answer_id: number }) => {
    return await api.post(`/user/quizzes/${quizId}/answer`, data);
  },
  
  finishQuiz: async (quizId: number | string) => {
    return await api.post(`/user/quizzes/finish_lesson/${quizId}`);
  },

  incrementHealth: async () => {
    return await api.post(`/user/quizzes/increment_health`);
  },

  decrementHealth: async () => {
    return await api.post(`/user/quizzes/decrement_health`);
  }
};
