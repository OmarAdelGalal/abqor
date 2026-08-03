import api from './api';

export const coursesApi = {
  // Course Catalog
  getAllCourses: async () => {
    return await api.get('/user/courses');
  },

  getMyCourses: async (page: number = 1) => {
    return await api.get(`/user/courses/my_courses/?page=${page}`);
  },

  getCourseDetails: async (id: number | string) => {
    return await api.get(`/user/courses/${id}`);
  },

  getLessonList: async (lessonId: number | string, groupId: number | string) => {
    return await api.get(`/user/courses/lectures_group/lesson/${lessonId}?group_id=${groupId}`);
  },

  getCoursePdf: async (id: number | string) => {
    return await api.get(`/user/courses/get_pdf/${id}`);
  },

  getLecturePdf: async (id: number | string) => {
    return await api.get(`/user/courses/lecture_pdf/${id}`);
  },

  finishCourse: async (id: number | string) => {
    return await api.post(`/user/courses/finish/${id}`);
  },

  // Video Playback
  getLiveMeeting: async (id: number | string) => {
    return await api.get(`/user/courses/meeting/${id}`);
  },

  getYoutubeLecture: async (lectureId: number | string) => {
    return await api.post('/user/courses/youtube-lecture', { lecture_id: lectureId });
  },

  getSelfHostedVideo: async (lectureId: number | string) => {
    return await api.post('/user/courses/lectureVideoPath', { lectureId });
  },

  getVideoHandshake: async () => {
    return await api.post('/video/handshake');
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
