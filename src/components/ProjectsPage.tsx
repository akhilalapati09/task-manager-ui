import { useState, useEffect } from 'react'
import { Project } from '../types'
import { getProjects, createProject, deleteProject } from '../api'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [viewLayout, setViewLayout] = useState<'cards' | 'list'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'tasks'>('date')

  useEffect(() => {
    loadProjects()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProject(formData)
      setFormData({ name: '', description: '' })
      setShowForm(false)
      loadProjects()
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id)
        loadProjects()
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }

  const filteredProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'tasks':
          return (b.tasks?.length || 0) - (a.tasks?.length || 0)
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const ProjectCard = ({ project }: { project: Project }) => (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 border-l-4 border-blue-500 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {project.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-gray-500">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => handleDelete(project.id)}
          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all"
        >
          🗑️
        </button>
      </div>
      
      {project.description && (
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{project.description}</p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-blue-500">📋</span>
            <span className="text-sm font-medium text-gray-700">
              {project.tasks?.length || 0} tasks
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-green-500">✅</span>
            <span className="text-sm text-gray-600">
              {project.tasks?.filter(t => t.status === 'COMPLETED').length || 0} done
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {project.tasks && project.tasks.length > 0 && (
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((project.tasks.filter(t => t.status === 'COMPLETED').length / project.tasks.length) * 100)}%` 
                }}
              ></div>
            </div>
          )}
          <span className="text-xs text-gray-500">
            {project.tasks && project.tasks.length > 0 
              ? `${Math.round((project.tasks.filter(t => t.status === 'COMPLETED').length / project.tasks.length) * 100)}%`
              : '0%'
            }
          </span>
        </div>
      </div>
    </div>
  )

  const ProjectListItem = ({ project }: { project: Project }) => (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-semibold text-sm">
            {project.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{project.name}</h3>
          <p className="text-sm text-gray-600">{project.description}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{project.tasks?.length || 0}</p>
          <p className="text-xs text-gray-500">Tasks</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-green-600">
            {project.tasks?.filter(t => t.status === 'COMPLETED').length || 0}
          </p>
          <p className="text-xs text-gray-500">Done</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">Created</p>
        </div>
        <button
          onClick={() => handleDelete(project.id)}
          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
        >
          🗑️
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📁 Projects</h1>
          <p className="text-gray-600">Organize your tasks by projects</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <span>➕</span>
          <span>New Project</span>
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="tasks">Sort by Tasks</option>
            </select>
          </div>

          {/* View Layout */}
          <div className="flex space-x-1">
            <button
              onClick={() => setViewLayout('cards')}
              className={`px-3 py-2 rounded text-sm ${viewLayout === 'cards' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              🃏 Cards
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`px-3 py-2 rounded text-sm ${viewLayout === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              📋 List
            </button>
          </div>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            {filteredProjects.length} of {projects.length} projects
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {viewLayout === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <ProjectListItem key={project.id} project={project} />
          ))}
        </div>
      )}
      
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📁</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {projects.length === 0 ? 'No projects yet' : 'No projects match your search'}
          </h3>
          <p className="text-gray-600 mb-4">
            {projects.length === 0 
              ? 'Create your first project to organize tasks'
              : 'Try adjusting your search or filters'
            }
          </p>
          {projects.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Create New Project</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Project description (optional)"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
