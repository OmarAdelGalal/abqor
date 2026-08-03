import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// The base URL for the backend API
// Ensure this points to the real backend server URL when deploying
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Define the universal response envelope expected from the backend
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
  code: string;
  isSuccess: boolean;
}

// Create the Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach the Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // We only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('abqor_token');
      if (token) {
        // Assumption: The backend uses Bearer tokens in the Authorization header
        // This must be verified with the backend developer as noted in the plan
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwrap the custom envelope
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const apiResponse = response.data;
    
    // If the backend returns a 200 HTTP status but isSuccess is false, treat it as an error
    if (!apiResponse.isSuccess) {
      return Promise.reject({
        code: apiResponse.code,
        message: apiResponse.message,
        data: apiResponse.data,
      });
    }

    // Return the unwrapped data for easier consumption in the components
    return apiResponse.data as any;
  },
  (error) => {
    // Handle standard HTTP errors (4xx, 5xx) that might still follow the envelope format
    if (error.response && error.response.data) {
      const apiResponse = error.response.data as ApiResponse;
      return Promise.reject({
        code: apiResponse.code || 'UNKNOWN_ERROR',
        message: apiResponse.message || error.message,
        data: apiResponse.data,
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;
