import type { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
	user: UserTable;
	note: NoteTable;
	notes_search: NoteSearchTable;
}

export interface UserTable {
	id: string;
	name: string | null;
	avatar: string | null;
	api_key: string | null;
	created_at: ColumnType<Date, string | undefined, never>;
}

export type User = Selectable<UserTable>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export interface NoteTable {
	id: string;
	title: string | null;
	content: string | null;
	created_at: ColumnType<Date, string | undefined, never>;
	last_updated: ColumnType<Date, string | undefined, never>;
	summary: string | null;
	keywords: string | null;
}

export type Note = Selectable<NoteTable>;
export type NewNote = Insertable<NoteTable>;
export type NoteUpdate = Updateable<NoteTable>;

export interface NoteSearchTable {
	title: string | null;
	content: string | null;
	summary: string | null;
	keywords: string | null;
}
export type NoteSearch = Selectable<NoteSearchTable>;
