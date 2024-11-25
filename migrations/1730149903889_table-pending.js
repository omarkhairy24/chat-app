const { sql } = require('node-pg-migrate/dist/operations/sql');

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
    pgm.sql(`
            CREATE TABLE pendings(
                id SERIAL PRIMARY KEY,
                sender UUID NOT NULL REFERENCES users(id),
                reciever UUID NOT NULL REFERENCES users(id),
                CHECK (sender <> reciever),
                UNIQUE (sender, reciever)
            )
        `)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm,sql(`
            DROP TABLE pendings
        `)
};
