<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let { user } = $derived(data);
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Input } from '$lib/components/ui/input';
	let messages = $state([
		{
			isUser: false,
			message: 'Hello, how can I help you?'
		},
		{
			isUser: true,
			message: 'Hello, how can I help you?'
		}
	]);
	let newMessage = $state('');

	let cw = $state(0);
	let sw = $state(0);
</script>

{#snippet chatBubble(message: { isUser: boolean; message: string })}
	<li
		class="{message.isUser
			? 'ms-auto flex-row-reverse'
			: 'me-auto'} flex max-w-lg gap-x-2 sm:gap-x-4"
	>
		<img
			class="inline-block size-9 rounded-full"
			src={message.isUser
				? 'data:image/jpeg;base64,' + user.avatar
				: 'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&&auto=format&fit=facearea&facepad=3&w=300&h=300&q=80'}
			alt="Avatar"
		/>

		<!-- Card -->
		<div
			class="border-border space-y-3 rounded-2xl border {message.isUser
				? 'bg-primary text-primary-foreground'
				: 'bg-card text-card-foreground'} p-4"
		>
			<p>
				{message.message}
			</p>
		</div>
		<!-- End Card -->
	</li>
{/snippet}

<ul class="space-y-4">
	{#each messages as message}
		{@render chatBubble(message)}
	{/each}

	<Textarea class="bg-card text-card-foreground w-full" bind:value={newMessage} />
</ul>
