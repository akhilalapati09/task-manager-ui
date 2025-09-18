export interface Task {
  id: number
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  dueDate?: string | null
  assignedTo?: string
  project?: Project
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: number
  name: string
  description?: string
  tasks?: Task[]
  createdAt: string
}

export interface TaskStats {
  total: number
  todo: number
  inProgress: number
  completed: number
}

export interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}
