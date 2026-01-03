#!/usr/bin/env node

/**
 * Test script untuk simulasi API calls
 * Membantu debug tanpa perlu browser
 */

const http = require('http');
const https = require('https');

// Get JWT token by logging in
async function login(email, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: email,
      password: password
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          // Extract token from Set-Cookie header
          const setCookie = res.headers['set-cookie'];
          const token = setCookie ? setCookie[0].split(';')[0].replace('token=', '') : null;
          resolve({
            token: token,
            user: result.user,
            status: res.statusCode
          });
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Test API endpoint
async function testApiCall(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `token=${token}`
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: result
          });
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');

  try {
    console.log('📝 Step 1: Login as admin');
    const loginResult = await login('admin@superadmin.com', 'admin123');
    console.log(`✅ Login status: ${loginResult.status}`);
    console.log(`👤 User: ${loginResult.user.name} (${loginResult.user.role})`);
    console.log(`🔐 Token: ${loginResult.token.substring(0, 20)}...`);

    if (!loginResult.token) {
      throw new Error('No token received from login');
    }

    console.log('\n📨 Step 2: Get /api/me');
    const meResult = await testApiCall('/api/me', loginResult.token);
    console.log(`✅ Status: ${meResult.status}`);
    if (meResult.data.user) {
      console.log(`👤 Current user: ${meResult.data.user.name} (ID: ${meResult.data.user.id})`);
    }

    console.log('\n💬 Step 3: Get /api/messages/users (chat user list)');
    const usersResult = await testApiCall('/api/messages/users', loginResult.token);
    console.log(`✅ Status: ${usersResult.status}`);
    console.log(`📊 Current user ID from API: ${usersResult.data.currentUserId}`);
    console.log(`👥 Current user role from API: ${usersResult.data.currentUserRole}`);
    console.log(`📋 Users found: ${usersResult.data.users?.length || 0}`);
    
    if (usersResult.data.users && usersResult.data.users.length > 0) {
      console.log('\n👥 Users in chat:');
      usersResult.data.users.forEach(u => {
        console.log(`   - ${u.name} (ID: ${u.id}, Role: ${u.role}) - ${u.unread_count || 0} unread`);
      });
    } else {
      console.log('\n⚠️  No users found!');
    }

    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runTests();
