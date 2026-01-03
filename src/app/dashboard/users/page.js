'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

export default function UsersPage() {
  const { isDarkMode } = useTheme()
  const [usersData, setUsersData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    avatar: null
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormLoading, setEditFormLoading] = useState(false)
  const [editFormError, setEditFormError] = useState('')
  const [editFormSuccess, setEditFormSuccess] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    avatar: null
  })
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(null)

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/users')
        const result = await response.json()
        
        if (result.success) {
          setUsersData(result.data)
          setError(null)
        } else {
          setError(result.message || 'Failed to fetch users')
        }
      } catch (err) {
        console.error('Error fetching users:', err)
        setError('Error fetching users from server')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target
    
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files && files.length > 0 ? files[0] : null
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
    if (formError) setFormError('')
    if (formSuccess) setFormSuccess('')
  }

  // Handle form submission
  const handleAddUser = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    setFormSuccess('')

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('All fields are required')
      setFormLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match')
      setFormLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters')
      setFormLoading(false)
      return
    }

    try {
      // Create FormData to handle file upload
      const requestData = new FormData()
      requestData.append('name', formData.name)
      requestData.append('email', formData.email)
      requestData.append('password', formData.password)
      requestData.append('role', formData.role)
      
      if (formData.avatar) {
        requestData.append('avatar', formData.avatar)
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        body: requestData,
      })

      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error || 'Failed to add user')
        setFormLoading(false)
        return
      }

      setFormSuccess('User added successfully!')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER',
        avatar: null
      })

      // Refresh users list
      const usersResponse = await fetch('/api/users')
      const usersResult = await usersResponse.json()
      if (usersResult.success) {
        setUsersData(usersResult.data)
      }

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowModal(false)
        setFormSuccess('')
      }, 1500)
    } catch (error) {
      console.error('Error adding user:', error)
      setFormError('An error occurred. Please try again.')
      setFormLoading(false)
    }
  }

  // Close modal
  const closeModal = () => {
    setShowModal(false)
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'USER'
    })
    setFormError('')
    setFormSuccess('')
  }

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false)
    setSelectedUserId(null)
    setEditFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'USER'
    })
    setEditFormError('')
    setEditFormSuccess('')
  }

  // Handle edit form input change
  const handleEditFormChange = (e) => {
    const { name, value, type, files } = e.target
    
    if (type === 'file') {
      setEditFormData({
        ...editFormData,
        [name]: files && files.length > 0 ? files[0] : null
      })
    } else {
      setEditFormData({
        ...editFormData,
        [name]: value
      })
    }
    if (editFormError) setEditFormError('')
    if (editFormSuccess) setEditFormSuccess('')
  }

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUserId(user.id)
    setEditFormData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role
    })
    setShowEditModal(true)
  }

  // Handle update user
  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setEditFormLoading(true)
    setEditFormError('')
    setEditFormSuccess('')

    // Validation
    if (!editFormData.name || !editFormData.email) {
      setEditFormError('Name and email are required')
      setEditFormLoading(false)
      return
    }

    // Validate password if provided
    if (editFormData.password && editFormData.password.length < 6) {
      setEditFormError('Password must be at least 6 characters')
      setEditFormLoading(false)
      return
    }

    if (editFormData.password && editFormData.password !== editFormData.confirmPassword) {
      setEditFormError('Passwords do not match')
      setEditFormLoading(false)
      return
    }

    try {
      // Create FormData to handle file upload
      const requestData = new FormData()
      requestData.append('name', editFormData.name)
      requestData.append('email', editFormData.email)
      requestData.append('role', editFormData.role)

      // Only include password if it's being changed
      if (editFormData.password) {
        requestData.append('password', editFormData.password)
      }

      // Only include avatar if a new one is selected
      if (editFormData.avatar) {
        requestData.append('avatar', editFormData.avatar)
      }

      const response = await fetch(`/api/users/${selectedUserId}`, {
        method: 'PUT',
        body: requestData,
      })

      const data = await response.json()

      if (!response.ok) {
        setEditFormError(data.error || 'Failed to update user')
        setEditFormLoading(false)
        return
      }

      setEditFormSuccess('User updated successfully!')

      // Refresh users list
      const usersResponse = await fetch('/api/users')
      const usersResult = await usersResponse.json()
      if (usersResult.success) {
        setUsersData(usersResult.data)
      }

      // Show success alert
      alert('✓ User updated successfully!')

      // Close modal after 1 second
      setTimeout(() => {
        setShowEditModal(false)
        setEditFormSuccess('')
      }, 1000)
    } catch (error) {
      console.error('Error updating user:', error)
      setEditFormError('An error occurred. Please try again.')
      setEditFormLoading(false)
    }
  }

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setDeleteLoading(userId)

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        alert('✗ ' + (data.error || 'Failed to delete user'))
        setDeleteLoading(null)
        return
      }

      // Refresh users list
      const usersResponse = await fetch('/api/users')
      const usersResult = await usersResponse.json()
      if (usersResult.success) {
        setUsersData(usersResult.data)
      }

      // Show success alert
      alert('✓ User deleted successfully!')
      setDeleteLoading(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('✗ An error occurred while deleting user. Please try again.')
      setDeleteLoading(null)
    }
  }

  // Filter data based on search
  const filteredData = usersData.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.office.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filteredData.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage)

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow-sm p-6 transition-colors`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Users</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-violet-600 text-white font-medium rounded-md hover:bg-violet-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah User</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto transition-colors`}>
            {/* Modal Header */}
            <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-6 flex items-center justify-between transition-colors`}>
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Tambah User Baru</h3>
              <button
                onClick={closeModal}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} focus:outline-none transition-colors`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6">
              {/* Success Message */}
              {formSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  {formSuccess}
                </div>
              )}

              {/* Error Message */}
              {formError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddUser} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Enter full name"
                    className={`w-full px-4 py-2 border rounded-md outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-600 focus:border-transparent'}`}
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="Enter email address"
                    className={`w-full px-4 py-2 border rounded-md outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-600 focus:border-transparent'}`}
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder="Enter password (min. 6 characters)"
                      className={`w-full px-4 py-2 pr-12 border rounded-md outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-600 focus:border-transparent'}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} p-1 z-10 transition-colors`}
                      tabIndex="-1"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      placeholder="Confirm password"
                      className={`w-full px-4 py-2 pr-12 border rounded-md outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-600 focus:border-transparent'}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} p-1 z-10 transition-colors`}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Role Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2 border rounded-md outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-violet-600 focus:border-transparent' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-600 focus:border-transparent'}`}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MODERATOR">Moderator</option>
                  </select>
                </div>

                {/* Avatar Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Avatar (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    {formData.avatar && (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(formData.avatar)}
                          alt="Avatar preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-violet-600"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      name="avatar"
                      onChange={handleFormChange}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100"
                    />
                  </div>
                </div>
                {/* Form Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`flex-1 px-4 py-2 border font-medium rounded-md transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-2 bg-violet-600 text-white font-medium rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'Adding User...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto transition-colors`}>
            {/* Modal Header */}
            <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-6 flex items-center justify-between transition-colors`}>
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Edit User</h3>
              <button
                onClick={closeEditModal}
                className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} focus:outline-none transition-colors`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6">
              {/* Success Message */}
              {editFormSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  {editFormSuccess}
                </div>
              )}

              {/* Error Message */}
              {editFormError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {editFormError}
                </div>
              )}

              <form onSubmit={handleUpdateUser} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    placeholder="Enter full name"
                    className={`w-full px-4 py-2 border rounded-md outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-600 focus:border-transparent'}`}
                    required
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditFormChange}
                    placeholder="Enter email address"
                    className={`w-full px-4 py-2 border rounded-md outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-600 focus:border-transparent'}`}
                    required
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Password (Leave empty to keep current password)
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      name="password"
                      value={editFormData.password}
                      onChange={handleEditFormChange}
                      placeholder="Enter new password (min. 6 characters)"
                      className={`w-full px-4 py-2 pr-12 border rounded-md outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-600 focus:border-transparent'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} p-1 z-10 transition-colors`}
                      tabIndex="-1"
                    >
                      {showEditPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showEditConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={editFormData.confirmPassword}
                      onChange={handleEditFormChange}
                      placeholder="Confirm password"
                      className={`w-full px-4 py-2 pr-12 border rounded-md outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-600 focus:border-transparent' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-600 focus:border-transparent'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} p-1 z-10 transition-colors`}
                      tabIndex="-1"
                    >
                      {showEditConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Role Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Role
                  </label>
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditFormChange}
                    className={`w-full px-4 py-2 border rounded-md outline-none transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-2 focus:ring-violet-600 focus:border-transparent' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-violet-600 focus:border-transparent'}`}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MODERATOR">Moderator</option>
                  </select>
                </div>

                {/* Avatar Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar (Optional)
                  </label>
                  <div className="flex items-center space-x-4">
                    {editFormData.avatar && (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(editFormData.avatar)}
                          alt="Avatar preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-violet-600"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      name="avatar"
                      onChange={handleEditFormChange}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100"
                    />
                  </div>
                </div>
                {/* Form Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className={`flex-1 px-4 py-2 border font-medium rounded-md transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editFormLoading}
                    className="flex-1 px-4 py-2 bg-violet-600 text-white font-medium rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editFormLoading ? 'Updating User...' : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className={`mb-6 p-4 border rounded-md ${isDarkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'}`}>
          <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-700'}`}>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            </div>
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading users...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className={`px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-violet-600 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>entries</span>
            </div>

            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className={`w-full px-4 py-2 pl-10 border rounded-md text-sm outline-none focus:ring-2 focus:ring-violet-600 transition-all ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
              />
              <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} absolute left-3 top-1/2 transform -translate-y-1/2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
        <table className={`w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>User</th>              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Avatar</th>              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Role</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary</th> */}
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
            {paginatedData.map((user) => (
              <tr key={user.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img 
                    src={user.avatar || '/img/user.png'} 
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.email}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{user.role}</td>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.age}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.startDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-violet-600">{user.salary}</td> */}
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex">
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deleteLoading === user.id}
                    className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading === user.id ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                  <button 
                    onClick={() => openEditModal(user)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 text-sm border rounded-md transition-colors ${isDarkMode ? 'text-gray-400 border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'}`}
        >
          Previous
        </button>

        <div className="flex items-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                currentPage === page
                  ? 'bg-violet-600 text-white'
                  : isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 text-sm border rounded-md transition-colors ${isDarkMode ? 'text-gray-400 border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed' : 'text-gray-600 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'}`}
        >
          Next
        </button>
      </div>

      {/* Info text */}
      <div className={`text-sm mt-4 text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredData.length)} of {filteredData.length} entries
      </div>
        </>
      )}
    </div>
  )
}
