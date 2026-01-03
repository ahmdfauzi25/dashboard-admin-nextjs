#!/usr/bin/env node

/**
 * Comprehensive Chat System Diagnostic Tool
 * Checks all components and provides detailed diagnostics
 */

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bold');
  console.log('='.repeat(60));
}

async function runDiagnostics() {
  let connection;

  try {
    section('🔧 Chat System Diagnostics');

    // 1. Check Environment Variables
    log('\n📋 1. Checking Environment Variables...', 'blue');
    const requiredEnvs = ['DB_HOST', 'DB_USER', 'DB_DATABASE', 'JWT_SECRET'];
    const envStatus = {};
    
    for (const env of requiredEnvs) {
      const value = process.env[env];
      if (value) {
        log(`  ✅ ${env}=${value}`, 'green');
        envStatus[env] = true;
      } else {
        log(`  ❌ ${env} not set`, 'red');
        envStatus[env] = false;
      }
    }

    if (!Object.values(envStatus).every(v => v)) {
      throw new Error('Missing required environment variables');
    }

    // 2. Test Database Connection
    log('\n💾 2. Testing Database Connection...', 'blue');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'db_dashboard_nextjs'
    });
    log('  ✅ Connected to database', 'green');

    // 3. Check Users Table
    log('\n👥 3. Checking Users Table...', 'blue');
    const [users] = await connection.execute(
      'SELECT id, name, email, role FROM users ORDER BY id'
    );
    
    if (users.length === 0) {
      log('  ❌ No users found in database', 'red');
    } else {
      log(`  ✅ Found ${users.length} users:`, 'green');
      users.forEach(u => {
        console.log(`     - ID=${u.id}: ${u.name} (${u.role}) - ${u.email}`);
      });
    }

    // 4. Check Admin User
    log('\n👨‍💼 4. Checking Admin User...', 'blue');
    const admin = users.find(u => u.role.toUpperCase() === 'ADMIN');
    if (admin) {
      log(`  ✅ Admin found: ${admin.name} (ID=${admin.id})`, 'green');
    } else {
      log('  ❌ No admin user found', 'red');
    }

    // 5. Check Reseller Users
    log('\n👤 5. Checking Reseller Users...', 'blue');
    const resellers = users.filter(u => u.role.toUpperCase() === 'RESELLER');
    if (resellers.length === 0) {
      log('  ❌ No reseller users found', 'red');
    } else {
      log(`  ✅ Found ${resellers.length} reseller(s):`, 'green');
      resellers.forEach(r => {
        console.log(`     - ID=${r.id}: ${r.name} - ${r.email}`);
      });
    }

    // 6. Check Messages Table
    log('\n📬 6. Checking Messages Table...', 'blue');
    const [tables] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'messages'",
      [process.env.DB_DATABASE]
    );
    
    if (tables[0].count === 0) {
      log('  ❌ Messages table does not exist', 'red');
    } else {
      const [messages] = await connection.execute('SELECT COUNT(*) as count FROM messages');
      log(`  ✅ Messages table exists with ${messages[0].count} messages`, 'green');
    }

    // 7. Check Message Volume (if admin and reseller exist)
    if (admin && resellers.length > 0) {
      log('\n📊 7. Checking Message Volume...', 'blue');
      
      for (const reseller of resellers) {
        const [msgCount] = await connection.execute(
          'SELECT COUNT(*) as count FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
          [reseller.id, admin.id, admin.id, reseller.id]
        );
        
        if (msgCount[0].count > 0) {
          log(`  ✅ Messages between ${admin.name} and ${reseller.name}: ${msgCount[0].count}`, 'green');
          
          // Get unread count for admin
          const [unread] = await connection.execute(
            'SELECT COUNT(*) as count FROM messages WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE',
            [reseller.id, admin.id]
          );
          console.log(`     - Unread by admin: ${unread[0].count}`);
        } else {
          log(`  ⚠️  No messages between ${admin.name} and ${reseller.name}`, 'yellow');
        }
      }
    }

    // 8. Test API Simulation
    log('\n🔌 8. Testing API Query Logic...', 'blue');
    
    if (admin) {
      // Simulate what /api/messages/users does for admin
      const [apiUsers] = await connection.execute(
        `SELECT 
          u.id,
          u.name,
          u.role,
          (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = FALSE) as unread_count,
          (SELECT message FROM messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message
         FROM users u
         WHERE UPPER(u.role) = 'RESELLER'
         ORDER BY id`,
        [admin.id, admin.id, admin.id]
      );
      
      if (apiUsers.length > 0) {
        log(`  ✅ API query returns ${apiUsers.length} user(s) for admin:`, 'green');
        apiUsers.forEach(u => {
          console.log(`     - ${u.name}: ${u.unread_count} unread, last msg: "${u.last_message?.substring(0, 40)}..."`);
        });
      } else {
        log('  ❌ API query returns NO users for admin', 'red');
      }
    }

    // 9. Check Foreign Keys
    log('\n🔗 9. Checking Foreign Key Constraints...', 'blue');
    const [fks] = await connection.execute(
      "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'messages' AND COLUMN_NAME IN ('sender_id', 'receiver_id') AND REFERENCED_TABLE_NAME IS NOT NULL"
    );
    
    if (fks.length >= 2) {
      log(`  ✅ Foreign key constraints present (${fks.length} found)`, 'green');
    } else {
      log('  ⚠️  Missing foreign key constraints', 'yellow');
    }

    // 10. Summary
    log('\n' + '='.repeat(60), 'bold');
    log('📊 Diagnostic Summary:', 'bold');
    log('='.repeat(60), 'bold');
    
    const summary = {
      'Environment Variables': Object.values(envStatus).every(v => v),
      'Database Connection': true,
      'Users Table': users.length > 0,
      'Admin User': !!admin,
      'Reseller Users': resellers.length > 0,
      'Messages Table': tables[0].count > 0,
      'Test Messages': admin && resellers.length > 0
    };

    let allOk = true;
    for (const [check, status] of Object.entries(summary)) {
      const icon = status ? '✅' : '❌';
      log(`  ${icon} ${check}`, status ? 'green' : 'red');
      if (!status) allOk = false;
    }

    log('\n' + '='.repeat(60));
    
    if (allOk) {
      log('✨ All checks passed! Chat system is ready.', 'green');
      log('\n📝 Next steps:');
      log('  1. Start Next.js: npm run dev');
      log('  2. Login with admin account');
      log('  3. Go to Dashboard > Chat');
      log('  4. You should see resellers in the sidebar');
    } else {
      log('⚠️  Some checks failed. See details above.', 'yellow');
      log('\n💡 Common fixes:');
      log('  1. Check .env file for DB credentials');
      log('  2. Ensure MySQL is running');
      log('  3. Run: node scripts/create-admin-account.js');
      log('  4. Run: node scripts/insert-test-messages.js');
    }

    log('\n' + '='.repeat(60));
    console.log('');

  } catch (error) {
    log('\n❌ ERROR: ' + error.message, 'red');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runDiagnostics();
