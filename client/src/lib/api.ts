import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { ROUTES } from '../shared/constants/routes.constants';

// Define the shape of the error response from the API
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
  [key: string]: any;
}

// Extend AxiosRequestConfig to include our custom options
export interface ApiRequestConfig extends AxiosRequestConfig {
  skipErrorToast?: boolean;
  skipAuth?: boolean;
}

// Create axios instance with default config
const createApiClient = (): AxiosInstance => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || '/api',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 10000, // 10 seconds
  });

  // Request interceptor for API calls
  api.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
  );

  // Response interceptor for API calls
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      // Handle successful responses (status code 2xx)
      return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
      // Handle errors (status code 4xx/5xx)
      const { response, config } = error;
      const errorConfig = config as ApiRequestConfig;
      
      // Skip error toast if explicitly requested
      if (errorConfig?.skipErrorToast !== true) {
        const errorMessage = response?.data?.message || 
                           error.message || 
                           'An unexpected error occurred';
        
        // Log error to console
        console.error('API Error:', errorMessage);
      }

      // Handle specific status codes
      if (response?.status === 401) {
        // Don't redirect to login if user is on public pages (home, login, register, service pages, gallery)
        const publicPaths = [
          ROUTES.HOME,
          ROUTES.LOGIN,
          ROUTES.REGISTER,
          '/services/training',
          '/services/technical-projects',
          '/services/3d-printing',
          '/gallery'
        ];
        const isOnPublicPage = publicPaths.includes(window.location.pathname);

        if (!isOnPublicPage && window.location.pathname !== ROUTES.LOGIN) {
          window.location.href = ROUTES.LOGIN;
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

// Create the API client instance
const api = createApiClient();

/**
 * Set or clear the authentication token for API requests
 * @param token - The JWT token or undefined to clear the token
 */
export const setAuthToken = (token?: string): void => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Clear the authentication token
 */
export const clearAuthToken = (): void => {
  delete api.defaults.headers.common['Authorization'];
};

// Export the configured axios instance
export { api };

export const apiGet = <T = any>(
  url: string, 
  config?: ApiRequestConfig
): Promise<AxiosResponse<T>> => api.get<T>(url, config);

export const apiPost = <T = any, D = any>(
  url: string, 
  data?: D, 
  config?: ApiRequestConfig
): Promise<AxiosResponse<T>> => api.post<T>(url, data, config);

export const apiPut = <T = any, D = any>(
  url: string, 
  data?: D, 
  config?: ApiRequestConfig
): Promise<AxiosResponse<T>> => api.put<T>(url, data, config);

export const apiPatch = <T = any, D = any>(
  url: string, 
  data?: D, 
  config?: ApiRequestConfig
): Promise<AxiosResponse<T>> => api.patch<T>(url, data, config);

export const apiDelete = <T = any>(
  url: string, 
  config?: ApiRequestConfig
): Promise<AxiosResponse<T>> => api.delete<T>(url, config);

// Export axios instance type for type safety
export type { AxiosInstance, AxiosResponse, AxiosError };
