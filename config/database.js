const { Pool } = require('pg');

require('dotenv').config();

const conn = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: conn,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Expose the connection
module.exports = {
    query: (text, params) => pool.query(text, params),
  };