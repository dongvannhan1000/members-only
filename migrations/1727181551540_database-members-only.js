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
	// Create table USERS
  pgm.createTable('users_members_only', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    firstName: { type: 'varchar(50)', notNull: true },
    lastName: { type: 'varchar(50)', notNull: true },
    email: { type: 'varchar(100)', notNull: true, unique: true },
    password: { type: 'varchar(255)', notNull: true },
    membershipStatus: { type: 'boolean', notNull: true, default: false },
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  // Create table MESSAGES
  pgm.createTable('messages_members_only', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    title: { type: 'varchar(100)', notNull: true },
    content: { type: 'text', notNull: true },
    author_id: {
      type: 'uuid',
      notNull: true,
      references: '"users_members_only"',
      onDelete: 'CASCADE'
    },
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  });

  
  pgm.createIndex('users_members_only', 'email');

  pgm.createIndex('messages_members_only', 'author_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
	pgm.dropTable('messages_members_only');
  pgm.dropTable('users_member_only');
};
