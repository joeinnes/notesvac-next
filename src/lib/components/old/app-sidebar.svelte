<script lang="ts" module>
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import NotebookPen from 'lucide-svelte/icons/notebook-pen';
	import BotMessageSquare from 'lucide-svelte/icons/bot-message-square';
	import { Button } from './ui/button';
	import SquarePen from 'lucide-svelte/icons/square-pen';
	// This is sample data
	const navMain = [
		{
			title: 'Notes',
			url: '/',
			icon: NotebookPen,
			isActive: true
		},

		{
			title: 'Chat',
			url: '/chat',
			icon: BotMessageSquare,
			isActive: false
		},
		{
			title: 'Trash',
			url: '#',
			icon: Trash2,
			isActive: false
		}
	];
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import NavUser from '$lib/components/nav-user.svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/context.svelte.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Icon from '$lib/icon/Icon.svelte';
	import type { ComponentProps } from 'svelte';
	import debounce from 'lodash.debounce';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);
	import { Carta, Markdown } from 'carta-md';
	import DOMPurify from 'isomorphic-dompurify';
	const carta = new Carta({
		sanitizer: (str) => DOMPurify.sanitize(str, { USE_PROFILES: { html: false } })
	});

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	let activeItem = $state(navMain[0]);
	const sidebar = useSidebar();
	const { notes } = $derived($page.data);
	const debouncedSearch = debounce(
		(e: KeyboardEvent) => {
			(e?.target as HTMLInputElement)?.form?.requestSubmit();
		},
		200,
		{
			maxWait: 2000 // If the user keeps typing for more than 2 seconds, don't debounce continuously, just return after 2 seconds
		}
	);
</script>

<Sidebar.Root
	bind:ref
	collapsible="icon"
	class="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
	{...restProps}
>
	<!-- This is the first sidebar -->
	<!-- We disable collapsible and adjust width to icon. -->
	<!-- This will make the sidebar appear as icons. -->
	<Sidebar.Root collapsible="none" class="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r">
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg" class="md:h-8 md:p-0">
						{#snippet child({ props })}
							<a href="##" {...props}>
								<div
									class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
								>
									<Icon />
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-semibold">NotesVac</span>
								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupContent class="px-1.5 md:px-0">
					<Sidebar.Menu>
						{#each navMain as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									tooltipContentProps={{
										hidden: false
									}}
								>
									{#snippet child({ props })}
										{@const Icon = item.icon}
										<a
											href={item?.url || '##'}
											{...props}
											onclick={() => {
												activeItem = item;
												sidebar.setOpen(true);
											}}
										>
											<Icon />
											{item.title}
										</a>
									{/snippet}
									{#snippet tooltipContent()}
										{item.title}
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
		<Sidebar.Footer>
			<NavUser user={$page.data.user} />
		</Sidebar.Footer>
	</Sidebar.Root>

	<!-- This is the second sidebar -->
	<!-- We disable collapsible and let it fill remaining space -->
	<Sidebar.Root
		collapsible="none"
		class="hidden !w-[calc(var(--sidebar-width)_-_var(--sidebar-width-icon)_+_1px)] flex-1 md:flex "
	>
		<Sidebar.Header class="gap-3.5 border-b p-4">
			<div class="flex w-full items-center justify-between">
				<div class="text-foreground text-base font-medium">NotesVac</div>
			</div>
			<form method="GET" action="" data-sveltekit-keepfocus>
				<Sidebar.Input
					placeholder="Type to search..."
					name="q"
					onkeyup={debouncedSearch}
					data-sveltekit-replacestate
					data-sveltekit-keepfocus
				/>
			</form>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group class="px-0">
				<Sidebar.GroupContent>
					{#await notes}
						<p class="p-4">Loading</p>
					{:then notes}
						{#each notes as note (note.id)}
							<a
								href="/note/{note.id}"
								class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0"
							>
								<div class="flex w-full items-center gap-2">
									{#key note.content}
										<Markdown {carta} value={note.content || 'Empty note'} class="truncate" />
									{/key}

									<span class="ml-auto text-xs"
										>{dayjs(note.createdAt || note.created_at).fromNow()}</span
									>
								</div>
							</a>
						{:else}
							<p class="p-4">No results</p>
						{/each}
					{/await}
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
		<Sidebar.Footer>
			<Button href="/note/new"><SquarePen class="mr-2 size-4" />Create New Note</Button>
		</Sidebar.Footer>
	</Sidebar.Root>
</Sidebar.Root>

<style lang="postcss">
	:global(.carta-viewer) {
		@apply truncate;
	}
</style>
