import axios from 'axios';

const API_BASE_URL = 'https://app-reski-api.azurewebsites.net';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});
