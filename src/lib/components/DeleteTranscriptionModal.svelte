<script lang="ts">
	import { page } from '$app/stores';
	let { id = $bindable() } = $props();

	import { Toasts } from './Toaster/toaster.svelte';

	import { goto, invalidateAll } from '$app/navigation';

	const { db } = $derived($page.data);
	let dialog: HTMLDialogElement | undefined = $state();

	const deleteTranscription = async (id: string) => {
		try {
			const currentPage = $page.data?.id;
			if (currentPage === id) {
				await goto('/');
			}
			await db
				.updateTable('transcription')
				.set({
					is_deleted: true
				})
				.where('id', '=', id)
				.execute();
			Toasts.addToast('error', 'Transcription deleted.');
		} catch (e) {
			console.error(e);
			Toasts.addToast('error', 'Something went wrong and your transcription could not be deleted.');
		}
		invalidateAll();
	};
</script>

{#if id}
	<dialog open>
		<div class="h-full">
			<div class="fixed inset-0 z-10 bg-secondary-700/50"></div>
			<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
				<div class="mx-auto overflow-hidden rounded-lg bg-white shadow-xl sm:w-full sm:max-w-xl">
					<div class="relative p-6">
						<button
							type="button"
							aria-label="Close"
							onclick={() => (id = '')}
							class="absolute right-4 top-4 rounded-lg p-1 text-center font-medium text-secondary-500 transition-all hover:bg-secondary-100"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								class="h-6 w-6"
							>
								<path
									d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
								/>
							</svg>
						</button>
						<h3 class="text-lg font-medium text-secondary-900">Delete Note</h3>
						<div class="mt-2 text-sm text-secondary-500">
							Are you sure you want to delete this transcription? You'll be able to find it later in
							your Deleted Transcriptions.
						</div>
					</div>
					<div class="flex justify-end gap-3 bg-secondary-50 px-6 py-3">
						<button
							type="button"
							onclick={() => {
								id = '';
							}}
							class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:ring focus:ring-gray-100 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-400"
							>Cancel</button
						>
						<button
							type="button"
							class="rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-primary-700 hover:bg-primary-700 focus:ring focus:ring-primary-200 disabled:cursor-not-allowed disabled:border-primary-300 disabled:bg-primary-300"
							onclick={() => {
								if (id) deleteTranscription(id);
								id = '';
							}}>Confirm</button
						>
					</div>
				</div>
			</div>
		</div>
	</dialog>
{/if}

<style lang="postcss">
	::backdrop {
		@apply bg-secondary-700/50;
	}
</style>
