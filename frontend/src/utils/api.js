import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
