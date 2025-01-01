import { Kysely, sql } from 'kysely';
import type { Database } from '../types';
import type { Migration } from 'kysely';

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.createTable('note')
		.addColumn('id', 'text', (col) => col.primaryKey().notNull().unique())
		.addColumn('title', 'text')
		.addColumn('content', 'text', (col) => col.notNull())
		.addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('last_updated', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('is_deleted', 'integer', (col) => col.defaultTo(false))
		.addColumn('summary', 'text')
		.addColumn('keywords', 'text')
		.execute();

	await db.schema
		.createTable('user')
		.addColumn('id', 'integer', (col) => col.primaryKey().notNull().unique())
		.addColumn('name', 'text', (col) => col.notNull())
		.addColumn('username', 'text', (col) => col.notNull().unique())
		.addColumn('avatar', 'text')
		.addColumn('api_key', 'text')
		.addColumn('password_hash', 'text', (col) => col.notNull())
		.execute();

	await sql`CREATE VIRTUAL TABLE notes_search using fts5(title, content, keywords, summary, tokenize = 'porter unicode61');`.execute(
		db
	);

	await sql`DROP TRIGGER IF EXISTS notes_insert_trigger;
DROP TRIGGER IF EXISTS notes_update_trigger;
DROP TRIGGER IF EXISTS notes_delete_trigger;`.execute(db);

	await sql`INSERT INTO notes_search (title, content, keywords, summary)
SELECT title, content, keywords, summary FROM note;`.execute(db);

	await sql`CREATE TRIGGER notes_insert_trigger
AFTER INSERT ON note
BEGIN
  INSERT INTO notes_search(rowid, content)
  VALUES (NEW.rowid, NEW.content);
END;`.execute(db);

	await sql`CREATE TRIGGER notes_update_trigger
AFTER UPDATE ON note
BEGIN
  UPDATE notes_search
  SET content = NEW.content
  WHERE rowid = NEW.rowid;
END;`.execute(db);

	await sql`CREATE TRIGGER notes_delete_trigger
AFTER DELETE ON note
BEGIN
  DELETE FROM notes_search
  WHERE rowid = OLD.rowid;
END;`.execute(db);
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.dropTable('note').execute();
	await db.schema.dropTable('user').execute();
	await sql`DROP TABLE IF EXISTS notes_search;
`.execute(db);
	await sql`DROP TRIGGER IF EXISTS notes_insert_trigger;
DROP TRIGGER IF EXISTS notes_update_trigger;
DROP TRIGGER IF EXISTS notes_delete_trigger;`.execute(db);
}

export const Migration202412282231: Migration = { up, down };
