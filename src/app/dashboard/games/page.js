'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

export default function GamesPage() {
  const { isDarkMode } = useTheme()
  const [games, setGames] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGameModal, setShowGameModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingGame, setEditingGame] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [selectedGameForProducts, setSelectedGameForProducts] = useState(null)
  const [activeTab, setActiveTab] = useState('games') // games, products, categories

  const [gameForm, setGameForm] = useState({
    name: '',
    developer: '',
    region: '',
    input_type: 'ID',
    category_id: '',
    image_url: '',
    description: '',
    is_active: true
  })

  const [productForm, setProductForm] = useState({
    game_id: '',
    name: '',
    price: '',
    description: '',
    is_active: true
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchGames()
    fetchCategories()
    fetchProducts()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games')
      const data = await response.json()
      if (data.success) {
        setGames(data.games)
      }
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async (gameId = null) => {
    try {
      const url = gameId ? `/api/products?game_id=${gameId}` : '/api/products'
      const response = await fetch(url)
      const data = await response.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  // Game CRUD
  const handleGameSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingGame ? `/api/games/${editingGame.id}` : '/api/games'
      const method = editingGame ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameForm)
      })

      const data = await response.json()
      if (data.success) {
        alert(data.message)
        fetchGames()
        closeGameModal()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error saving game:', error)
      alert('Failed to save game')
    }
  }

  const handleDeleteGame = async (id) => {
    if (!confirm('Are you sure you want to delete this game?')) return

    try {
      const response = await fetch(`/api/games/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        alert(data.message)
        fetchGames()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error deleting game:', error)
      alert('Failed to delete game')
    }
  }

  const openGameModal = (game = null) => {
    if (game) {
      setEditingGame(game)
      setGameForm({
        name: game.name,
        developer: game.developer,
        region: game.region,
        input_type: game.input_type,
        category_id: game.category_id || '',
        image_url: game.image_url || '',
        description: game.description || '',
        is_active: game.is_active
      })
    } else {
      setEditingGame(null)
      setGameForm({
        name: '',
        developer: '',
        region: '',
        input_type: 'ID',
        category_id: '',
        image_url: '',
        description: '',
        is_active: true
      })
    }
    setShowGameModal(true)
  }

  const closeGameModal = () => {
    setShowGameModal(false)
    setEditingGame(null)
  }

  // Product CRUD
  const handleProductSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      })

      const data = await response.json()
      if (data.success) {
        alert(data.message)
        fetchProducts(selectedGameForProducts)
        closeProductModal()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        alert(data.message)
        fetchProducts(selectedGameForProducts)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const openProductModal = (product = null, gameId = null) => {
    if (product) {
      setEditingProduct(product)
      setProductForm({
        game_id: product.game_id,
        name: product.name,
        price: product.price,
        description: product.description || '',
        is_active: product.is_active
      })
    } else {
      setEditingProduct(null)
      setProductForm({
        game_id: gameId || '',
        name: '',
        price: '',
        description: '',
        is_active: true
      })
    }
    setShowProductModal(true)
  }

  const closeProductModal = () => {
    setShowProductModal(false)
    setEditingProduct(null)
  }

  // Category CRUD
  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })

      const data = await response.json()
      if (data.success) {
        alert(data.message)
        fetchCategories()
        closeCategoryModal()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Failed to save category')
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        alert(data.message)
        fetchCategories()
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({
        name: category.name,
        description: category.description || ''
      })
    } else {
      setEditingCategory(null)
      setCategoryForm({
        name: '',
        description: ''
      })
    }
    setShowCategoryModal(true)
  }

  const closeCategoryModal = () => {
    setShowCategoryModal(false)
    setEditingCategory(null)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Main Container with Header, Tabs and Content */}
        <div className={`rounded-lg shadow-md border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Header */}
          <div className={`p-6 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Game Management
            </h1>
          </div>

          {/* Tabs */}
          <div className={`flex space-x-1 p-4 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
            <button
              onClick={() => setActiveTab('games')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'games'
                  ? 'bg-violet-600 text-white shadow'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Games
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'products'
                  ? 'bg-violet-600 text-white shadow'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Products / Denominations
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'categories'
                  ? 'bg-violet-600 text-white shadow'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Categories
            </button>
          </div>

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div>
            <div className={`p-6 flex justify-between items-center ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Games List
              </h2>
              <button
                onClick={() => openGameModal()}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                + Add Game
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Game Name
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Developer
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Region
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Input Type
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Category
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {games.map((game) => (
                    <tr key={game.id} className={isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="font-medium">{game.name}</div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {game.developer}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {game.region}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {game.input_type === 'ID_SERVER' ? 'ID + Server' : 'ID Only'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {game.category_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${game.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {game.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => {
                            setSelectedGameForProducts(game.id)
                            fetchProducts(game.id)
                            setActiveTab('products')
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Products
                        </button>
                        <button
                          onClick={() => openGameModal(game)}
                          className="text-violet-600 hover:text-violet-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGame(game.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className={`p-6 space-y-4 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Products / Denominations
                </h2>
                <button
                  onClick={() => openProductModal(null, selectedGameForProducts)}
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  + Add Product
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Filter by Game:
                </label>
                <select
                  value={selectedGameForProducts || ''}
                  onChange={(e) => {
                    const gameId = e.target.value || null
                    setSelectedGameForProducts(gameId)
                    fetchProducts(gameId)
                  }}
                  className={`px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Games</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Game
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Product Name
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Price
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Description
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {products.map((product) => (
                    <tr key={product.id} className={isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {product.game_name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="font-medium">{product.name}</div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(product.price)}
                        </span>
                      </td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {product.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => openProductModal(product)}
                          className="text-violet-600 hover:text-violet-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className={`p-6 flex justify-between items-center ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Game Categories
              </h2>
              <button
                onClick={() => openCategoryModal()}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                + Add Category
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Category Name
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Description
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {categories.map((category) => (
                    <tr key={category.id} className={isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        <div className="font-medium">{category.name}</div>
                      </td>
                      <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {category.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => openCategoryModal(category)}
                          className="text-violet-600 hover:text-violet-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Game Modal */}
      {showGameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-xl font-bold text-white">
                {editingGame ? 'Edit Game' : 'Add New Game'}
              </h3>
              <button
                onClick={closeGameModal}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleGameSubmit} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Game Name *
                </label>
                <input
                  type="text"
                  value={gameForm.name}
                  onChange={(e) => setGameForm({ ...gameForm, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Developer *
                </label>
                <input
                  type="text"
                  value={gameForm.developer}
                  onChange={(e) => setGameForm({ ...gameForm, developer: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Region *
                </label>
                <input
                  type="text"
                  value={gameForm.region}
                  onChange={(e) => setGameForm({ ...gameForm, region: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., Southeast Asia, Global"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Input Type *
                </label>
                <select
                  value={gameForm.input_type}
                  onChange={(e) => setGameForm({ ...gameForm, input_type: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="ID">ID Only</option>
                  <option value="ID_SERVER">ID + Server</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category
                </label>
                <select
                  value={gameForm.category_id}
                  onChange={(e) => setGameForm({ ...gameForm, category_id: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Image URL
                </label>
                <input
                  type="text"
                  value={gameForm.image_url}
                  onChange={(e) => setGameForm({ ...gameForm, image_url: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="https://example.com/image.png"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={gameForm.description}
                  onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows="3"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="game_active"
                  checked={gameForm.is_active}
                  onChange={(e) => setGameForm({ ...gameForm, is_active: e.target.checked })}
                  className="h-4 w-4 text-violet-600 rounded"
                />
                <label htmlFor="game_active" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeGameModal}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                >
                  {editingGame ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-xl font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={closeProductModal}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Game *
                </label>
                <select
                  value={productForm.game_id}
                  onChange={(e) => setProductForm({ ...productForm, game_id: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="">Select Game</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="e.g., 86 Diamonds"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Price (IDR) *
                </label>
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows="3"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="product_active"
                  checked={productForm.is_active}
                  onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                  className="h-4 w-4 text-violet-600 rounded"
                />
                <label htmlFor="product_active" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                >
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg shadow-xl max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-xl font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={closeCategoryModal}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
