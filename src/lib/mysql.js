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
    console.error('SQL:', sql);
    console.error('Params:', params);
    
    // Provide more helpful error messages
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Database connection refused. Please check if MySQL is running and credentials are correct.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      throw new Error('Database access denied. Please check your database credentials.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      throw new Error(`Database '${dbConfig.database}' does not exist. Please create it first.`);
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error(`Table does not exist. Please run the database migration scripts.`);
    }
    
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
