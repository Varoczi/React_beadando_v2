import { apiClient } from './client';

export const loginUser = async (email: string, password: string) => {
  return await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const registerUser = async (name: string, email: string, password: string) => {
  return await apiClient('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
};