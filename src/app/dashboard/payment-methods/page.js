'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'

export default function PaymentMethodsPage() {
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'EWALLET',
    logo_url: '',
    description: '',
    fee_percentage: 0,
    fee_fixed: 0,
    is_active: true,
    position: 0,
    min_amount: 0,
    max_amount: 99999999999.99,
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState('')

  useEffect(() => {
    checkAuth()
    fetchPaymentMethods()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/me', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (!response.ok || !data.user || data.user.role?.toUpperCase() !== 'ADMIN') {
        router.push('/')
        return
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/')
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payment-methods?admin=true&includeInactive=true', {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setPaymentMethods(data.paymentMethods || [])
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    // Validation
    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError('Name and code are required')
      setFormLoading(false)
      return
    }

    if (formData.min_amount < 0 || formData.max_amount < formData.min_amount) {
      setFormError('Invalid amount range')
      setFormLoading(false)
      return
    }

    try {
      const url = editingMethod 
        ? `/api/payment-methods/${editingMethod.id}`
        : '/api/payment-methods'
      const method = editingMethod ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        fee_percentage: parseFloat(formData.fee_percentage) || 0,
        fee_fixed: parseFloat(formData.fee_fixed) || 0,
        min_amount: parseFloat(formData.min_amount) || 0,
        max_amount: parseFloat(formData.max_amount) || 999999999.99,
        position: parseInt(formData.position) || 0,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert(editingMethod ? 'Payment method updated successfully!' : 'Payment method created successfully!')
        setShowModal(false)
        resetForm()
        fetchPaymentMethods()
      } else {
        setFormError(data.error || 'Failed to save payment method')
      }
    } catch (error) {
      console.error('Error saving payment method:', error)
      setFormError('Error saving payment method. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (method) => {
    setEditingMethod(method)
    setFormData({
      name: method.name || '',
      code: method.code || '',
      type: method.type || 'EWALLET',
      logo_url: method.logoUrl || '',
      description: method.description || '',
      fee_percentage: method.feePercentage || 0,
      fee_fixed: method.feeFixed || 0,
      is_active: method.isActive !== false,
      position: method.position || 0,
      min_amount: method.minAmount || 0,
      max_amount: method.maxAmount || 999999999.99,
    })
    setLogoPreview(method.logoUrl || '')
    setFormError('')
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return

    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert('Payment method deleted successfully!')
        fetchPaymentMethods()
      } else {
        alert(data.error || 'Failed to delete payment method')
      }
    } catch (error) {
      console.error('Error deleting payment method:', error)
      alert('Error deleting payment method')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'EWALLET',
      logo_url: '',
      description: '',
      fee_percentage: 0,
      fee_fixed: 0,
      is_active: true,
      position: 0,
      min_amount: 0,
      max_amount: 99999999999.99,
    })
    setEditingMethod(null)
    setLogoPreview('')
    setFormError('')
  }

  const handleLogoUrlChange = (e) => {
    const url = e.target.value
    setFormData({ ...formData, logo_url: url })
    setLogoPreview(url)
  }

  const getTypeLabel = (type) => {
    const labels = {
      'EWALLET': 'E-Wallet',
      'BANK_TRANSFER': 'Bank Transfer',
      'VIRTUAL_ACCOUNT': 'Virtual Account',
      'QRIS': 'QRIS',
      'CREDIT_CARD': 'Credit Card',
      'OTHER': 'Other'
    }
    return labels[type] || type
  }

  const getTypeColor = (type) => {
    const colors = {
      'EWALLET': 'bg-blue-100 text-blue-800',
      'BANK_TRANSFER': 'bg-green-100 text-green-800',
      'VIRTUAL_ACCOUNT': 'bg-purple-100 text-purple-800',
      'QRIS': 'bg-yellow-100 text-yellow-800',
      'CREDIT_CARD': 'bg-red-100 text-red-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Payment Methods
          </h1>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Tambah Payment Method
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading payment methods...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No payment methods found. Click "Tambah Payment Method" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`rounded-lg overflow-hidden shadow-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    {method.logoUrl && (
                      <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center flex-shrink-0">
                        <img
                          src={method.logoUrl}
                          alt={method.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            const parent = e.target.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Logo</div>'
                            }
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {method.name}
                      </h3>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {method.code}
                      </p>
                    </div>
                  </div>

                  {method.description && (
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {method.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(method.type)}`}>
                      {getTypeLabel(method.type)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      method.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {method.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pos: {method.position}
                    </span>
                  </div>

                  <div className={`text-xs space-y-1 mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {method.feePercentage > 0 && (
                      <p>Fee: {method.feePercentage}%</p>
                    )}
                    {method.feeFixed > 0 && (
                      <p>Fixed Fee: Rp {method.feeFixed.toLocaleString('id-ID')}</p>
                    )}
                    <p>Min: Rp {method.minAmount.toLocaleString('id-ID')}</p>
                    <p>Max: Rp {method.maxAmount.toLocaleString('id-ID')}</p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(method)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-3xl rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className={`p-6 border-b flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingMethod ? 'Edit Payment Method' : 'Tambah Payment Method Baru'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="e.g., OVO, DANA, BCA"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="e.g., OVO, DANA, BCA"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="EWALLET">E-Wallet</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="VIRTUAL_ACCOUNT">Virtual Account</option>
                    <option value="QRIS">QRIS</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={handleLogoUrlChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="https://example.com/logo.png"
                  />
                  {logoPreview && (
                    <div className="mt-3">
                      <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Preview:
                      </p>
                      <div className="w-24 h-24 bg-white rounded-lg p-2 flex items-center justify-center border border-gray-300">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            const parent = e.target.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">Invalid URL</div>'
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Description of payment method"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fee Percentage (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.fee_percentage}
                      onChange={(e) => setFormData({ ...formData, fee_percentage: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fixed Fee (Rp)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.fee_fixed}
                      onChange={(e) => setFormData({ ...formData, fee_fixed: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Min Amount (Rp)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.min_amount}
                      onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Max Amount (Rp)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.max_amount}
                      onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Position
                    </label>
                    <input
                      type="number"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={formData.is_active ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? 'Saving...' : (editingMethod ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

