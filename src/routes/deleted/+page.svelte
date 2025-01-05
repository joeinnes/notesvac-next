<script lang="ts">
	import type { PageData } from './$types';
	const { data }: { data: PageData } = $props();
	const { deletedNotes } = $derived(data);
	import Undo2 from 'lucide-svelte/icons/undo-2';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import utc from 'dayjs/plugin/utc';
	import { invalidateAll } from '$app/navigation';
	import { db } from '$lib/db/db.svelte';

	dayjs.extend(utc);
	dayjs.extend(relativeTime);
	const undeleteNote = async (id: string) => {
		await db.db
			?.updateTable('note')
			.set({
				is_deleted: false
			})
			.where('id', '=', id)
			.execute();

		invalidateAll();
	};
</script>

{#if deletedNotes}
	<div class="prose mb-4">
		{#if deletedNotes.length}<h1>Deleted Notes</h1>{:else}<h1>No Deleted Notes</h1>{/if}
	</div>
	<div class="space-y-2">
		{#each deletedNotes as note}
			<div class="mx-auto w-full rounded-lg bg-white shadow">
				<div class="flex w-full items-center justify-center p-4">
					<div>
						<p class="mt-1 line-clamp-3 w-full text-gray-500">
							{#each new Array(50)}
								{note.content}
							{/each}
						</p>
						<span class="text-xs text-gray-700">{dayjs.utc(note.created_at).fromNow()}</span>
					</div>
					<button
						class="flex items-center gap-1 rounded-lg border border-secondary-500 bg-secondary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-secondary-700 hover:bg-secondary-700 focus:ring focus:ring-secondary-200 disabled:cursor-not-allowed disabled:border-secondary-300 disabled:bg-secondary-300"
						onclick={() => undeleteNote(note.id)}>Restore <Undo2 class="w-4" /></button
					>
				</div>
			</div>
		{:else}
			<div class="prose">
				<p>You haven't got any notes in your deleted notes folder.</p>
				<a href="/">Go home &rarr;</a>
			</div>
		{/each}
	</div>
{:else}
	No deleted notes
{/if}
