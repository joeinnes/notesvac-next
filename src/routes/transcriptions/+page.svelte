<script lang="ts">
	import dayjs from '$lib/utils/dayjs';
	import type { PageData } from './$types';
	import ExternalLink from 'lucide-svelte/icons/external-link';

	let { data }: { data: PageData } = $props();
	let { transcriptions } = $derived(data);
</script>

<div class="p-4">
	<div class="prose mb-4">
		<h1>Transcriptions</h1>
	</div>
	{#await transcriptions then transcriptions}
		{#if transcriptions}
			<div>
				{#each transcriptions as transcription}
					<div class="flex items-center gap-4">
						<img
							src={transcription.image}
							alt={transcription.summary}
							class="aspect-square w-40 rounded-lg object-cover"
						/>

						<div>
							<p class="mb-2 line-clamp-3 text-gray-700">
								{transcription.summary || transcription.content}
							</p>
							<div class="mb-2 flex flex-wrap gap-2">
								{#each transcription.keywords.split(', ') as keyword}
									<a
										class="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 transition-colors hover:bg-green-200"
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
										class="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-200"
									>
										{dayjs(note.createdAt).format('DD-MMM-YYYY')}
										<ExternalLink class="h-4 text-primary-600" />
									</a>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{/await}
</div>
