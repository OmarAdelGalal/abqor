import api from './api';

export const authApi = {
  login: async (credentials: any) => {
    return await api.post('/user/auth/login', credentials);
  },

  loginByFirebase: async (firebaseId: string) => {
    return await api.post('/user/auth/login_by_firebase', { firebase_id: firebaseId });
  },

  registerByFirebase: async (data: any) => {
    return await api.post('/user/auth/register_by_firebase', data);
  },

  checkUser: async (data: { phone?: string; email?: string }) => {
    return await api.post('/user/auth/check_user', data);
  },

  verifyRegisterOtp: async (email: string, code: string) => {
    return await api.post('/user/auth/verify_register_otp', { email, code });
  },

  forgotPassword: async (email: string) => {
    return await api.post('/user/auth/forgot_password', { email });
  },

  checkOtp: async (email: string, code: string, type: string = 'register') => {
    return await api.post('/user/auth/check_otp', { email, code, type });
  },

  resetPassword: async (data: any) => {
    return await api.post('/user/auth/reset_password', data);
  },

  autoLogin: async (token: string) => {
    return await api.post('/user/auth/auto_login', { token });
  },

  logout: async () => {
    return await api.post('/user/auth/logout');
  },

  // Onboarding Data
  fetchEducationLevels: async () => {
    return await api.post('/user/auth/fetch-education-levels');
  },

  fetchEducationYears: async () => {
    return await api.post('/user/auth/education_years');
  },

  fetchEducationMajors: async () => {
    return await api.get('/user/auth/education_majors');
  },

  updateProgram: async (data: any) => {
    return await api.post('/user/account/update_program', data);
  }
};
