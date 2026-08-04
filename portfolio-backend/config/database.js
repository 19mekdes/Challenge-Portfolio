// ============================================
// CONFIG/DATABASE.JS - PostgreSQL Connection
// ============================================

const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portfolio_db',
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected successfully!');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        return false;
    }
}

// Execute query helper
async function query(text, params = []) {
    try {
        const start = Date.now();
        const result = await pool.query(text, params);
        // Only log query details in development to avoid noisy production logs
        if (process.env.NODE_ENV !== 'production') {
            console.log('Executed query', { text, duration: Date.now() - start, rows: result.rowCount });
        }
        return result;
    } catch (error) {
        console.error('Query error:', error.message);
        throw error;
    }
}

// Transaction helper
async function transaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Get single row
async function getOne(text, params = []) {
    const result = await query(text, params);
    return result.rows[0] || null;
}

// Get multiple rows
async function getAll(text, params = []) {
    const result = await query(text, params);
    return result.rows || [];
}

// Insert and return
async function insertAndReturn(text, params = []) {
    const result = await query(text + ' RETURNING *', params);
    return result.rows[0] || null;
}

module.exports = {
    pool,
    query,
    transaction,
    getOne,
    getAll,
    insertAndReturn,
    testConnection
};