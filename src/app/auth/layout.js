'use client'

export default function AuthLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-600 to-blue-800 min-h-screen">
        {children}
      </body>
    </html>
  )
}
