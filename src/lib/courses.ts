import api from './api';

let handshakePromise: Promise<any> | null = null;

export const coursesApi = {
  getAllCourses: async () => {
    return await api.get('/user/courses');
  },

  getSubjects: async () => {
    return await api.get('/user/general/teachers_by_subject');
  },

  getMyCourses: async (page: number = 1) => {
    return await api.get('/user/courses/my_courses/', { params: { page } });
  },

  getCourseDetails: async (id: number | string) => {
    return await api.get(`/user/courses/${id}`);
  },

  getLecturesGroup: async (type: string, courseId: number | string, groupId?: number | string) => {
    return await api.get(`/user/courses/lectures_group/${type}/${courseId}${groupId ? `?group_id=${groupId}` : ''}`);
  },

  getCoursePdf: async (id: number | string) => {
    return await api.get(`/user/courses/get_pdf/${id}`, { responseType: 'blob' });
  },

  getLecturePdf: async (id: number | string) => {
    return await api.get(`/user/courses/lecture_pdf/${id}`, { responseType: 'blob' });
  },

  finishCourse: async (id: number | string) => {
    return await api.post(`/user/courses/finish/${id}`);
  },

  getCourseQuestions: async (id: number | string) => {
    return await api.get(`/user/courses/questions/${id}`);
  },

  getCourseReviews: async (id: number | string) => {
    return await api.get(`/user/courses/get_reviews/${id}`);
  },

  getCoursePayInfo: async (id: number | string) => {
    return await api.get(`/user/courses/pay_info/${id}`);
  },

  getCourseBySlug: async (slug: string) => {
    return await api.get(`/user/courses/link/${slug}`);
  },

  // Video Playback
  getLiveMeeting: async (id: number | string) => {
    // Backend: POST /user/courses/meeting/{lecture} (requires auth + device)
    return await api.post(`/user/courses/meeting/${id}`);
  },

  getYoutubeLecture: async (lectureId: number | string) => {
    return await api.post('/user/courses/youtube-lecture', { lecture_id: lectureId });
  },

  getSelfHostedVideo: async (lectureId: number | string) => {
    // Backend: POST /user/courses/recorded-lecture-path  body: { lecture_id }
    return await api.post('/user/courses/recorded-lecture-path', { lecture_id: lectureId });
  },

  getVideoHandshake: async () => {
    if (!handshakePromise) {
      handshakePromise = api.post('/video/handshake').catch((err: any) => {
        handshakePromise = null; // reset if it failed so we can retry later
        throw err;
      });
    }
    return await handshakePromise;
  },

  getRecordedPlayback: async (id: number | string) => {
    return await api.get(`/user/courses/record/${id}`);
  },

  // Quizzes & Gamification
  getQuizPickerList: async (term: string, week: string) => {
    return await api.get(`/user/quizzes/${term}/${week}`);
  },

  getQuizDetails: async (id: number | string) => {
    return await api.get(`/user/quizzes/${id}`);
  },

  incrementHealth: async () => {
    return await api.put('/user/quizzes/increment_health');
  },

  decrementHealth: async () => {
    return await api.put('/user/quizzes/decrement_health');
  },

  finishLesson: async (id: number | string) => {
    return await api.post(`/user/quizzes/finish_lesson/${id}`);
  }
};
