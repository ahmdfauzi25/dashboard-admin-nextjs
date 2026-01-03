const mysql = require('mysql2/promise')
const bcrypt = require('bcrypt')

async function updateUserRoles() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_dashboard_nextjs'
  })

  try {
    console.log('🔄 Updating user roles...')

    // 1. Update MODERATOR to RESELLER
    const [updateResult] = await connection.execute(
      "UPDATE users SET role = 'RESELLER' WHERE role = 'MODERATOR'"
    )
    console.log(`✅ Updated ${updateResult.affectedRows} MODERATOR roles to RESELLER`)

    // 2. Check if admin exists
    const [adminCheck] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'"
    )
    
    if (adminCheck[0].count === 0) {
      console.log('⚠️  No admin found. Creating default admin account...')
      
      // Create default admin
      const hashedPassword = await bcrypt.hash('admin123', 10)
      await connection.execute(
        "INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)",
        ['admin@dashboard.com', 'System Admin', hashedPassword, 'ADMIN']
      )
      
      console.log('✅ Default admin created:')
      console.log('   Email: admin@dashboard.com')
      console.log('   Password: admin123')
      console.log('   ⚠️  PLEASE CHANGE THIS PASSWORD AFTER LOGIN!')
    } else {
      console.log(`✅ Found ${adminCheck[0].count} admin(s) in database`)
    }

    // 3. Show all users with their roles
    const [users] = await connection.execute(
      "SELECT id, name, email, role FROM users ORDER BY role, id"
    )
    
    console.log('\n📋 Current users in database:')
    console.table(users)

    // 4. Summary
    const [summary] = await connection.execute(
      "SELECT role, COUNT(*) as count FROM users GROUP BY role"
    )
    
    console.log('\n📊 User summary by role:')
    console.table(summary)

  } catch (error) {
    console.error('❌ Error updating user roles:', error.message)
  } finally {
    await connection.end()
  }
}

updateUserRoles()
