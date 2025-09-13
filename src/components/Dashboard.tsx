import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TaskStats } from '../types'
import { getTaskStats } from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const statsData = await getTaskStats()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Dashboard</h1>
        <p className="text-gray-600">Overview of your task management system</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <span className="text-2xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">To Do</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.todo}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/tasks" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <span className="text-3xl mr-4">📋</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Manage Tasks</h3>
              <p className="text-gray-600">Create, update, and track tasks</p>
            </div>
          </div>
        </Link>
        
        <Link to="/projects" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <span className="text-3xl mr-4">📁</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
              <p className="text-gray-600">Organize tasks by projects</p>
            </div>
          </div>
        </Link>
        
        <Link to="/team" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <span className="text-3xl mr-4">👥</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Team</h3>
              <p className="text-gray-600">Manage team members & JIRA</p>
            </div>
          </div>
        </Link>
      </div>

      {/* System Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">0.5s</p>
            <p className="text-sm text-gray-600">Startup Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">50MB</p>
            <p className="text-sm text-gray-600">Memory Usage</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">Quarkus</p>
            <p className="text-sm text-gray-600">Supersonic Framework</p>
          </div>
        </div>
      </div>
    </div>
  )
}
