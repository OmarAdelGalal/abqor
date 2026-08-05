import api from './api';

export const generalApi = {
  getTeachers: async () => {
    try {
      const response = await api.get('/user/general/teachers_by_subject');
      const data = response || {}; // api interceptor already unwraps .data
      // Flatten grouped dictionary into an array
      let allTeachers: any[] = [];
      Object.values(data).forEach((group: any) => {
        if (Array.isArray(group)) {
          allTeachers = [...allTeachers, ...group];
        }
      });
      return allTeachers;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  
  getBooks: async () => {
    try {
      const response = await api.get('/user/courses');
      const data = response || {}; // api interceptor already unwraps .data
      // Flatten grouped dictionary into an array
      let allCourses: any[] = [];
      Object.values(data).forEach((group: any) => {
        if (Array.isArray(group)) {
          allCourses = [...allCourses, ...group];
        }
      });
      return allCourses;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  
  getAppReviews: async (type: 'teacher' | 'book', id: number) => {
    try {
      if (type === 'book') {
        const response = await api.get(`/user/courses/get_reviews/${id}`);
        return response || [];
      } else {
        // Fallback for teacher reviews if it returns 404
        return [];
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  }
};
