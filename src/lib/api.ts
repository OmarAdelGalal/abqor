import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getOrCreateDeviceId } from './api/deviceIdentifier';
import { useAuthStore } from '../store/useAuthStore';

// Hardcoding to the Next.js proxy to bypass CORS and Turbopack .env cache
const API_BASE_URL = '/proxy-api';
console.log("API_BASE_URL being used:", API_BASE_URL);

// Define the universal response envelope expected from the backend
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
  code: string;
  isSuccess: boolean;
}

// Create the Axios instance
const api: any = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('abqor_token');
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
      
      const deviceId = getOrCreateDeviceId();
      config.headers.set('X-Device-Id', deviceId);
      
      // Determine device class based on viewport (simplified heuristic)
      const deviceClass = window.innerWidth <= 768 ? 'mobile' : 'desktop';
      config.headers.set('X-Device-Class', deviceClass);
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    if (error.response && typeof window !== 'undefined') {
      const { status, data } = error.response;
      
      // Handle session revocation (Zero-Trust device policy)
      if (status === 401 || status === 403 || data?.code === 'DEVICE_MISMATCH') {
        useAuthStore.getState().logout();
        window.location.href = '/onboarding';
      }
    }
    return Promise.reject(error);
  }
);

// Response Interceptor: Unwrap the custom envelope
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const apiResponse = response.data;
    
    // If the backend explicitly returns isSuccess = false, treat it as an error
    if (apiResponse && typeof apiResponse.isSuccess !== 'undefined' && !apiResponse.isSuccess) {
      // Global Auth Error Handler (Token expired or invalid)
      if (apiResponse.message === 'authentication error' || apiResponse.code === 'UNAUTHENTICATED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('abqor_token');
          window.location.href = '/login';
        }
      }

      return Promise.reject({
        code: apiResponse.code,
        message: apiResponse.message,
        data: apiResponse.data,
      });
    }

    // If it has the envelope, return unwrapped data. Otherwise, return raw apiResponse.
    if (apiResponse && typeof apiResponse.isSuccess !== 'undefined') {
      return apiResponse.data as any;
    }
    
    return apiResponse;
  },
  (error: any) => {
    // Handle standard HTTP errors (4xx, 5xx) that might still follow the envelope format
    if (error.response) {
      const apiResponse = error.response.data as any;
      
      // Global Auth Error Handler for 401s
      if (error.response.status === 401 || apiResponse?.message === 'authentication error') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('abqor_token');
          window.location.href = '/login';
        }
      }

      return Promise.reject({
        status: error.response.status,
        code: apiResponse?.code || 'HTTP_ERROR',
        message: apiResponse?.message || error.message || "Unknown Error",
        data: apiResponse?.data || apiResponse,
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
