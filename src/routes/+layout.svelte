<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import Sidebar from '$lib/components/sidebar.svelte';
	let { children }: { data: LayoutData; children: Snippet } = $props();
	import { db } from '$lib/db/db.svelte';
	import PersistenceWarning from '$lib/components/PersistenceWarning.svelte';
	import Toasts from '$lib/components/Toaster/Toasts.svelte';
	let warnOnNonPersistence = $state(false);
	$effect(() => {
		import('$lib/db').then(({ db: database }) => {
			db.db = database;
		});
		navigator.storage.persist().then((granted) => {
			warnOnNonPersistence = !granted;
			if (granted) {
				console.log('Storage will not be cleared except by explicit user action');
			} else {
				console.log('Storage may be cleared under storage pressure.');
			}
		});
	});
</script>

<svelte:head><title>NotesVac</title></svelte:head>
{#if db && db.ready}
	<div class="flex h-screen max-h-screen flex-col">
		{#if warnOnNonPersistence}
			<PersistenceWarning {warnOnNonPersistence}></PersistenceWarning>
		{/if}
		<div class="flex h-full max-h-full flex-1 @container">
			<div
				class="@lg:sticky @lg:top-0 @lg:flex @lg:h-full @lg:w-[320px] @lg:min-w-[320px] @lg:flex-shrink-0 @lg:flex-grow-0 @lg:flex-col @lg:justify-between @lg:overflow-hidden"
			>
				<Sidebar />
			</div>
			<main class="h-full flex-1 overflow-y-auto p-4">
				<svelte:boundary>
					{@render children()}

					{#snippet failed(error, reset)}
						<button onclick={reset}>Oops! try again</button>
						{JSON.stringify(error)}
					{/snippet}
				</svelte:boundary>
				<Toasts />
			</main>
		</div>
	</div>
{:else}
	Loading...
{/if}
