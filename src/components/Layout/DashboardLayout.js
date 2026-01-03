'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar/Sidebar'
import { useTheme } from '@/context/ThemeContext'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [userData, setUserData] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Determine if sidebar should be visually open (either permanently or on hover)
  const isSidebarVisuallyOpen = isSidebarOpen || isHovering

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/me')
        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [])

  // Open profile modal
  const openProfileModal = () => {
    setProfileLoading(true)
    setIsProfileDropdownOpen(false)
    
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/me')
        if (response.ok) {
          const data = await response.json()
          setUserData(data.user)
          setShowProfileModal(true)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        alert('Failed to load profile')
      } finally {
        setProfileLoading(false)
      }
    }

    fetchProfile()
  }

  // Handle logout
  const handleLogout = async () => {
    setLogoutLoading(true)
    
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        alert('✓ Logged out successfully!')
        // Clear user data
        localStorage.removeItem('user')
        // Redirect to login
        router.push('/')
      } else {
        alert('Failed to logout')
        setLogoutLoading(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('An error occurred during logout')
      setLogoutLoading(false)
    }
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} ${isSidebarVisuallyOpen ? 'md:pl-64' : 'md:pl-16'} transition-all duration-300 ease-in-out`}>

      {/* Sidebar */}
      <aside 
        onMouseEnter={() => !isSidebarOpen && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`fixed left-0 top-0 md:fixed md:flex flex-col h-full bg-white shadow-xl transform ${isSidebarVisuallyOpen ? 'translate-x-0 w-64' : '-translate-x-full w-16'} md:translate-x-0 transition-all duration-300 ease-in-out z-50`}>
        <div className="flex items-center justify-between px-4">
          {/* Toggle Button for mobile */}
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-700 focus:outline-none focus:text-violet-500 md:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/> 
            </svg>
          </button>
        </div>

        {/* Navigasi Sidebar */}
        <Sidebar isSidebarOpen={isSidebarVisuallyOpen} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-20 overflow-hidden">
        {/* Navbar */}
        <header className={`flex items-center justify-between ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm py-4 px-6 relative z-20 border-b transition-colors`}>
          {/* Sidebar toggle button */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`${isDarkMode ? 'text-gray-300 hover:text-violet-400' : 'text-gray-700 hover:text-violet-600'} focus:outline-none focus:text-violet-500 transition-colors`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>

          <div className="flex-1"></div>

          {/* User Menu / Notifications / Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            {/* Dark/Light Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors duration-200 ${isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500`}
            >
              {isDarkMode ? (
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              )}
            </button>
            
            {/* Notification Icon */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200 relative ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className={`absolute right-0 top-14 w-72 rounded-lg shadow-lg z-50 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                        <p className={`text-sm ${notif.type === 'success' ? 'text-green-600' : notif.type === 'error' ? 'text-red-600' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 rounded-full pr-2 py-1 px-2 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {userData?.avatarBase64 ? (
                  <img
                    className="h-9 w-9 rounded-full object-cover border-2 border-violet-200"
                    src={`data:image/png;base64,${userData.avatarBase64}`}
                    alt="User avatar"
                    onError={e => { e.target.onerror = null; e.target.src = '/img/user.png'; }}
                  />
                ) : userData?.name ? (
                  <div className="h-9 w-9 flex items-center justify-center rounded-full bg-violet-200 text-violet-700 font-bold border-2 border-violet-200">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <img
                    className="h-9 w-9 rounded-full object-cover border-2 border-violet-200"
                    src="/img/user.png"
                    alt="Default avatar"
                  />
                )}
                <span className={`hidden md:block font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{userData?.name || 'User'}</span>
                <svg className={`h-5 w-5 transition-transform ${isDarkMode ? 'text-gray-400' : 'text-gray-400'} ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="py-1">
                    <button
                      onClick={openProfileModal}
                      disabled={profileLoading}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-2 disabled:opacity-50 ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{profileLoading ? 'Loading...' : 'My Profile'}</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      disabled={logoutLoading}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>{logoutLoading ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>


        {/* Page content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors`}>
          {children}
        </main>

        {/* Footer */}
        <footer className={`w-full py-4 px-6 text-center text-xs font-medium border-t ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'} transition-colors`}>
          Dashboard Apps v1.0 &mdash; Create by <span className="font-semibold text-violet-600">ahzidev</span>
        </footer>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-violet-600 to-violet-700 px-8 py-6 flex items-center justify-between rounded-t-lg">
                <h3 className="text-2xl font-bold text-white">My Profile</h3>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-6">
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex justify-center">
                    {userData?.avatarBase64 ? (
                      <img
                        className="h-20 w-20 rounded-full object-cover border-4 border-violet-200"
                        src={`data:image/png;base64,${userData.avatarBase64}`}
                        alt="User avatar"
                        onError={e => { e.target.onerror = null; e.target.src = '/img/user.png'; }}
                      />
                    ) : userData?.name ? (
                      <div className="h-20 w-20 flex items-center justify-center rounded-full bg-violet-200 text-violet-700 text-4xl font-bold border-4 border-violet-200">
                        {userData.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <img
                        className="h-20 w-20 rounded-full object-cover border-4 border-violet-200"
                        src="/img/user.png"
                        alt="Default avatar"
                      />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Full Name
                      </label>
                      <p className="text-lg font-semibold text-gray-900">
                        {userData?.name || 'N/A'}
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email Address
                      </label>
                      <p className="text-gray-700 break-all">
                        {userData?.email || 'N/A'}
                      </p>
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Role
                      </label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        userData?.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800'
                          : userData?.role === 'MODERATOR'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {userData?.role || 'N/A'}
                      </span>
                    </div>

                    {/* Created At */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Member Since
                      </label>
                      <p className="text-gray-600 text-sm">
                        {userData?.createdAt 
                          ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-8 py-4 rounded-b-lg border-t border-gray-200">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full px-4 py-2 bg-violet-600 text-white font-medium rounded-md hover:bg-violet-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
