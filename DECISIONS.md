# Decisions
This is a decision log to help me avoid revisiting decisions I've already made.

## Local First
I want to create a local first experience because ultimately a notes app should work offline too (even if parts of the app won't work well, like handwriting transcription and chatting with notes). Basic functionality like creating, editing, and deleting notes should still be possible.

Ideally, the way I will achieve this will be to have some sort of local database (SQLite WASM?) which syncs to the cloud. 

Turso currently has offline writes in beta, and could be a decent hosted option if pricing is OK. It allows each user to have their own cloud hosted SQLite DB, but requires a fair bit of proprietary nonsense for it. Would also need to see real-world usage from actual users to be able to properly estimate pricing.

**Decision: Use SQLocal and Drizzle for SQLite WASM to build the app as single-player, local-only. This is subject to revision once I find a decent syncing strategy.**

## Using Electric SQL
Although I explored Electric SQL and it showed a lot of promise (using PGLite rather than SQLite), it does not support nested relations as part of a 'shape' or an 'include tree' to sync with the server. This makes it fundamentally not a great fit for what I want to do.

**Decision: Do not use Electric SQL.**

## Automatic backups
Although I'm not going to have a full syncing solution to begin with, I can almost certainly implement a naive, file-based backup strategy to allow users to save their notes to a (provider agnostic?) file storage platform. 

**Decision: Implement automatic backups, allowing users to decide themselves where to back up to**

## Restoration of backups
Restoring a backup is complex and requires merging logic in case we're trying to restore a backup.

**Decision: *For now*, it is acceptable for a restoration to nuke the user's data. It should be patently clear to the user that this will happen.**