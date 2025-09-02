import axios from 'axios';

// Use environment variable instead of hardcoded localhost
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL, 
});

// Auth
export const registerUser = (data) => API.post('/auth/signup', data);
export const loginUser = (data) => API.post('/auth/signin', data);

// User
export const updateGenres = (userId, genres) => 
  API.post(`/user/${userId}/genres`, { genres });
