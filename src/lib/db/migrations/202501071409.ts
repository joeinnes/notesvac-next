import { Kysely, sql } from 'kysely';
import type { Database } from '../types';
import type { Migration } from 'kysely';

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema
		.createTable('transcription')
		.addColumn('id', 'text', (col) => col.primaryKey().notNull().unique())
		.addColumn('image_hash', 'text', (col) => col.notNull())
		.addColumn('image', 'text', (col) => col.notNull())
		.addColumn('content', 'text', (col) => col.notNull())
		.addColumn('keywords', 'text')
		.addColumn('summary', 'text')
		.addColumn('is_deleted', 'integer', (col) => col.defaultTo(false))
		.addColumn('created_at', 'text', (col) => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.execute();

	await db.schema
		.createTable('note_transcription')
		.addColumn('note_id', 'text', (col) => col.notNull().references('notes.id').onDelete('cascade'))
		.addColumn('transcription_id', 'integer', (col) =>
			col.notNull().references('transcription.id').onDelete('cascade')
		)
		.addPrimaryKeyConstraint('note_transcription_pk', ['note_id', 'transcription_id'])
		.execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.dropTable('transcription').execute();

	await db.schema.dropTable('note_transcriptions').execute();
}

export const Migration202501071409: Migration = { up, down };
