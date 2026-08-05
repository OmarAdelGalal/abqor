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

  registerByPhone: async (data: any) => {
    return await api.post('/user/auth/register_by_phone', data);
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
    return await api.get('/user/auth/education_levels'); // GET, not POST
  },

  fetchEducationYears: async (params?: { education_level_id?: number; education_major_id?: number }) => {
    return await api.get('/user/auth/education_years', { params }); // GET, not POST
  },

  fetchEducationMajors: async (params?: { education_level_id?: number; education_year_id?: number }) => {
    return await api.get('/user/auth/education_majors', { params });
  },

  updateProgram: async (data: any) => {
    return await api.post('/user/account/update_program', data);
  },

  getUserProfile: async () => {
    return await api.get('/user/account/');
  },

  updateProfile: async (data: any) => {
    return await api.put('/user/account/update_profile', data);
  },

  changeAvatar: async (formData: FormData) => {
    return await api.post('/user/account/change_avatar', formData);
  },

  changeEmail: async (email: string) => {
    return await api.post('/user/account/change_email', { email });
  },

  verifyEmailChange: async (email: string, code: string) => {
    return await api.post('/user/account/verify_email_change', { email, code });
  },

  changePassword: async (data: any) => {
    return await api.post('/user/account/change_password', data);
  },

  deleteAccount: async () => {
    return await api.post('/user/account/delete_account');
  }
};
