<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import Sidebar from '$lib/components/sidebar.svelte';
	let { data, children }: { data: LayoutData; children: Snippet } = $props();
	const { user } = data;
	import { db } from '$lib/db/db.svelte';
	$effect(() => {
		import('$lib/db').then(({ db: database }) => {
			db.db = database;
		});
		navigator.storage.persist().then((granted) => {
			if (granted) {
				console.log('Storage will not be cleared except by explicit user action');
			} else {
				console.log('Storage may be cleared under storage pressure.');
			}
		});
	});
</script>

<svelte:head><title>NotesVac</title></svelte:head>
{#if db}
	<div class="flex @container">
		<div
			class="@lg:sticky @lg:top-0 @lg:flex @lg:h-screen @lg:w-[320px] @lg:min-w-[320px] @lg:flex-shrink-0 @lg:flex-grow-0 @lg:flex-col @lg:justify-between @lg:overflow-y-auto"
		>
			<Sidebar />
		</div>
		<main class="max-h-screen flex-1 overflow-y-auto p-4">
			<svelte:boundary>
				{@render children()}

				{#snippet failed(error, reset)}
					<button onclick={reset}>oops! try again</button>
					{JSON.stringify(error)}
				{/snippet}
			</svelte:boundary>
		</main>
	</div>
{:else}
	Loading...
{/if}
