<script lang="ts">
	import DeleteTranscriptionModal from '$lib/components/DeleteTranscriptionModal.svelte';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import dayjs from '$lib/utils/dayjs';
	import type { PageData } from './$types';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Trash_2 from 'lucide-svelte/icons/trash-2';

	let { data }: { data: PageData } = $props();
	let { transcriptions } = $derived(data);
	let showLightbox = $state('');
	let showDelete = $state('');
</script>

<div class="p-4">
	<div class="mb-4 text-2xl font-semibold">
		<h1>Transcriptions</h1>
	</div>
	{#await transcriptions then transcriptions}
		{#if transcriptions}
			<div>
				{#each transcriptions as transcription}
					<div class="flex flex-col items-center gap-4 md:flex-row">
						<button
							class="aspect-square w-24 flex-shrink-0 overflow-hidden"
							onclick={() => (showLightbox = transcription.image)}
						>
							<img
								src={transcription.image}
								alt={transcription.summary}
								class="h-full w-full rounded-lg object-cover"
							/>
						</button>
						<div>
							<p class="md:text-md mb-2 line-clamp-3 text-sm text-gray-700">
								{transcription.summary || transcription.content}
							</p>
							<div class="mb-2 flex flex-wrap gap-1">
								{#each transcription.keywords.split(', ') as keyword}
									<a
										class="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 transition-colors hover:bg-green-200"
										href="/transcriptions/?q={keyword}"
									>
										#{keyword}
									</a>
								{/each}
							</div>
							<div class="flex flex-wrap gap-2">
								{#each transcription.notes as note}
									<a
										href="/note/{note.id}"
										class="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-200"
									>
										{dayjs(note.createdAt).format('DD-MMM-YYYY')}
										<ExternalLink class="h-4 text-primary-600" />
									</a>
								{/each}
							</div>
						</div>
						<button
							onclick={() => (showDelete = transcription.id)}
							class="flex items-center gap-1 whitespace-nowrap rounded-lg border border-red-500 bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-red-700 hover:bg-red-700 focus:ring focus:ring-red-200 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-300"
							><Trash_2 class="w-4" />Delete
						</button>
					</div>
				{/each}
			</div>
		{/if}
	{/await}
</div>

<Lightbox bind:img={showLightbox} />
<DeleteTranscriptionModal bind:id={showDelete} />
