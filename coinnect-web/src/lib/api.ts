import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL: API_BASE });

export function setAuthToken(token?: string) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export async function login(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  return res.data as { token: string; user: any };
}

export async function register(email: string, password: string, name: string) {
  const res = await api.post('/auth/register', { email, password, name });
  return res.data;
}

export async function getMe() {
  const res = await api.get('/users/me');
  return res.data;
}

export async function getTransactions() {
  const res = await api.get('/transactions');
  return res.data;
}

export async function getRoundupTotal() {
  const res = await api.get('/roundups');
  return res.data as { totalRoundup: number };
}

export async function investRoundup() {
  const res = await api.post('/roundups/invest');
  return res.data;
}

export async function getGoals() {
  const res = await api.get('/goals');
  return res.data;
}

export async function createGoal(name: string, targetAmount: number) {
  const res = await api.post('/goals', { name, targetAmount });
  return res.data;
}

export async function getLeaderboard() {
  const res = await api.get('/leaderboard');
  return res.data;
}

export async function chat(message: string) {
  const res = await api.post('/chat', { message });
  return res.data as { reply: string };
}
