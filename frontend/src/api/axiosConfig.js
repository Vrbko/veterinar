import axios from 'axios';

  const instance = axios.create({
    baseURL: process.env.BACKEND_HOST, // Docker service name
  });


instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
