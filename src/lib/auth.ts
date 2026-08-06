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
  },

  getAccountView: async () => {
    try {
      return await api.get('/user/account/account_view');
    } catch (error) {
      console.warn('authApi.getAccountView failed:', error);
      return null;
    }
  },
  getRanking: async () => {
    // TEMPORARY MOCK DATA: Using mock data until the backend update is deployed to production.
    // Replace with: return await api.get('/user/account/ranking'); once deployed.
    return {
      ranking: [
        { rank: 1, name: 'علي العالي', progress: 12, diamonds: 500, avatar: '/070f32d8344482d233c60ed52e8fab2be5848260.png' },
        { rank: 2, name: 'نور محمد', progress: 12, diamonds: 500, avatar: '/8aef59e22b486ce79cac17963eb0fe241c3dc4f1.png' },
        { rank: 3, name: 'سارة أحمد', progress: 12, diamonds: 500, avatar: '/9bb9cc83266f8df2d0b844971b105eb1084227ff.png' },
        { rank: 4, name: 'شيماء أبو القميز', progress: 12, diamonds: 500, avatar: '/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png' },
        { rank: 5, name: 'أحمد محمود', progress: 12, diamonds: 500, avatar: '/boy2.png' },
        { rank: 6, name: 'عمر عادل', progress: 12, diamonds: 500, avatar: '/image 24.png' },
        { rank: 7, name: 'فاطمة محمد', progress: 12, diamonds: 500, avatar: '/boy2.png' },
      ],
      current_user: {
        rank: 4,
        name: 'شيماء أبو القميز',
        progress: 12,
        diamonds: 500,
        avatar: '/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png'
      }
    };
  }
};
// Trigger HMR
