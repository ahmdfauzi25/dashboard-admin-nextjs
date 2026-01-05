'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'

export default function OTPManagementPage() {
  const router = useRouter()
  const { isDarkMode } = useTheme()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('templates') // templates, logs, blacklist
  const [templates, setTemplates] = useState([])
  const [otpLogs, setOtpLogs] = useState([])
  const [blacklist, setBlacklist] = useState([])
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [showAddBlacklist, setShowAddBlacklist] = useState(false)
  const [error, setError] = useState(null)

  // Fetch user and check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' })
        if (!res.ok) {
          router.push('/')
          return
        }
        
        const data = await res.json()
        const role = data.user?.role?.toUpperCase()

        // Only ADMIN can access OTP Management
        if (role !== 'ADMIN') {
          setError('Only Admin can access OTP Management')
          setLoading(false)
          return
        }

        setUser(data.user)
        setLoading(false)
        fetchTemplates()
        fetchOtpLogs()
        fetchBlacklist()
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/')
      }
    }

    checkAuth()
  }, [router])

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/otp/templates', {
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        setTemplates(data.templates || [])
      } else {
        console.error('Fetch templates error:', data.error)
      }
    } catch (error) {
      console.error('Fetch templates error:', error)
    }
  }

  const fetchOtpLogs = async () => {
    try {
      const res = await fetch('/api/admin/otp/logs?limit=50', {
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        setOtpLogs(data.logs || [])
      } else {
        console.error('Fetch logs error:', data.error)
      }
    } catch (error) {
      console.error('Fetch logs error:', error)
    }
  }

  const fetchBlacklist = async () => {
    try {
      const res = await fetch('/api/admin/blacklist', {
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        setBlacklist(data.items || [])
      } else {
        console.error('Fetch blacklist error:', data.error)
      }
    } catch (error) {
      console.error('Fetch blacklist error:', error)
    }
  }

  const updateTemplate = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/admin/otp/templates`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate),
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        setEditingTemplate(null)
        fetchTemplates()
        alert('Template updated successfully!')
      } else {
        alert('Failed to update template: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Update template error:', error)
      alert('Error updating template')
    }
  }

  const removeBlacklistItem = async (id) => {
    if (!confirm('Remove from blacklist?')) return

    try {
      const res = await fetch(`/api/admin/blacklist/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        fetchBlacklist()
        alert('Item removed from blacklist')
      } else {
        alert('Failed to remove: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Remove blacklist error:', error)
      alert('Error removing item')
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          </div>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow-sm p-6 transition-colors`}>
        <div className={`mb-6 p-4 border rounded-md ${isDarkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow-sm p-6 transition-colors`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            OTP Management
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Admin Panel - Manage OTP templates, view logs, and manage blacklist
          </p>
        </div>

        {/* Tabs */}
        <div className={`flex border-b mb-8 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'templates'
                ? 'border-violet-500 text-violet-600'
                : isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            OTP Templates
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'logs'
                ? 'border-violet-500 text-violet-600'
                : isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            OTP Logs
          </button>
          <button
            onClick={() => setActiveTab('blacklist')}
            className={`px-6 py-3 font-medium border-b-2 transition ${
              activeTab === 'blacklist'
                ? 'border-violet-500 text-violet-600'
                : isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Blacklist
          </button>
        </div>

        {/* TEMPLATES TAB */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {templates.length === 0 ? (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No templates found
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className={`rounded-lg shadow p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {template.channel?.toUpperCase() || 'UNKNOWN'} OTP Template
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Variables: {'{{OTP_CODE}}'} - 6 digit OTP code
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition"
                    >
                      Edit
                    </button>
                  </div>

                  <div className={`p-4 rounded mb-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
                    <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {template.template_text}
                    </p>
                  </div>

                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Last updated: {template.updated_at ? new Date(template.updated_at).toLocaleString() : 'N/A'}
                  </div>
                </div>
              ))
            )}

            {/* Edit Modal */}
            {editingTemplate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`rounded-lg p-8 max-w-2xl w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Edit {editingTemplate.channel?.toUpperCase() || 'UNKNOWN'} Template
                  </h2>

                  <form onSubmit={updateTemplate} className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Template Text
                      </label>
                      <textarea
                        value={editingTemplate.template_text || ''}
                        onChange={(e) =>
                          setEditingTemplate({
                            ...editingTemplate,
                            template_text: e.target.value
                          })
                        }
                        className={`w-full px-4 py-2 border rounded ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                        rows="6"
                        placeholder="Use {{OTP_CODE}} for the 6-digit code"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTemplate(null)}
                        className={`flex-1 px-4 py-2 rounded transition ${isDarkMode ? 'bg-gray-600 text-gray-100 hover:bg-gray-700' : 'bg-gray-300 text-gray-900 hover:bg-gray-400'}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className={`rounded-lg shadow overflow-x-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="w-full text-sm">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                <tr>
                  <th className={`px-6 py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    User ID
                  </th>
                  <th className={`px-6 py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Channel
                  </th>
                  <th className={`px-6 py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {otpLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={`px-6 py-12 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No OTP logs found
                    </td>
                  </tr>
                ) : (
                  otpLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <td className={`px-6 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {log.user_id}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                          {log.channel}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            log.status === 'sent'
                              ? isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                              : log.status === 'verified'
                              ? isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                              : log.status === 'failed'
                              ? isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                              : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className={`px-6 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* BLACKLIST TAB */}
        {activeTab === 'blacklist' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddBlacklist(true)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Add to Blacklist
              </button>
            </div>

            <div className={`rounded-lg shadow overflow-x-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <table className="w-full text-sm">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className={`px-6 py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Type
                    </th>
                    <th className={`px-6 py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Value
                    </th>
                    <th className={`px-6 py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Reason
                    </th>
                    <th className={`px-6 py-3 text-left font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {blacklist.length === 0 ? (
                    <tr>
                      <td colSpan="4" className={`px-6 py-12 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No blacklist items found
                      </td>
                    </tr>
                  ) : (
                    blacklist.map((item) => (
                      <tr
                        key={item.id}
                        className={`border-t ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <td className="px-6 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className={`px-6 py-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {item.value}
                        </td>
                        <td className={`px-6 py-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.reason || '-'}
                        </td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => removeBlacklistItem(item.id)}
                            className={`px-3 py-1 rounded transition ${isDarkMode ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
