import { Task } from '../types'
import { updateTaskStatus, deleteTask } from '../services'

interface TaskListProps {
  tasks: Task[]
  onTaskUpdate: () => void
}

export default function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const handleStatusChange = async (taskId: number, status: string) => {
    try {
      await updateTaskStatus(taskId, status)
      onTaskUpdate()
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const handleDelete = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId)
        onTaskUpdate()
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <div key={task.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                {task.description && (
                  <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                )}
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    Priority: {task.priority}
                  </span>
                  {task.assignedTo && (
                    <span className="text-xs text-gray-500">
                      Assigned: {task.assignedTo}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No tasks found. Create your first task!
          </div>
        )}
      </div>
    </div>
  )
}
