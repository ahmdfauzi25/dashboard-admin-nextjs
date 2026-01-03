// Script to generate a secure JWT secret key
const crypto = require('crypto');

// Generate a random 64-byte (512-bit) secret key
const secret = crypto.randomBytes(64).toString('hex');

console.log('\n=== JWT Secret Key Generated ===\n');
console.log(secret);
console.log('\n=== Copy this to your .env file ===\n');
console.log(`JWT_SECRET="${secret}"\n`);

