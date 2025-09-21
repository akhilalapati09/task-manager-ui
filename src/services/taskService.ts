import axios from 'axios';
import { Task, TaskStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const SERVICE_BASE_URL = '/tasks';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get(SERVICE_BASE_URL);
  return response.data;
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const response = await api.post(SERVICE_BASE_URL, task);
  return response.data;
};

export const updateTaskStatus = async (id: number, status: string): Promise<Task> => {
  const response = await api.patch(`${SERVICE_BASE_URL}/${id}/status?status=${status}`);
  return response.data;
};

export const updateTask = async (id: number, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> => {
  const response = await api.put(`${SERVICE_BASE_URL}/${id}`, updates);
  return response.data;
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`${SERVICE_BASE_URL}/${id}`);
};

export const getTaskStats = async (): Promise<TaskStats> => {
  const response = await api.get(`${SERVICE_BASE_URL}/stats`);
  return response.data;
};
