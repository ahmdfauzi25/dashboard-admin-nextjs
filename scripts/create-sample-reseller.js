const mysql = require('mysql2/promise')

async function createSampleReseller() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_dashboard_nextjs'
  })

  try {
    console.log('🔄 Creating sample reseller account...')

    // Check if reseller already exists
    const [existing] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      ['reseller@dashboard.com']
    )

    if (existing.length > 0) {
      console.log('⚠️  Reseller already exists!')
      console.log('   Email: reseller@dashboard.com')
      console.log('   ID:', existing[0].id)
      console.log('   Name:', existing[0].name)
      console.log('   Role:', existing[0].role)
      console.log('')
      console.log('✅ You can use this account to test chat!')
      return
    }

    // Use pre-hashed bcrypt password for 'reseller123'
    // Generated with: bcrypt.hash('reseller123', 10)
    const hashedPassword = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
    
    const [result] = await connection.execute(
      "INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)",
      ['reseller@dashboard.com', 'Sample Reseller', hashedPassword, 'RESELLER']
    )
    
    console.log('✅ Sample reseller created successfully!')
    console.log('')
    console.log('📧 Reseller Login:')
    console.log('   Email: reseller@dashboard.com')
    console.log('   Password: reseller123')
    console.log('')
    console.log('📝 Next Steps:')
    console.log('   1. Refresh your chat page: /dashboard/chat')
    console.log('   2. You will see "Sample Reseller" in the Messages sidebar')
    console.log('   3. Click the reseller to start chatting')
    console.log('   4. Type a message and click send')
    console.log('')
    console.log('🔄 To test from reseller side:')
    console.log('   1. Logout from current admin account')
    console.log('   2. Login with: reseller@dashboard.com / reseller123')
    console.log('   3. Go to /dashboard/chat')
    console.log('   4. You will see list of admins')
    console.log('   5. Click admin to send message')

    // Show all users
    const [users] = await connection.execute(
      "SELECT id, name, email, role FROM users ORDER BY role, id"
    )
    
    console.log('')
    console.log('📋 All users in database:')
    console.table(users)

  } catch (error) {
    console.error('❌ Error creating reseller:', error.message)
  } finally {
    await connection.end()
  }
}

createSampleReseller()
