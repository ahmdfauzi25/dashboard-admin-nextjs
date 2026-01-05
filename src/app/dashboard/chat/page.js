'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useSearchParams } from 'next/navigation'

export default function ChatPage() {
  const { isDarkMode } = useTheme()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchCurrentUser()
    fetchChatUsers()
  }, [])

  // Handle URL parameter for selecting user
  useEffect(() => {
    const userId = searchParams.get('user')
    if (userId && users.length > 0) {
      const user = users.find(u => u.id === parseInt(userId))
      if (user) {
        setSelectedUser(user)
      }
    }
  }, [searchParams, users])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id)
      const interval = setInterval(() => {
        fetchMessages(selectedUser.id)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/me')
      const data = await response.json()
      if (data.success) {
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchChatUsers = async () => {
    try {
      const response = await fetch('/api/messages/users')
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
        // Only set first user if no URL parameter
        if (data.users.length > 0 && !selectedUser && !searchParams.get('user')) {
          setSelectedUser(data.users[0])
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(`/api/messages?user_id=${userId}`)
      const data = await response.json()
      if (data.success) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      
      setSelectedFile(file)
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrl(reader.result)
        }
        reader.readAsDataURL(file)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownloadImage = (imageUrl, filename = 'image') => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openLightbox = (imageUrl) => {
    setLightboxImage(imageUrl)
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || !selectedUser) return

    setSending(true)
    try {
      let imageUrl = null
      
      // If there's a file, convert to base64
      if (selectedFile) {
        const reader = new FileReader()
        imageUrl = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })
        console.log('Image base64 length:', imageUrl?.length)
        console.log('Image base64 preview:', imageUrl?.substring(0, 100))
      }

      const payload = {
        receiver_id: selectedUser.id,
        message: newMessage.trim() || '📎 File attachment',
        image_url: imageUrl
      }
      
      console.log('Sending message with image:', {
        has_image: !!imageUrl,
        message_length: payload.message.length,
        image_url_length: imageUrl?.length
      })

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      console.log('Message response:', data)
      
      if (data.success && data.data) {
        console.log('Received message data:', {
          has_image: data.data.has_image,
          image_url_length: data.data.image_url?.length,
          image_url_preview: data.data.image_url?.substring(0, 100)
        })
        setMessages([...messages, data.data])
        setNewMessage('')
        handleRemoveFile()
        fetchChatUsers()
      } else {
        console.error('Failed to send message:', data)
        alert('Failed to send message: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} mins ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex">
      {/* Users List Sidebar */}
      <div className={`w-80 border-r flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`p-4 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Chats
          </h2>
          {(currentUser?.role === 'RESELLER' || currentUser?.role === 'reseller') && (
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Contact Administrator
            </p>
          )}
        </div>
        
        {/* Search Box */}
        <div className={`p-3 ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-violet-500`}
            />
            <svg className={`absolute left-3 top-2.5 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <div className={`p-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <svg className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-medium mb-2">No users available</p>
              <p className="text-xs">
                {currentUser?.role === 'ADMIN' || currentUser?.role === 'admin' 
                  ? 'No resellers found. Create a reseller account to start chatting.'
                  : 'No admins found. Please contact support.'}
              </p>
            </div>
          ) : (
            users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full px-4 py-3 flex items-center space-x-3 transition-colors ${
                  selectedUser?.id === user.id
                    ? isDarkMode
                      ? 'bg-gray-700'
                      : 'bg-violet-50'
                    : isDarkMode
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-50'
                } ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}
              >
                <div className="relative flex-shrink-0">
                  {user.avatarBase64 ? (
                    <img
                      src={`data:image/png;base64,${user.avatarBase64}`}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = '/img/user.png'
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </h3>
                  </div>
                  <p className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.role === 'admin' || user.role === 'ADMIN' ? 'Administrator' : 'Reseller'}
                  </p>
                  {user.last_message && (
                    <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user.last_message}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className={`px-6 py-4 flex items-center justify-between ${isDarkMode ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {selectedUser.avatarBase64 ? (
                    <img
                      src={`data:image/png;base64,${selectedUser.avatarBase64}`}
                      alt={selectedUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = '/img/user.png'
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-white font-bold text-lg">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedUser.name}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedUser.role === 'reseller' || selectedUser.role === 'RESELLER' ? 'Reseller' : 'Administrator'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isOwn = currentUser && msg.sender_id === currentUser.id
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-start space-x-3`}>
                    {!isOwn && (
                      selectedUser.avatarBase64 ? (
                        <img
                          src={`data:image/png;base64,${selectedUser.avatarBase64}`}
                          alt={msg.sender_name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = '/img/user.png'
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-white font-bold flex-shrink-0">
                          {msg.sender_name.charAt(0).toUpperCase()}
                        </div>
                      )
                    )}
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-md`}>
                      {!isOwn && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {msg.sender_name}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-violet-600 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-200'
                            : 'bg-gray-100 text-gray-900'
                      }`}>
                        {(msg.has_image && msg.image_url) ? (
                          <div className="mb-2 relative group">
                            <img
                              src={msg.image_url}
                              alt="Attachment"
                              className="rounded-lg max-w-xs cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => openLightbox(msg.image_url)}
                              style={{ maxHeight: '300px', width: 'auto' }}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownloadImage(msg.image_url, `image-${msg.id}.png`)
                              }}
                              className={`absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                                isOwn ? 'bg-violet-700 hover:bg-violet-800' : isDarkMode ? 'bg-gray-800 hover:bg-gray-900' : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                              title="Download image"
                            >
                              <svg className={`w-4 h-4 ${isOwn ? 'text-white' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          </div>
                        ) : null}
                        {msg.message && msg.message !== '📎 File attachment' && (
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        )}
                      </div>
                      {isOwn && (
                        <span className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          {formatTime(msg.created_at)}
                        </span>
                      )}
                    </div>
                    {isOwn && currentUser && (
                      currentUser.avatarBase64 ? (
                        <img
                          src={`data:image/png;base64,${currentUser.avatarBase64}`}
                          alt="You"
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = '/img/user.png'
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-white font-bold flex-shrink-0">
                          {currentUser.name && currentUser.name.charAt(0).toUpperCase()}
                        </div>
                      )
                    )}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className={`p-4 ${isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
              {/* File Preview */}
              {selectedFile && (
                <div className={`mb-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between`}>
                  <div className="flex items-center space-x-3">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className={`w-16 h-16 flex items-center justify-center rounded ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedFile.name}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    type="button"
                    className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-colors`}
                  >
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  title="Attach file"
                >
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
                  title="Attach image"
                >
                  <svg className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message"
                  disabled={sending}
                  className={`flex-1 px-4 py-3 rounded-full border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 transition-all`}
                />
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || sending}
                  className="p-3 rounded-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {sending ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <svg className={`w-16 h-16 mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {currentUser?.role === 'RESELLER' || currentUser?.role === 'reseller' 
                ? 'Select an admin to start chatting' 
                : 'Select a user to start chatting'}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {users.length > 0 
                ? 'Choose from the list on the left to send a message'
                : currentUser?.role === 'RESELLER' || currentUser?.role === 'reseller'
                  ? 'No admins available. Please contact support.'
                  : 'No users available to chat with'}
            </p>
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDownloadImage(lightboxImage, 'image-download.png')
            }}
            className="absolute top-4 right-16 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
            title="Download image"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          <img
            src={lightboxImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
