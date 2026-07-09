import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, AuthTokens } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const getStoredTokens = (): AuthTokens | null => {
  const raw = localStorage.getItem('auth_tokens');
  return raw ? (JSON.parse(raw) as AuthTokens) : null;
};

export const setStoredTokens = (tokens: AuthTokens | null): void => {
  if (tokens) {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  } else {
    localStorage.removeItem('auth_tokens');
  }
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokens = getStoredTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => {
    if (token) cb(token);
  });
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry || original.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    const tokens = getStoredTokens();
    if (!tokens?.refreshToken) {
      setStoredTokens(null);
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<ApiResponse<AuthTokens>>(
        `${API_URL}/auth/refresh`,
        { refreshToken: tokens.refreshToken },
      );

      const newTokens = data.data;
      setStoredTokens(newTokens);
      processQueue(newTokens.accessToken);
      original.headers.Authorization = `Bearer ${newTokens.accessToken}`;
      return apiClient(original);
    } catch {
      setStoredTokens(null);
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export const extractData = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export const extractList = <T>(
  response: { data: ApiResponse<T[]> },
): { data: T[]; meta?: ApiResponse<T[]>['meta'] } => ({
  data: response.data.data,
  meta: response.data.meta,
});
