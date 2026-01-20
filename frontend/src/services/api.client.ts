import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

// Determine base URL: absolute for SSR, relative for client
const getBaseURL = () => {
    // Server-side: need absolute URL
    if (typeof window === 'undefined') {
        return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    }
    // Client-side: can use relative
    return process.env.NEXT_PUBLIC_API_URL || '/api';
};

// Create Axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10s timeout
});

// Request Interceptor (Token injection placeholder)
apiClient.interceptors.request.use(
    (config) => {
        // TODO: Add Auth Token here if available
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor (Global Error Handling)
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<ApiResponse<null>>) => {
        const status = error.response?.status;
        const message = error.response?.data?.message || 'Something went wrong';

        if (status === 401) {
            // TODO: Handle Unauthorized (Redirect to Login)
            console.warn('Unauthorized access. Redirecting to login...');
        }

        // Wrap error for easier UI handling
        return Promise.reject(new Error(message));
    }
);

export default apiClient;
