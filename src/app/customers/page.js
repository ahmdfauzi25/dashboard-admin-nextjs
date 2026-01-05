'use client'

import { redirect } from 'next/navigation'

// Redirect to dashboard customers page
export default function CustomersPage() {
  redirect('/dashboard/customers')
}
