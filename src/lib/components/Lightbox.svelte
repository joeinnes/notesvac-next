<script lang="ts">
	let { img = $bindable() } = $props();
</script>

{#if img}
	<dialog open class="max-w-xl">
		<div class="h-full">
			<div class="fixed inset-0 z-10 bg-secondary-700/50"></div>
			<div class="fixed inset-0 z-50 flex items-center justify-center">
				<div class="mx-auto h-[85vh] overflow-hidden rounded-lg shadow-xl">
					<div class="relative bg-gradient-to-bl from-secondary-900 to-transparent">
						<button
							type="button"
							aria-label="Close"
							onclick={() => (img = '')}
							class="absolute right-2 top-2 rounded-lg p-1 text-center font-medium text-white transition-all hover:bg-secondary-600/50 md:right-4 md:top-4"
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
					</div>
					<div class="h-full w-full">
						<img src={`${img}`} alt="Lightbox" class="h-full w-full object-contain" />
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
