const mysql = require('mysql2/promise')

async function createAdminAccount() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_dashboard_nextjs'
  })

  try {
    console.log('🔄 Checking for admin accounts...')

    // Check existing admins
    const [admins] = await connection.execute(
      "SELECT id, name, email, role FROM users WHERE role IN ('ADMIN', 'admin')"
    )

    if (admins.length > 0) {
      console.log('✅ Found existing admin(s):')
      console.table(admins)
      console.log('')
      console.log('📝 Refresh your chat page to see the admin(s)')
      return
    }

    console.log('⚠️  No admin found. Creating default admin...')

    // Use pre-hashed password for 'admin123'
    const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
    
    await connection.execute(
      "INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)",
      ['admin@dashboard.com', 'System Admin', hashedPassword, 'ADMIN']
    )
    
    console.log('✅ Admin account created!')
    console.log('')
    console.log('📧 Admin Login:')
    console.log('   Email: admin@dashboard.com')
    console.log('   Password: admin123')
    console.log('')
    console.log('📝 Next Steps:')
    console.log('   1. Refresh your chat page (you are logged in as reseller)')
    console.log('   2. You will see "System Admin" in the Messages sidebar')
    console.log('   3. Click the admin to start chatting')
    console.log('   4. Type your message and click send')
    console.log('')

    // Show all users
    const [users] = await connection.execute(
      "SELECT id, name, email, role FROM users ORDER BY role, id"
    )
    
    console.log('📋 All users in database:')
    console.table(users)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await connection.end()
  }
}

createAdminAccount()
