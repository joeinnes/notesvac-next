import type { ColumnType, Insertable, Selectable, Updateable } from 'kysely';
export interface Database {
	user: UserTable;
	note: NoteTable;
	notes_search: NoteSearchTable;
	transcription: TranscriptionTable;
	note_transcription: NoteTranscriptionTable;
}

export interface UserTable {
	id: string;
	name: string | null;
	avatar: string | null;
	username: string | null;
	openai_api_key: string | null;
	gcp_api_key: string | null;
	handwriting_api_choice: 'GCP' | 'ChatGPT' | null;
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
	is_deleted: boolean;
}

export type Note = Selectable<NoteTable>;
export type NewNote = Insertable<NoteTable>;
export type NoteUpdate = Updateable<NoteTable>;

export interface NoteSearchTable extends NoteTable {
	rank: number;
	rowid: number;
}
export type NoteSearch = Selectable<NoteSearchTable>;

export interface TranscriptionTable {
	id: string;
	image_hash: string;
	image: string;
	content: string;
	keywords: string;
	summary: string;
	is_deleted: boolean;
	created_at: ColumnType<Date, string | undefined, never>;
}

export type Transcription = Selectable<TranscriptionTable>;
export type NewTranscription = Insertable<TranscriptionTable>;
export type TranscriptionUpdate = Updateable<TranscriptionTable>;

export interface NoteTranscriptionTable {
	note_id: string;
	transcription_id: string;
}

export type NoteTranscription = Selectable<NoteTranscriptionTable>;
export type NewNoteTranscription = Insertable<NoteTranscriptionTable>;
export type NoteTranscriptionUpdate = Updateable<NoteTranscriptionTable>;
