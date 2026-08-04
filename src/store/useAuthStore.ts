import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
}

interface Program {
  education_level_id: number;
  education_year_id: number;
  education_major_id?: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  program: Program | null;
  setAuth: (token: string, user: User, program?: Program) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('abqor_token') : null,
  user: null, // Should be populated on app load via autoLogin
  program: null,
  setAuth: (token, user, program) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('abqor_token', token);
    }
    set({ token, user, program });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('abqor_token');
    }
    set({ token: null, user: null, program: null });
  },
}));
