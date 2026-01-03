import mysql from 'mysql2/promise'

// Get database credentials from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'db_dashboard_nextjs',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
}

// Create a connection pool
const pool = mysql.createPool(dbConfig)

export async function query(sql, params) {
  let connection;
  try {
    connection = await pool.getConnection();
    const queryResult = await connection.execute(sql, params);
    return Array.isArray(queryResult) ? queryResult[0] : queryResult
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

export async function getConnection() {
  return await pool.getConnection()
}

// Test connection function
export async function testConnection() {
  let connection
  try {
    connection = await pool.getConnection()
    console.log('MySQL database connected successfully!')
    return { success: true }
  } catch (error) {
    console.error('MySQL database connection failed:', error)
    throw error
  } finally {
    if (connection) connection.release()
  }
}
