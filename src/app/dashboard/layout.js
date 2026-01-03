'use client'

import DashboardLayout from '@/components/Layout/DashboardLayout'

export default function Layout({ children }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}
