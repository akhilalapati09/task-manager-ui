import { useState, useEffect } from 'react'
import { Project } from '../types'
import { getProjects, createProject, updateProject, deleteProject } from '../services'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [viewLayout, setViewLayout] = useState<'cards' | 'list'>('cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'tasks'>('date')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setEditingProject(null)
    setError(null)
  }

  const handleCloseModal = () => {
    resetForm()
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    try {
      if (editingProject) {
        await updateProject(editingProject.id, formData)
      } else {
        await createProject(formData)
      }
      resetForm()
      setShowForm(false)
      loadProjects()
    } catch (error) {
      console.error('Failed to save project:', error)
      setError('Failed to save project. Please check the console for details.')
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }
    } finally {
      setIsSubmitting(false)
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

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || ''
    })
    setShowForm(true)
  }

  const ProjectCard = ({ project }: { project: Project }) => (
    <div 
      className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 border-l-4 border-blue-500 group cursor-pointer"
      onClick={() => handleEditProject(project)}
    >
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
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleEditProject(project)
            }}
            className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-all"
            title="Edit project"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(project.id)
            }}
            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all"
            title="Delete project"
          >
            🗑️
          </button>
        </div>
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
    <div 
      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow flex items-center justify-between cursor-pointer"
      onClick={() => handleEditProject(project)}
    >
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
        <div className="flex space-x-2">
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <span>+</span>
            <span>New Project</span>
          </button>
        </div>
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
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

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

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingProject ? 'Updating...' : 'Creating...'}
                    </>
                  ) : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
