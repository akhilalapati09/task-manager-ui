import { useState } from 'react'
import { createTask } from '../services'

interface JiraImportProps {
  onClose: () => void
  onImported: () => void
}

export default function JiraImport({ onClose, onImported }: JiraImportProps) {
  const [ticketId, setTicketId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketId.trim()) return

    setLoading(true)
    try {
      // Mock JIRA import - in real app, this would call backend JIRA integration
      const mockJiraData = {
        title: `[${ticketId.toUpperCase()}] Sample JIRA ticket`,
        description: `This is a test import of JIRA ticket ${ticketId}. Configure JIRA credentials in Team page for real imports.`,
        priority: 'MEDIUM' as const,
        status: 'TODO' as const,
        assignedTo: 'Imported from JIRA',
        dueDate: null
      }

      await createTask(mockJiraData)
      onImported()
    } catch (error) {
      console.error('Failed to import JIRA ticket:', error)
      alert('Failed to import JIRA ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">📥 Import from JIRA</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleImport} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              JIRA Ticket ID *
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="e.g., PROJ-123"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the JIRA ticket ID (e.g., PROJ-123, TASK-456)
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  JIRA Integration
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Configure your JIRA credentials in the Team page for real ticket imports.</p>
                  <p className="mt-1">Currently showing mock data for demonstration.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md disabled:opacity-50"
            >
              {loading ? '⏳ Importing...' : '📥 Import Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
