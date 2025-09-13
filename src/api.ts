import axios from 'axios'
import { Task, TaskStats, Project } from './types'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Task API functions
export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks')
  return response.data
}

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
  const response = await api.post('/tasks', task)
  return response.data
}

export const updateTaskStatus = async (id: number, status: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${id}/status?status=${status}`)
  return response.data
}

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/tasks/${id}`)
}

export const getTaskStats = async (): Promise<TaskStats> => {
  const response = await api.get('/tasks/stats')
  return response.data
}

// Project API functions
export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get('/projects')
  return response.data
}

export const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'tasks'>): Promise<Project> => {
  const response = await api.post('/projects', project)
  return response.data
}

export const deleteProject = async (id: number): Promise<void> => {
  await api.delete(`/projects/${id}`)
}
