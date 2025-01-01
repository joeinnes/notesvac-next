<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<h1>
	Welcome to NotesVac{#if data.user?.name}, {data.user?.name?.split(' ')[0]}{/if}.
</h1>
