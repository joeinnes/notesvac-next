<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Toasts } from './toaster.svelte';
	import CircleX from 'lucide-svelte/icons/circle-x';
	import CircleAlert from 'lucide-svelte/icons/circle-alert';
	import CircleCheck from 'lucide-svelte/icons/circle-check';

	import CircleDot from 'lucide-svelte/icons/circle-dot';
</script>

<div class="absolute bottom-4 right-4 max-w-lg space-y-4">
	{#each Toasts.toasts as toast}
		<div role="alert" class="rounded-xl border border-gray-100 bg-white p-4" in:fade out:fade>
			<div class="flex items-start gap-4">
				{#if toast.type === 'success'}
					<span class="text-green-600">
						<CircleCheck />
					</span>
				{:else if toast.type === 'error'}
					<span class="text-red-600">
						<CircleX />
					</span>
				{:else if toast.type === 'warning'}
					<span class="text-amber-600">
						<CircleAlert />
					</span>
				{:else}
					<span class="text-primary-600">
						<CircleDot />
					</span>
				{/if}

				<div class="flex-1">
					<!--<strong class="block font-medium text-gray-900"> Changes saved </strong>-->

					<p class="mt-1 text-sm text-gray-700">{toast.content}</p>
				</div>

				<button
					class="text-gray-500 transition hover:text-gray-600"
					onclick={() => Toasts.dismissToast(toast.id)}
				>
					<span class="sr-only">Dismiss popup</span>

					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>
	{/each}
</div>
