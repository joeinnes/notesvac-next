<script lang="ts">
	let { warnOnNonPersistence } = $props();
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
</script>

<div class="flex items-center border-b-4 border-red-700 bg-red-200 p-4 text-red-900">
	<div class="flex flex-1 items-center">
		<CircleAlert class="mr-2" />Warning! You have not granted permission to store your database
		persistently. Your browser may delete your notes at any time.
	</div>
	<button
		class="block rounded-lg border border-red-500 bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-red-700 hover:bg-red-700 focus:ring focus:ring-red-200 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-300"
		onclick={() =>
			navigator.storage.persist().then((granted) => {
				warnOnNonPersistence = !granted;
				if (granted) {
					console.log('Storage will not be cleared except by explicit user action');
				} else {
					console.log('Storage may be cleared under storage pressure.');
				}
			})}>Fix This!</button
	>
</div>
