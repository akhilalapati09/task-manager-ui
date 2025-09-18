import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (e: React.MouseEvent, taskId: number) => void;
  onStatusChange: (task: Task, newStatus: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Only open edit if the click wasn't on a button or select
    if (!(e.target instanceof HTMLButtonElement || e.target instanceof HTMLSelectElement)) {
      onEdit(task);
    }
  };

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow border-l-4 border-blue-500 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">{task.title}</h3>
        <div className="flex space-x-2">
          <select 
            value={task.status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(task, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e, task.id);
            }}
            className="text-red-500 hover:text-red-700 text-xs"
            title="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <span>📅 {new Date(task.dueDate || task.createdAt).toLocaleDateString()}</span>
          {task.dueDate && new Date(task.dueDate) < new Date() && !task.completedAt && (
            <span className="text-xs text-red-500">Overdue</span>
          )}
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
  );
}
