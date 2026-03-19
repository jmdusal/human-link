import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { camelizeKeys, decamelizeKeys } from 'humps';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (
        ['post', 'put', 'patch', 'delete'].includes(config.method || '') &&
        !document.cookie.includes('XSRF-TOKEN')
    ) {
        await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
            withCredentials: true
        });
    }
    
    if (config.data && !(config.data instanceof FormData)) {
        config.data = decamelizeKeys(config.data);
    }
    
    if (config.params) {
        config.params = decamelizeKeys(config.params);
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use((response: AxiosResponse) => {
    if (response.data && response.headers['content-type']?.includes('application/json')) {
        response.data = camelizeKeys(response.data);
    }
    return response;
}, (error) => Promise.reject(error));

export default api;