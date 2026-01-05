'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

export default function CustomersPage() {
  const { isDarkMode } = useTheme()
  const [customersData, setCustomersData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [showModal, setShowModal] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatar: null
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: entriesPerPage.toString(),
          search: searchTerm
        })
        const response = await fetch(`/api/customers?${params}`, {
          credentials: 'include'
        })
        const result = await response.json()
        
        if (result.success) {
          setCustomersData(result.customers || [])
          setPagination(result.pagination || { page: 1, total: 0, totalPages: 0 })
          setError(null)
        } else {
          setError(result.error || 'Failed to fetch customers')
        }
      } catch (err) {
        console.error('Error fetching customers:', err)
        setError('Error fetching customers from server')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [currentPage, entriesPerPage, searchTerm])

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
  const handleAddCustomer = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    setFormSuccess('')

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setFormError('Semua field wajib diisi')
      setFormLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Password tidak cocok')
      setFormLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setFormError('Password minimal 6 karakter')
      setFormLoading(false)
      return
    }

    try {
      // Create FormData to handle file upload
      const requestData = new FormData()
      requestData.append('name', formData.name)
      requestData.append('email', formData.email)
      requestData.append('password', formData.password)
      requestData.append('role', 'CUSTOMER') // Customer always has CUSTOMER role
      
      if (formData.avatar) {
        requestData.append('avatar', formData.avatar)
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        body: requestData,
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        setFormError(data.error || 'Gagal menambahkan customer')
        setFormLoading(false)
        return
      }

      setFormSuccess('Customer berhasil ditambahkan!')
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        avatar: null
      })

      // Refresh customers list
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: entriesPerPage.toString(),
        search: searchTerm
      })
      const customersResponse = await fetch(`/api/customers?${params}`, {
        credentials: 'include'
      })
      const customersResult = await customersResponse.json()
      if (customersResult.success) {
        setCustomersData(customersResult.customers || [])
        setPagination(customersResult.pagination || { page: 1, total: 0, totalPages: 0 })
      }

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowModal(false)
        setFormSuccess('')
      }, 1500)
    } catch (error) {
      console.error('Error adding customer:', error)
      setFormError('Terjadi kesalahan. Silakan coba lagi.')
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
      avatar: null
    })
    setFormError('')
    setFormSuccess('')
  }

  // Filter data based on search
  const filteredData = customersData.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const totalPages = pagination.totalPages || Math.ceil(filteredData.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + entriesPerPage)

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow-sm p-6 transition-colors`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Customers</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-violet-600 text-white font-medium rounded-md hover:bg-violet-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Tambah Customer</span>
        </button>
      </div>

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
            <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading customers...</p>
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
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>User</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Avatar</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Role</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Created At</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={`px-6 py-12 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No customers found
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((customer) => (
                    <tr key={customer.id} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-violet-400' : 'text-violet-600'}`}>{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.avatar ? (
                          <img 
                            src={customer.avatar} 
                            alt={customer.name}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={e => { 
                              e.target.onerror = null
                              e.target.src = '/img/user.png'
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-violet-200 text-violet-700 font-bold">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{customer.email}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{customer.role}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
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
            Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredData.length)} of {pagination.total || filteredData.length} entries
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto transition-colors`}>
            {/* Modal Header */}
            <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-8 py-6 flex items-center justify-between transition-colors`}>
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Tambah Customer Baru</h3>
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
                <div className={`mb-6 border rounded-md px-4 py-3 text-sm ${isDarkMode ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-700'}`}>
                  {formSuccess}
                </div>
              )}

              {/* Error Message */}
              {formError && (
                <div className={`mb-6 border rounded-md px-4 py-3 text-sm ${isDarkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddCustomer} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Masukkan nama lengkap"
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
                    placeholder="Masukkan email address"
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
                      placeholder="Masukkan password (min. 6 karakter)"
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
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleFormChange}
                      placeholder="Konfirmasi password"
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

                {/* Avatar Field */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Avatar (Opsional)
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
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-2 bg-violet-600 text-white font-medium rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'Menambahkan...' : 'Tambah Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
