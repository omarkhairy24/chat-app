require('dotenv').config();
const fs = require('fs')

module.exports = {
  databaseUrl: process.env.DATABASE_URL,
  migrationsTable: 'pgmigrations',
   dir: 'migrations',
   migrationTableSchema: 'public',
   verbose: true,
};

