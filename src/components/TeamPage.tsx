import { useState, useEffect } from 'react'

interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [memberForm, setMemberForm] = useState({ name: '', email: '', role: 'Developer' })

  // Mock data for demonstration
  useEffect(() => {
    setMembers([
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Developer', createdAt: '2024-01-15' },
      { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', role: 'Designer', createdAt: '2024-01-20' },
      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Manager', createdAt: '2024-02-01' }
    ])
  }, [])

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    const newMember: TeamMember = {
      id: Date.now(),
      ...memberForm,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setMembers([...members, newMember])
    setMemberForm({ name: '', email: '', role: 'Developer' })
    setShowMemberForm(false)
  }

  const handleDeleteMember = (id: number) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setMembers(members.filter(m => m.id !== id))
    }
  }

  const MemberCard = ({ member }: { member: TeamMember }) => (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
            <p className="text-gray-600">{member.email}</p>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                member.role === 'Manager' ? 'bg-purple-100 text-purple-800' :
                member.role === 'Designer' ? 'bg-pink-100 text-pink-800' :
                member.role === 'Developer' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {member.role}
              </span>
              <span className="text-xs text-gray-500">
                📅 Joined: {new Date(member.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => handleDeleteMember(member.id)}
          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
        >
          🗑️
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Team</h1>
        <p className="text-gray-600">Manage your team members</p>
      </div>

      {/* Team Members Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
          <button
            onClick={() => setShowMemberForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add Member</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
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
              <h2 className="text-lg font-medium text-gray-900">Add Team Member</h2>
              <button
                onClick={() => setShowMemberForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Manager">Manager</option>
                  <option value="QA">QA</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMemberForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
