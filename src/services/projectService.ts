import axios from 'axios';
import { Project } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const SERVICE_BASE_URL = '/projects';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get(SERVICE_BASE_URL);
  return response.data;
};

export const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>): Promise<Project> => {
  const response = await api.post(SERVICE_BASE_URL, project);
  return response.data;
};

export const updateProject = async (id: number, updates: Partial<Omit<Project, 'id' | 'createdAt' | 'tasks'>>): Promise<Project> => {
  const response = await api.patch(`${SERVICE_BASE_URL}/${id}`, updates);
  return response.data;
};

export const deleteProject = async (id: number): Promise<void> => {
  await api.delete(`${SERVICE_BASE_URL}/${id}`);
};
