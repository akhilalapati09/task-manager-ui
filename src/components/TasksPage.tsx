import { useState, useEffect } from 'react'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import JiraImport from './JiraImport'
import TaskCard from './TaskCard'
import { Task, Project } from '../types'
import { getTasks, updateTask, deleteTask, getProjects, getTeamMembers } from '../services'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showJiraImport, setShowJiraImport] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Filters and views
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'priority' | 'assignee'>('assignee')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [viewLayout, setViewLayout] = useState<'list' | 'cards' | 'board'>('board')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadTasks(), loadProjects(), loadTeamMembers()])
    }
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [tasks, filterStatus, filterPriority, searchTerm])

  const loadTasks = async () => {
    try {
      const tasksData = await getTasks()
      setTasks(tasksData)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    }
  }

  const loadProjects = async () => {
    try {
      const projectsData = await getProjects()
      setProjects(projectsData)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTeamMembers = async () => {
      try {
        const teamMembersData = await getTeamMembers()
        setTeamMembers(teamMembersData)
      } catch (error) {
        console.error('Failed to team members:', error)
      } finally {
        setLoading(false)
      }
    }

  const applyFilters = () => {
    let filtered = tasks

    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus)
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === filterPriority)
    }

    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTasks(filtered)
  }

  const groupTasks = (tasks: Task[]) => {
    if (groupBy === 'none') return { 'All Tasks': tasks }

    return tasks.reduce((groups: Record<string, Task[]>, task) => {
      let key = ''
      switch (groupBy) {
        case 'status':
          key = task.status.replace('_', ' ')
          break
        case 'priority':
          key = task.priority
          break
        case 'assignee':
          key = task.assignedTo || 'Unassigned'
          break
      }
      
      if (!groups[key]) groups[key] = []
      groups[key].push(task)
      return groups
    }, {})
  }

  const resetForm = () => {
    setEditingTask(null)
    setError(null)
  }

  const handleCloseModal = () => {
    resetForm()
    setShowForm(false)
  }

  const handleTaskSaved = () => {
    resetForm()
    setShowForm(false)
    loadTasks()
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleNewTask = () => {
    resetForm()
    setShowForm(true)
  }

  const handleStatusChange = async (task: Task, newStatus: string) => {
    try {
      setIsSubmitting(true)
      await updateTask(task.id, { ...task, status: newStatus })
      loadTasks()
    } catch (error) {
      console.error('Failed to update task status:', error)
      setError('Failed to update task status. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (e: React.MouseEvent, taskId: number) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId)
        loadTasks()
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const handleJiraImported = () => {
    setShowJiraImport(false)
    loadTasks()
  }

  interface BoardViewProps {
    groupedTasks: Record<string, Task[]>;
    onEdit: (task: Task) => void;
    onDelete: (e: React.MouseEvent, taskId: number) => void;
    onStatusChange: (task: Task, newStatus: string) => void;
  }

  const BoardView = ({ groupedTasks, onEdit, onDelete, onStatusChange }: BoardViewProps) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(groupedTasks).map(([group, tasks]) => (
          <div key={group} className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
              {group}
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {tasks.length}
              </span>
            </h3>
            <div className="space-y-3">
              {tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const CardsView = ({ tasks, onEdit, onDelete, onStatusChange }: { 
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (e: React.MouseEvent, taskId: number) => void;
    onStatusChange: (task: Task, newStatus: string) => void;
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map(task => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const groupedTasks = groupTasks(filteredTasks)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Tasks</h1>
          <p className="text-gray-600">Manage and track your tasks</p>
        </div>
        <div className="flex space-x-3">
          <button
              onClick={() => setShowJiraImport(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <span>📥</span><span>Import JIRA</span>
            </button>
          <button
            onClick={handleNewTask}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <span>+</span>
            <span>New Task</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              id="search"
              placeholder="Search tasks..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              id="priority"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Group By */}
            <div>
              <label htmlFor="groupBy" className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <select
                id="groupBy"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'none' | 'status' | 'priority' | 'assignee')}
              >
                <option value="none">No Grouping</option>
                <option value="status">Status</option>
                <option value="priority">Priority</option>
                <option value="assignee">Assignee</option>
              </select>
            </div>

          {/* View Layout - Compact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
            <div className="flex h-9 items-stretch rounded-md shadow-sm" role="group">
              <button
                type="button"
                className={`flex items-center justify-center px-3 text-sm font-medium border rounded-xl ${
                  viewLayout === 'list' 
                    ? 'bg-blue-600 text-white border-blue-600 w-40'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setViewLayout('list')}
                title="List View"
              >
                📋
              </button>
              <button
                type="button"
                className={`flex items-center justify-center px-3 text-sm font-medium border rounded-xl ${
                  viewLayout === 'cards' 
                    ? 'bg-blue-600 text-white border-blue-600 w-40'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setViewLayout('cards')}
                title="Card View"
              >
                🗂️
              </button>
              <button
                type="button"
                className={`flex items-center justify-center px-3 text-sm font-medium border rounded-xl ${
                  viewLayout === 'board'
                    ? 'bg-blue-600 text-white border-blue-600 w-40'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setViewLayout('board')}
                title="Board"
              >
                📊
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center text-sm text-gray-600 mt-4">
          {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Task Views */}
      {filteredTasks.length > 0 ? (
        <div className="mt-6">
          {viewLayout === 'list' && (
            <TaskList 
              tasks={groupBy === 'none' ? filteredTasks : Object.values(groupedTasks).flat()}
              onEdit={handleEditTask} 
              onDelete={handleDeleteTask} 
              onStatusChange={handleStatusChange} 
            />
          )}
          {viewLayout === 'board' && (
            <BoardView 
              groupedTasks={groupedTasks} 
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          )}
          {viewLayout === 'cards' && (
            <CardsView 
              tasks={groupBy === 'none' ? filteredTasks : Object.values(groupedTasks).flat()}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      ) : !loading ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <span className="text-6xl mb-4 block">📋</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">Try adjusting your filters or create a new task to get started!</p>
        </div>
      ) : null}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <TaskForm
                task={editingTask}
                projects={projects}
                teamMembers={teamMembers}
                onClose={handleCloseModal}
                onTaskCreated={handleTaskSaved}
              />
          </div>
        </div>
      )}

      {showJiraImport && (
        <JiraImport
          onClose={() => setShowJiraImport(false)}
          onImported={handleJiraImported}
        />
      )}
    </div>
    )
}
