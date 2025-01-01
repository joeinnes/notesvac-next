<script lang="ts">
	import '../../app.css';
	let { children } = $props();
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.ts';
	import { Separator } from '$lib/components/ui/separator/index.ts';
	import * as Sidebar from '$lib/components/ui/sidebar/index.ts';
</script>

<svelte:head>
	<title>NotesVac</title>
</svelte:head>
<Sidebar.Provider style="--sidebar-width: 350px;">
	<AppSidebar />
	<Sidebar.Inset>
		<header class="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background p-4">
			<Sidebar.Trigger class="-ml-1" />
			<!--<Separator orientation="vertical" class="mr-2 h-4" />
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item class="hidden md:block">
						<Breadcrumb.Link href="#">All Inboxes</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator class="hidden md:block" />
					<Breadcrumb.Item>
						<Breadcrumb.Page>Inbox</Breadcrumb.Page>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>-->
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
