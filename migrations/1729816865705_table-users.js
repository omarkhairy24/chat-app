/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.sql(
    `
      CREATE TABLE users(
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(90) NOT NULL UNIQUE,
        name VARCHAR(50) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        image VARCHAR(50),
        password VARCHAR(250) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
  )

};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(
    `
      DROP TABLE users
    `
  )
};
