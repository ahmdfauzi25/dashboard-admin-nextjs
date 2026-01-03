'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    title: 'MENU',
    links: [
      { 
        name: 'Dashboard', 
        icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', 
        href: '/dashboard',
        subLinks: [
          { name: 'Ecommerce', href: '/dashboard/ecommerce' },
        ]
      },
      { name: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', href: '/dashboard/analytics' },
      { name: 'Marketing', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', href: '/dashboard/marketing' },
      { name: 'CRM', icon: 'M17 20h-2V7a4 4 0 00-8 0v13H5a1 1 0 000 2h14a1 1 0 000-2zM9 7a2 2 0 014 0v13H9V7z', href: '/dashboard/crm' },
      { name: 'Stocks', icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10h2m2 0V7m0 10a2 2 0 01-2 2h-2a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10h2m2 0V7a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2z', href: '/dashboard/stocks' },
      { name: 'SaaS', icon: 'M7 8h10M7 12h10M7 16h10M9 4h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z', href: '/dashboard/saas', badge: 'NEW' },
      { name: 'Logistics', icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4 0V3a1 1 0 011-1h2a1 1 0 011 1v1m-6 0V3a1 1 0 011-1h2a1 1 0 011 1v1', href: '/dashboard/logistics', badge: 'NEW' },
      { name: 'AI Assistant', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', href: '/dashboard/ai-assistant', badge: 'NEW' },
      { name: 'E-commerce', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', href: '/dashboard/e-commerce' },
      { name: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', href: '/dashboard/calendar' },
    ]
  },
  {
    title: 'CALENDAR',
    links: [
      { name: 'User Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', href: '/dashboard/user-profile' },
      { name: 'Users', icon: 'M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646zM12 16C8.582 16 5 17.79 5 20v2h14v-2c0-2.21-3.582-4-7-4z', href: '/dashboard/users' },
      { name: 'Task', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', href: '/dashboard/task' },
      { 
        name: 'Forms', 
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', 
        href: '/dashboard/forms', 
        subLinks: [
          { name: 'Form Elements', href: '/dashboard/forms/elements' },
          { name: 'Form Layout', href: '/dashboard/forms/layout' },
          { name: 'Form Validation', href: '/dashboard/forms/validation' },
        ]
      },
      { 
        name: 'Tables', 
        icon: 'M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', 
        href: '/dashboard/tables', 
        subLinks: [
          { name: 'Table Elements', href: '/dashboard/tables/elements' },
          { name: 'Data Tables', href: '/dashboard/tables/data' },
        ]
      },
      { 
        name: 'Pages', 
        icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', 
        href: '/dashboard/pages', 
        subLinks: [
          { name: 'Settings', href: '/dashboard/pages/settings' },
          { name: 'Blank Page', href: '/dashboard/pages/blank' },
          { name: 'Pricing', href: '/dashboard/pages/pricing' },
          { name: 'Invoice', href: '/dashboard/pages/invoice' },
        ]
      },
    ]
  },
  {
    title: 'SUPPORT',
    links: [
      { name: 'Chat', icon: 'M7 8h10M7 12h10M7 16h10M9 4h6a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2z', href: '/dashboard/chat' },
      { name: 'Support', icon: 'M18.364 5.636l-3.536 3.536m0 0a3 3 0 10-4.243 4.243m4.243-4.243L12 18V9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z', href: '/dashboard/support', badge: 'NEW' },
      { name: 'Email', icon: 'M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207', href: '/dashboard/email', badge: 'NEW' },
    ]
  },
  {
    title: 'OTHERS',
    links: [
      { name: 'Charts', icon: 'M9 19V6l-2 2-2-2-4 4v10a2 2 0 002 2h8a2 2 0 002-2zM4 14h10m-8 0L9 12', href: '/dashboard/charts' },
      { 
        name: 'UI Elements', 
        icon: 'M9 19V6l-2 2-2-2-4 4v10a2 2 0 002 2h8a2 2 0 002-2zM4 14h10m-8 0L9 12', 
        href: '/dashboard/ui-elements', 
        subLinks: [
          { name: 'Alerts', href: '/dashboard/ui-elements/alerts' },
          { name: 'Buttons', href: '/dashboard/ui-elements/buttons' },
          { name: 'Cards', href: '/dashboard/ui-elements/cards' },
        ]
      },
      { name: 'Authentication', icon: 'M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207', href: '/dashboard/authentication' },
    ]
  }
]

function SidebarLink({ item, isSidebarOpen }) {
  const pathname = usePathname()
  const isSubLinkActive = item.subLinks && item.subLinks.some(sub => pathname === sub.href || pathname.startsWith(sub.href))
  const [isOpen, setIsOpen] = useState(isSubLinkActive || false)

  useEffect(() => {
    if (item.subLinks && isSubLinkActive) {
      setIsOpen(true)
    }
  }, [pathname, item.subLinks, isSubLinkActive])

  const isActive = (href) => pathname === href || (item.subLinks && item.subLinks.some(sub => pathname === sub.href || pathname.startsWith(sub.href)))
  const isLinkActive = isActive(item.href)

  const toggleOpen = () => {
    if (item.subLinks) {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div>
      <button
        onClick={toggleOpen}
        className={`flex items-center justify-between w-full rounded-md font-medium transition-colors duration-200 ${isSidebarOpen ? 'py-2.5 px-4 text-sm' : 'py-2 px-2 text-xs'}
          ${isLinkActive ? 'bg-violet-100 text-violet-700' : 'text-gray-700 hover:bg-gray-100'}
        `}
      >
        <Link href={item.href} className={`flex items-center ${isSidebarOpen ? 'flex-grow' : 'justify-center w-full'}`}>
          <svg className={`w-5 h-5 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : 'mr-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}/></svg>
          {isSidebarOpen && <span>{item.name}</span>}
        </Link>
        {isSidebarOpen && item.badge && (
          <span className="ml-auto bg-green-200 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{item.badge}</span>
        )}
        {isSidebarOpen && item.subLinks && (
          <svg
            className={`w-4 h-4 ml-2 transform ${isOpen ? 'rotate-90' : 'rotate-0'} transition-transform duration-225`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
      {isOpen && isSidebarOpen && item.subLinks && (
        <div className="pl-4 pt-2 space-y-1">
          {item.subLinks.map((sub, idx) => (
            <Link 
              key={idx} 
              href={sub.href}
              className={`block py-2 px-4 text-sm font-medium rounded-md transition-colors duration-200
                ${pathname === sub.href || pathname.startsWith(sub.href) ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-100'}
              `}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ isSidebarOpen }) {
  return (
    <div className="w-full h-full bg-white shadow-lg overflow-hidden flex flex-col">
      <div className={`flex-shrink-0 py-7 ${isSidebarOpen ? 'px-6' : 'px-2'}`}>
        <Link href="/dashboard" className={`flex items-center ${isSidebarOpen ? 'space-x-2' : 'justify-center'} text-lg font-bold text-gray-900 transition-all duration-200`}>
          <img src="/img/ico_dash.png" alt="Dashboard Admin Logo" className="h-5 w-auto" />
          {isSidebarOpen && <span>Dashboard Admin</span>}
        </Link>
      </div>
      <nav className="flex-1 mt-8 overflow-hidden">
        {navItems.map((section, index) => (
          <div key={index} className={`${isSidebarOpen ? 'mb-8' : 'mb-4'} ${isSidebarOpen ? 'px-6' : 'px-2'}`}>
            {isSidebarOpen && <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">{section.title}</h3>}
            <div className={isSidebarOpen ? 'space-y-3' : 'space-y-2'}>
              {section.links.map((item, itemIdx) => (
                <SidebarLink key={itemIdx} item={item} isSidebarOpen={isSidebarOpen} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
