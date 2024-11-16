const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.host,
  port: process.env.port,
  user: process.env.username,
  password: process.env.password,
  database: process.env.DB_NAME,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error', err);
  } else {
    console.log('Connected successfully', res.rows);
  }
  pool.end();
});
