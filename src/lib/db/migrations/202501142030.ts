import { Kysely } from 'kysely';
import type { Database } from '../types';
import type { Migration } from 'kysely';

export async function up(db: Kysely<Database>): Promise<void> {
	await db.schema.alterTable('user').addColumn('custom_prompt', 'text').execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
	await db.schema.alterTable('user').dropColumn('custom_prompt').execute();
}

export const Migration202501142030: Migration = { up, down };
