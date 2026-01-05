'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'

export default function VoucherPromosPage() {
  const { isDarkMode } = useTheme()
  const router = useRouter()
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: 0,
    min_purchase: 0,
    max_discount: null,
    usage_limit: null,
    start_date: '',
    end_date: '',
    is_active: true,
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchVouchers()
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

  const fetchVouchers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/voucher-promos?admin=true&includeInactive=true', {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.success) {
        setVouchers(data.vouchers || [])
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    // Validation
    if (!formData.code.trim() || !formData.name.trim()) {
      setFormError('Code and name are required')
      setFormLoading(false)
      return
    }

    if (!formData.discount_value || formData.discount_value <= 0) {
      setFormError('Discount value must be greater than 0')
      setFormLoading(false)
      return
    }

    if (formData.discount_type === 'PERCENTAGE' && formData.discount_value > 100) {
      setFormError('Percentage discount cannot exceed 100%')
      setFormLoading(false)
      return
    }

    // Validate date range
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (startDate > endDate) {
        setFormError('Start date must be before end date')
        setFormLoading(false)
        return
      }
    }

    try {
      const url = editingVoucher 
        ? `/api/voucher-promos/${editingVoucher.id}`
        : '/api/voucher-promos'
      const method = editingVoucher ? 'PUT' : 'POST'

      // Format dates for API
      let startDate = formData.start_date || null
      let endDate = formData.end_date || null
      
      if (startDate) {
        startDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ')
      }
      if (endDate) {
        endDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ')
      }

      const payload = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        min_purchase: parseFloat(formData.min_purchase) || 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        start_date: startDate,
        end_date: endDate,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert(editingVoucher ? 'Voucher promo updated successfully!' : 'Voucher promo created successfully!')
        setShowModal(false)
        resetForm()
        fetchVouchers()
      } else {
        setFormError(data.error || 'Failed to save voucher promo')
      }
    } catch (error) {
      console.error('Error saving voucher promo:', error)
      setFormError('Error saving voucher promo. Please try again.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (voucher) => {
    setEditingVoucher(voucher)
    setFormData({
      code: voucher.code || '',
      name: voucher.name || '',
      description: voucher.description || '',
      discount_type: voucher.discountType || 'PERCENTAGE',
      discount_value: voucher.discountValue || 0,
      min_purchase: voucher.minPurchase || 0,
      max_discount: voucher.maxDiscount || null,
      usage_limit: voucher.usageLimit || null,
      start_date: voucher.startDate ? new Date(voucher.startDate).toISOString().slice(0, 16) : '',
      end_date: voucher.endDate ? new Date(voucher.endDate).toISOString().slice(0, 16) : '',
      is_active: voucher.isActive !== false,
    })
    setFormError('')
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this voucher promo?')) return

    try {
      const response = await fetch(`/api/voucher-promos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()

      if (data.success) {
        alert('Voucher promo deleted successfully!')
        fetchVouchers()
      } else {
        alert(data.error || 'Failed to delete voucher promo')
      }
    } catch (error) {
      console.error('Error deleting voucher promo:', error)
      alert('Error deleting voucher promo')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discount_type: 'PERCENTAGE',
      discount_value: 0,
      min_purchase: 0,
      max_discount: null,
      usage_limit: null,
      start_date: '',
      end_date: '',
      is_active: true,
    })
    setEditingVoucher(null)
    setFormError('')
  }

  const formatDiscount = (voucher) => {
    if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountValue}%`
    } else {
      return `Rp ${voucher.discountValue.toLocaleString('id-ID')}`
    }
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Voucher Promos
          </h1>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Tambah Voucher
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading vouchers...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No vouchers found. Click "Tambah Voucher" to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className={`rounded-lg overflow-hidden shadow-lg border ${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-bold text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {voucher.code}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      voucher.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {voucher.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <h4 className={`font-semibold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {voucher.name}
                  </h4>
                  
                  {voucher.description && (
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {voucher.description}
                    </p>
                  )}

                  <div className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-3 mb-3`}>
                    <p className="text-white text-sm font-medium">Diskon</p>
                    <p className="text-white text-2xl font-bold">{formatDiscount(voucher)}</p>
                  </div>

                  <div className={`text-xs space-y-1 mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {voucher.minPurchase > 0 && (
                      <p>Min. Pembelian: Rp {voucher.minPurchase.toLocaleString('id-ID')}</p>
                    )}
                    {voucher.maxDiscount && (
                      <p>Max. Diskon: Rp {voucher.maxDiscount.toLocaleString('id-ID')}</p>
                    )}
                    {voucher.usageLimit && (
                      <p>Limit: {voucher.usedCount || 0} / {voucher.usageLimit}</p>
                    )}
                    {voucher.startDate && (
                      <p>Start: {new Date(voucher.startDate).toLocaleDateString('id-ID')}</p>
                    )}
                    {voucher.endDate && (
                      <p>End: {new Date(voucher.endDate).toLocaleDateString('id-ID')}</p>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(voucher)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(voucher.id)}
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
                  {editingVoucher ? 'Edit Voucher Promo' : 'Tambah Voucher Promo Baru'}
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
                      Code * (Unique)
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
                      placeholder="DISKON10"
                    />
                  </div>

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
                      placeholder="Diskon 10%"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Discount Type *
                    </label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      required
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (Rp)</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      required
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={formData.discount_type === 'PERCENTAGE' ? '10' : '20000'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Min. Purchase (Rp)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.min_purchase}
                      onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Max. Discount (Rp) - Only for Percentage
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.max_discount || ''}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value || null })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Optional"
                      disabled={formData.discount_type === 'FIXED'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={formData.usage_limit || ''}
                      onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value || null })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Unlimited if empty"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
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
                    {formLoading ? 'Saving...' : (editingVoucher ? 'Update' : 'Create')}
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

