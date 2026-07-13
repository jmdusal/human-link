import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { camelizeKeys, decamelizeKeys } from 'humps';

const apiBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const apiOrigin = apiBaseURL.replace(/\/api\/?$/, '');

const api: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // Free ngrok serves an interstitial HTML page to browsers unless this is set.
    'ngrok-skip-browser-warning': 'true',
  },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (
        ['post', 'put', 'patch', 'delete'].includes(config.method || '') &&
        !document.cookie.includes('XSRF-TOKEN')
    ) {
        await axios.get(`${apiOrigin}/sanctum/csrf-cookie`, {
            withCredentials: true,
            headers: {
                'ngrok-skip-browser-warning': 'true',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
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
