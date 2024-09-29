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
  pgm.addColumn('users_members_only', {
    admin: { type: 'boolean', notNull: true, default: false } 
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users_members_only', 'admin');
};