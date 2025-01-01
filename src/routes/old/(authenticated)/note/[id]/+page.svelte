<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { Carta, MarkdownEditor } from 'carta-md';
	import 'carta-md/default.css'; /* Default theme */
	import DOMPurify from 'isomorphic-dompurify';
	const carta = new Carta({
		sanitizer: DOMPurify.sanitize
	});

	import { beforeNavigate } from '$app/navigation';
	import debounce from 'lodash.debounce';
	import LoaderCircle from 'lucide-svelte/icons/loader-circle';
	import Save from 'lucide-svelte/icons/save';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { enhance } from '$app/forms';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	let content = $state($page.data?.note?.content);
	let keywords = $state($page.data?.note?.keywords);
	let summary = $state($page.data?.note?.summary);
	let dirty = $state(false);
	let isPhotoUploadDialogOpen = $state(false);

	const saveNote = async () => {
		const response = await fetch('/api/note', {
			method: 'POST',
			body: JSON.stringify({ id: data.note?.id, content, keywords, summary })
		});
		if (response.redirected) {
			dirty = false;
			await goto(response.url, {
				replaceState: true,
				keepFocus: true
			});
		}
		invalidateAll();
	};
	beforeNavigate(() => {
		if (dirty) saveNote();
	});

	const debouncedSave = debounce(() => {
		saveNote();
		dirty = false;
	}, 2000);

	let files: FileList | undefined = $state();
	let imagePreview = $state();
	$effect(() => {
		let image = files ? files[0] : null;
		if (!files || !image) {
			imagePreview = null;
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			imagePreview = reader.result as string;
		};
		reader.readAsDataURL(image);
	});

	$effect(() => {
		if (content) {
			dirty = true;
			debouncedSave();
		}
	});
</script>

<div class="prose">
	<h1 class="mb-0">New Note</h1>
	<small class="text-muted-foreground"
		>You can use <a
			href="https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
			target="_blank">Markdown</a
		> or plain text.</small
	>
</div>
<Card.Root>
	<Card.Content>
		{#key $page.data?.note?.id}
			<MarkdownEditor {carta} bind:value={content} />

			<!--<div
				use:editor
				class="min-h-[20rem] w-full"
				onkeyup={() => {
					dirty = true;
					debouncedSave();
				}}
				role="textbox"
				tabindex={0}
			></div>-->
		{/key}</Card.Content
	>
</Card.Root>

<div class="grid grid-cols-1 gap-2 md:grid-cols-2">
	<Dialog.Root bind:open={isPhotoUploadDialogOpen}>
		<!-- TODO: trigger is already a button, need to work out how to style it-->
		<Dialog.Trigger>
			{#snippet child({ props })}<Button {...props}>Upload Photo</Button>{/snippet}</Dialog.Trigger
		>
		<Dialog.Content>
			<form
				enctype="multipart/form-data"
				action="/api/handwriting"
				method="POST"
				use:enhance={({ formElement }) => {
					return ({ result }) => {
						if (result.type === 'success') {
							content = content + '\n' + result.text;
							keywords = keywords ? [...keywords.split(','), ...result.keywords] : result.keywords;
							summary = (summary || '') + '\n' + result.summary;
							isPhotoUploadDialogOpen = false;
							formElement.reset();
							saveNote();
						}
					};
				}}
			>
				<Dialog.Header class="pb-2">
					<Dialog.Title>Upload a photo for handwriting recognition</Dialog.Title>
					<Dialog.Description>
						This will use your API key and will consume OpenAI credits for the image processing.
						Your image will be sent to our server, resized to fit within a 768x1024 box. You will
						get better results with a portrait image.
					</Dialog.Description>
				</Dialog.Header>

				<label>
					<div class="rounded-xl bg-primary p-2">
						<div
							class="aspect-[3/4] w-full rounded-xl border-4 border-dashed border-primary-foreground bg-primary"
							style="background-image: url({imagePreview}); background-size: contain; background-position: center; background-repeat: no-repeat;"
						></div>
					</div>
					<input type="file" bind:files class="hidden" name="image" />
				</label>

				<Dialog.Footer class="pt-2"
					><Dialog.Close
						>{#snippet child({ props })}
							<Button variant="destructive" {...props}>Cancel</Button>{/snippet}</Dialog.Close
					><Button type="submit" disabled={!imagePreview}>Upload</Button></Dialog.Footer
				>
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<Button onclick={saveNote} disabled={!dirty}
		>{#if dirty}<LoaderCircle class="mr-2 size-4 animate-spin" />{:else}
			<Save class="mr-2 size-4" />{/if} Save{#if dirty}{:else}d{/if}</Button
	>
</div>

<Accordion.Root type="single" class="w-full">
	<Accordion.Item value="item-1">
		<Accordion.Trigger>Advanced</Accordion.Trigger>
		<Accordion.Content class="p-2">
			<Label
				>Keywords
				<Input type="text" bind:value={keywords} />
			</Label>
			<Label
				>Summary
				<Input type="text" bind:value={summary} />
			</Label>
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>

<style lang="postcss">
	:global(.carta-font-code),
	:global(.carta-font-code *) {
		font-family: 'Fira Code', monospace !important;
		font-variant-ligatures: normal !important;
		font-size: 1.1rem !important;
		line-height: 1.5rem !important;
	}
</style>
