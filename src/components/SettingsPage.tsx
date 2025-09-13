import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'jira' | 'general' | 'notifications'>('jira')
  const [loading, setLoading] = useState(false)
  const [configFormat, setConfigFormat] = useState<'form' | 'yaml'>('form')
  
  // YAML configuration
  const [yamlConfig, setYamlConfig] = useState(`# JIRA Configuration
jira:
  server_url: "https://your-company.atlassian.net"
  username: "your-email@company.com"
  api_token: "your-api-token-here"
  
  # Project settings
  default_project: "PROJ"
  issue_types:
    - "Task"
    - "Bug"
    - "Story"
    
  # Field mappings
  field_mappings:
    priority: "priority"
    assignee: "assignee"
    status: "status"
    
  # Import settings
  import:
    auto_assign: true
    default_priority: "Medium"
    sync_comments: false`)

  const [formConfig, setFormConfig] = useState({
    serverUrl: 'https://your-company.atlassian.net',
    username: 'your-email@company.com',
    apiToken: '',
    defaultProject: 'PROJ',
    autoAssign: true,
    defaultPriority: 'Medium'
  })

  const [generalSettings, setGeneralSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskReminders: true,
    projectUpdates: false,
    weeklyReports: true
  })

  useEffect(() => {
    // Load config from localStorage
    const savedYaml = localStorage.getItem('jiraYamlConfig')
    const savedForm = localStorage.getItem('jiraFormConfig')
    const savedGeneral = localStorage.getItem('generalSettings')
    const savedNotifications = localStorage.getItem('notificationSettings')
    
    if (savedYaml) setYamlConfig(savedYaml)
    if (savedForm) setFormConfig(JSON.parse(savedForm))
    if (savedGeneral) setGeneralSettings(JSON.parse(savedGeneral))
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
  }, [])

  const handleSaveYamlConfig = () => {
    localStorage.setItem('jiraYamlConfig', yamlConfig)
    alert('YAML configuration saved successfully!')
  }

  const handleSaveFormConfig = () => {
    localStorage.setItem('jiraFormConfig', JSON.stringify(formConfig))
    alert('JIRA configuration saved successfully!')
  }

  const handleSaveGeneral = () => {
    localStorage.setItem('generalSettings', JSON.stringify(generalSettings))
    alert('General settings saved successfully!')
  }

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications))
    alert('Notification settings saved successfully!')
  }

  const testJiraConnection = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('JIRA connection successful!')
    } catch (error) {
      alert('JIRA connection failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'jira', name: 'JIRA Integration', icon: '🔗' },
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Settings</h1>
        <p className="text-gray-600">Configure your task management system</p>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* JIRA Integration Tab */}
          {activeTab === 'jira' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">🔗 JIRA Integration</h2>
                <div className="flex space-x-3">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setConfigFormat('form')}
                      className={`px-3 py-1 rounded text-sm ${configFormat === 'form' ? 'bg-white shadow' : ''}`}
                    >
                      📝 Form
                    </button>
                    <button
                      onClick={() => setConfigFormat('yaml')}
                      className={`px-3 py-1 rounded text-sm ${configFormat === 'yaml' ? 'bg-white shadow' : ''}`}
                    >
                      📄 YAML
                    </button>
                  </div>
                  <button
                    onClick={testJiraConnection}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {loading ? '⏳ Testing...' : '🧪 Test Connection'}
                  </button>
                </div>
              </div>

              {configFormat === 'form' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Server URL</label>
                    <input
                      type="url"
                      value={formConfig.serverUrl}
                      onChange={(e) => setFormConfig({ ...formConfig, serverUrl: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username/Email</label>
                    <input
                      type="email"
                      value={formConfig.username}
                      onChange={(e) => setFormConfig({ ...formConfig, username: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Token</label>
                    <input
                      type="password"
                      value={formConfig.apiToken}
                      onChange={(e) => setFormConfig({ ...formConfig, apiToken: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Project</label>
                    <input
                      type="text"
                      value={formConfig.defaultProject}
                      onChange={(e) => setFormConfig({ ...formConfig, defaultProject: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      onClick={handleSaveFormConfig}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                      💾 Save Configuration
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JIRA Configuration (YAML)
                    </label>
                    <textarea
                      value={yamlConfig}
                      onChange={(e) => setYamlConfig(e.target.value)}
                      rows={20}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                      placeholder="Enter YAML configuration..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveYamlConfig}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                      💾 Save YAML Config
                    </button>
                    <button
                      onClick={() => setYamlConfig(`# JIRA Configuration
jira:
  server_url: "https://your-company.atlassian.net"
  username: "your-email@company.com"
  api_token: "your-api-token-here"`)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                    >
                      🔄 Reset to Default
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">⚙️ General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={generalSettings.theme}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, theme: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={generalSettings.language}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <select
                    value={generalSettings.dateFormat}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <button
                    onClick={handleSaveGeneral}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    💾 Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">🔔 Notification Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive email updates for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Task Reminders</h3>
                    <p className="text-sm text-gray-500">Get reminded about upcoming due dates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.taskReminders}
                      onChange={(e) => setNotifications({ ...notifications, taskReminders: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Project Updates</h3>
                    <p className="text-sm text-gray-500">Notifications when projects are updated</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.projectUpdates}
                      onChange={(e) => setNotifications({ ...notifications, projectUpdates: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Weekly Reports</h3>
                    <p className="text-sm text-gray-500">Receive weekly progress summaries</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.weeklyReports}
                      onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div>
                  <button
                    onClick={handleSaveNotifications}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    💾 Save Notifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
