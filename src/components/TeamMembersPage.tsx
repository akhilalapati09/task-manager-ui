import { useState, useEffect, useCallback } from 'react'
import { getTeamMembers, createTeamMember, deleteTeamMember, updateTeamMember } from '../services/teamMemberService'

export default function TeamMembersPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [memberForm, setMemberForm] = useState({ name: '', email: '', role: 'Developer' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTeamMembers = useCallback(async () => {
    try {
      const data = await getTeamMembers()
      setMembers(data)
    } catch (error) {
      console.error('Failed to load team members:', error)
      // Optionally show an error message to the user
    }
  }, [])

  useEffect(() => {
    loadTeamMembers()
  }, [loadTeamMembers])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    try {
      if (editingMember) {
        const updatedMember = await updateTeamMember(editingMember.id, memberForm)
        setMembers(members.map(m => m.id === editingMember.id ? updatedMember : m))
      } else {
        console.log('Creating new member with data:', memberForm)
        const newMember = await createTeamMember(memberForm)
        console.log('New member created:', newMember)
        setMembers([...members, newMember])
      }
      resetForm()
      setShowMemberForm(false)
    } catch (error) {
      console.error('Failed to save team member:', error)
      setError('Failed to save team member. Please check the console for details.')
      if (error.response) {
        console.error('Response data:', error.response.data)
        console.error('Response status:', error.response.status)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMember = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to remove this team member?')) {
      try {
        await deleteTeamMember(id)
        setMembers(members.filter(m => m.id !== id))
      } catch (error) {
        console.error('Failed to delete team member:', error)
        // Optionally show an error message to the user
      }
    }
  }

  const resetForm = () => {
    setMemberForm({ name: '', email: '', role: 'Developer' })
    setEditingMember(null)
    setError(null)
  }

  const handleCloseModal = () => {
    resetForm()
    setShowMemberForm(false)
  }

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member)
    setMemberForm({
      name: member.name,
      email: member.email,
      role: member.role
    })
    setShowMemberForm(true)
  }

  const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow" onClick={() => handleEditMember(member)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer">
            <span className="text-white font-semibold text-lg">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div >
            <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
            <p className="text-gray-600">{member.email}</p>
            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {member.role}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => handleDeleteMember(e, member.id)}
          className="text-red-400 hover:text-red-600 transition-colors"
          title="Remove member"
        >
          🗑️
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Team Members</h1>
        <p className="text-gray-600">Manage your team members</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
          <button
            onClick={() => {
              resetForm()
              setShowMemberForm(true)
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add Member</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
          
          {members.length === 0 && (
            <div className="col-span-full text-center py-12">
              <span className="text-6xl mb-4 block">👥</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-600">Add team members to start collaborating</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </h2>
              <button
                onClick={() => setShowMemberForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="QA">QA</option>
                  </select>
                </div>
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
                      {editingMember ? 'Updating...' : 'Adding...'}
                    </>
                  ) : editingMember ? 'Update Member' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
