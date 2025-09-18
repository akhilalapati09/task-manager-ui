import axios from 'axios';
import { TeamMember } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const SERVICE_BASE_URL = '/team-members';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createTeamMember = async (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> => {
  console.log('Creating team member with data:', member);
  try {
    const response = await api.post(SERVICE_BASE_URL, member);
    console.log('Team member created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating team member:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
};

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const response = await api.get(SERVICE_BASE_URL);
  return response.data;
};

export const updateTeamMember = async (id: number, updates: Partial<Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TeamMember> => {
  const response = await api.patch(`${SERVICE_BASE_URL}/${id}`, updates);
  return response.data;
};

export const deleteTeamMember = async (id: number): Promise<void> => {
  await api.delete(`${SERVICE_BASE_URL}/${id}`);
};
