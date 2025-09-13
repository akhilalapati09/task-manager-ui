import { useState, useEffect } from 'react'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import JiraImport from './JiraImport'
import { Task } from '../types'
import { getTasks } from '../api'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showJiraImport, setShowJiraImport] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Filters and views
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'priority' | 'assignee'>('none')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [viewLayout, setViewLayout] = useState<'list' | 'cards' | 'board'>('cards')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadTasks()
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

  const handleTaskCreated = () => {
    setShowForm(false)
    loadTasks()
  }

  const handleJiraImported = () => {
    setShowJiraImport(false)
    loadTasks()
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
        <div className="flex space-x-2">
          <select 
            value={task.status}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button className="text-red-500 hover:text-red-700 text-xs">🗑️</button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            task.status === 'TODO' ? 'bg-yellow-100 text-yellow-800' :
            task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {task.priority}
          </span>
        </div>
        {task.assignedTo && (
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs text-blue-600 font-semibold">
              {task.assignedTo.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}
      </div>
    </div>
  )

  const BoardView = ({ groupedTasks }: { groupedTasks: Record<string, Task[]> }) => (
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
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const CardsView = ({ tasks }: { tasks: Task[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
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
    <div>
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
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <span>➕</span><span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Priority</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Group By */}
          <div>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="none">No Grouping</option>
              <option value="status">Group by Status</option>
              <option value="priority">Group by Priority</option>
              <option value="assignee">Group by Assignee</option>
            </select>
          </div>

          {/* View Layout */}
          <div className="flex space-x-1">
            <button
              onClick={() => setViewLayout('list')}
              className={`px-3 py-2 rounded text-sm ${viewLayout === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              📋
            </button>
            <button
              onClick={() => setViewLayout('cards')}
              className={`px-3 py-2 rounded text-sm ${viewLayout === 'cards' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              🃏
            </button>
            <button
              onClick={() => setViewLayout('board')}
              className={`px-3 py-2 rounded text-sm ${viewLayout === 'board' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              📊
            </button>
          </div>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>
      </div>

      {/* Task Views */}
      {viewLayout === 'list' && <TaskList tasks={filteredTasks} onTaskUpdate={loadTasks} />}
      {viewLayout === 'cards' && <CardsView tasks={filteredTasks} />}
      {viewLayout === 'board' && <BoardView groupedTasks={groupedTasks} />}

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📋</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">Try adjusting your filters or create a new task</p>
        </div>
      )}

      {showForm && (
        <TaskForm
          onClose={() => setShowForm(false)}
          onTaskCreated={handleTaskCreated}
        />
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
