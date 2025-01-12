<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { deleteDb, getDb, overwriteDb } from '$lib/db';
	import { db } from '$lib/db/db.svelte';
	import { page } from '$app/stores';
	import { Toasts } from '$lib/components/Toaster/toaster.svelte';
	import transformToMarkdownString from '$lib/utils/markdownify';
	import JSZip from 'jszip';
	import { saveAs } from 'file-saver';
	let { user } = $derived($page.data);
	let restoreDb: FileList | null | undefined = $state();
	let avatar: File | null = $state(null);
	let avatarPreview: string | null = $state('');

	$effect(() => {
		if (user.avatar) {
			avatarPreview = user?.avatar;
		}
	});

	const handleAvatarChange = (event: Event) => {
		const fileInput = event.target as HTMLInputElement;
		if (fileInput.files && fileInput.files[0]) {
			avatar = fileInput.files[0];

			// Create a preview of the image
			const reader = new FileReader();
			reader.onload = () => {
				avatarPreview = reader.result as string;
				db.db
					?.updateTable('user')
					.set({ avatar: avatarPreview })
					.where('id', '=', user.id)
					.returningAll()
					.executeTakeFirst()
					.then((res) => {
						if (res) {
							invalidateAll();
						}
					});
			};
			reader.readAsDataURL(avatar);
		} else {
			avatar = null;
			avatarPreview = null;
		}
	};
</script>

<div class="p-4">
	{#if user}
		<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Settings</h1>
		<h2 class="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">Profile</h2>

		<div class="mb-2">
			<label for="name" class="block text-xs font-medium text-gray-700">Name</label>

			<input
				type="text"
				id="name"
				placeholder="Name"
				class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
				name="name"
				value={$page.data.user.name}
				onchange={(e: Event & { currentTarget: HTMLInputElement }) => {
					const name = e.currentTarget.value;
					db.db
						?.updateTable('user')
						.set({ name })
						.where('id', '=', user.id)
						.returningAll()
						.executeTakeFirst()
						.then((res) => {
							if (res) {
								invalidateAll();
							}
						});
				}}
			/>
		</div>

		<div class="mb-2">
			<label for="username" class="block text-xs font-medium text-gray-700"> Username </label>

			<input
				type="text"
				id="username"
				placeholder="Username"
				class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
				name="username"
				value={$page.data.user.username}
				onchange={(e: Event & { currentTarget: HTMLInputElement }) => {
					const username = e.currentTarget.value;
					db.db
						?.updateTable('user')
						.set({ username })
						.where('id', '=', user.id)
						.returningAll()
						.executeTakeFirst()
						.then((res) => {
							if (res) {
								invalidateAll();
							}
						});
				}}
			/>
		</div>

		<div class="mb-2">
			<label for="avatar" class="block text-xs font-medium text-gray-700">
				Avatar
				<div class="h-32 w-32 overflow-hidden rounded-full bg-secondary-100">
					{#if avatarPreview}
						<img
							class="h-full w-full rounded-full object-cover object-center"
							src={avatarPreview}
							alt=""
						/>
					{:else}
						<svg
							class="h-full w-full text-secondary-400"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h1 1 14H20z"
							></path>
						</svg>
					{/if}
				</div>
				<input
					type="file"
					id="avatar"
					placeholder="Avatar"
					class="mt-1 hidden w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
					name="avatar"
					onchange={handleAvatarChange}
				/>
			</label>
		</div>

		<h2 class="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">API Keys</h2>

		<div class="mb-2">
			<label for="OpenAIAPIKey" class="block text-xs font-medium text-gray-700">
				OpenAI API Key
			</label>

			<input
				type="text"
				id="OpenAIAPIKey"
				placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
				class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
				name="OpenAIAPIKey"
				value={$page.data.user.openai_api_key}
				onchange={(e: Event & { currentTarget: HTMLInputElement }) => {
					const openai_api_key = e.currentTarget.value;
					db.db
						?.updateTable('user')
						.set({ openai_api_key })
						.where('id', '=', user.id)
						.returningAll()
						.executeTakeFirst()
						.then((res) => {
							if (res) {
								invalidateAll();
							}
						});
				}}
			/>
		</div>
		<div>
			<label for="GCPAPIKey" class="block text-xs font-medium text-gray-700">
				Google Cloud Platform API Key
			</label>

			<input
				type="text"
				id="GCPAPIKey"
				placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
				value={$page.data.user.gcp_api_key}
				class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
				name="GCPAPIKey"
				onchange={(e: Event & { currentTarget: HTMLInputElement }) => {
					const gcp_api_key = e.currentTarget.value;
					db.db
						?.updateTable('user')
						.set({ gcp_api_key })
						.where('id', '=', user.id)
						.returningAll()
						.executeTakeFirst()
						.then((res) => {
							if (res) {
								invalidateAll();
							}
						});
				}}
			/>
		</div>
		<h2 class="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">API Options</h2>
		<small>Note: prices correct as of 03-Jan-2025.</small>
		<fieldset class="space-y-4">
			<legend class="sr-only">Cloud Platform for Handwriting Recognition</legend>

			<div>
				<label
					for="GCP"
					class="flex cursor-pointer flex-row-reverse items-center justify-between gap-4 rounded-lg border border-gray-100 bg-white p-4 text-sm font-medium shadow-sm hover:border-gray-200 has-[:disabled]:cursor-not-allowed has-[:checked]:border-primary-500 has-[:disabled]:bg-gray-100 has-[:disabled]:text-gray-400 has-[:checked]:ring-1 has-[:checked]:ring-primary-500"
				>
					<div>
						<p class="text-gray-700">Google Cloud Platform</p>

						<p class="mt-1 text-gray-900">
							Results are significantly worse, but pricing is better. GCP gives 1000 'units' (for
							our purposes, this equates to 'pages') free per month, and the cost of additional
							'units' is ${1.5 / 1000}. Assuming you're not using cloud vision credits anywhere else
							with your GCP account, this is almost certainly the cheapest option, and in most cases
							will be completely free (unless you're writing more than 30 pages a day).
						</p>
					</div>

					<input
						type="radio"
						name="api_choices"
						value="GCP"
						id="GCP"
						class="size-5 border-gray-300 text-primary-500"
						checked={user.handwriting_api_choice === 'GCP'}
						onchange={(e: Event & { currentTarget: HTMLInputElement }) => {
							const handwriting_api_choice = e.currentTarget.value;
							if (handwriting_api_choice !== 'GCP' && handwriting_api_choice !== 'ChatGPT') return;
							db.db
								?.updateTable('user')
								.set({ handwriting_api_choice })
								.where('id', '=', user.id)
								.returningAll()
								.executeTakeFirst()
								.then((res) => {
									if (res) {
										invalidateAll();
									}
								});
						}}
					/>
				</label>
			</div>

			<div>
				<label
					for="ChatGPT"
					class="flex cursor-pointer flex-row-reverse items-center justify-between gap-4 rounded-lg border border-gray-100 bg-white p-4 text-sm font-medium shadow-sm hover:border-gray-200 has-[:disabled]:cursor-not-allowed has-[:checked]:border-primary-500 has-[:disabled]:bg-gray-100 has-[:disabled]:text-gray-400 has-[:checked]:ring-1 has-[:checked]:ring-primary-500"
				>
					<div>
						<p class="text-gray-700">ChatGPT</p>

						<p class="mt-1 text-gray-900">
							ChatGPT is generally much more capable, but pricing is more complex. Initially, you
							can expect to pay $0.003825 per image, with additional cost for input tokens and
							output tokens. Our default prompt is around 300 tokens (${(2.5 * 300) / 1000000}), and
							you can expect your response to at least double that in output tokens (which are three
							times as expensive at ${(7.5 * 300) / 1000000}). An average user uploading 3 pages per
							day can expect to pay around ${3 * 30 * (0.003825 + 0.00225 + 0.00075)} per month depending
							on handwriting density. Note that automated summaries, keyword generation, and 'chat with
							my notes' is only available using ChatGPT.
						</p>
					</div>

					<input
						type="radio"
						name="api_choices"
						value="ChatGPT"
						id="ChatGPT"
						class="size-5 border-gray-300 text-primary-500"
						onchange={(e: Event & { currentTarget: HTMLInputElement }) => {
							const handwriting_api_choice = e.currentTarget.value;
							if (handwriting_api_choice !== 'GCP' && handwriting_api_choice !== 'ChatGPT') return;
							db.db
								?.updateTable('user')
								.set({ handwriting_api_choice })
								.where('id', '=', user.id)
								.returningAll()
								.executeTakeFirst()
								.then((res) => {
									if (res) {
										invalidateAll();
									}
								});
						}}
						checked={user.handwriting_api_choice === 'ChatGPT'}
						disabled={!user.openai_api_key}
					/>
				</label>
			</div>
		</fieldset>

		<h2 class="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">Get My Data</h2>

		<div class="gap-2 md:flex">
			<button
				type="button"
				class="mt-2 rounded-lg border border-secondary-500 bg-secondary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-secondary-700 hover:bg-secondary-700 focus:ring focus:ring-secondary-200 disabled:cursor-not-allowed disabled:border-secondary-300 disabled:bg-secondary-300"
				onclick={async () => {
					const databaseFile = await getDb();
					const fileUrl = URL.createObjectURL(databaseFile);
					const a = document.createElement('a');
					a.href = fileUrl;
					a.download = 'notesvac.sqlite3';
					a.click();
					a.remove();
					URL.revokeObjectURL(fileUrl);
				}}
			>
				Download Database
			</button>

			<button
				type="button"
				class="mt-2 rounded-lg border border-secondary-500 bg-secondary-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-secondary-700 hover:bg-secondary-700 focus:ring focus:ring-secondary-200 disabled:cursor-not-allowed disabled:border-secondary-300 disabled:bg-secondary-300"
				onclick={async () => {
					const notes = await db.db?.selectFrom('note').selectAll().execute();
					if (!notes) {
						Toasts.addToast('error', 'No notes to download!');
						return;
					}
					const zip = new JSZip();
					notes.forEach((note) => {
						let { content, ...frontmatter } = note;
						const thisNote = transformToMarkdownString({
							frontmatter: Object.keys(frontmatter).map((el) => ({ [el]: frontmatter[el] })),
							body: content || ''
						});
						zip.file(note.created_at + ' ' + note.id + '.md', thisNote);
					});
					zip.generateAsync({ type: 'blob' }).then(
						function (blob) {
							saveAs(blob, 'My Notes.zip');
						},
						function (err) {
							console.error(err);
						}
					);
				}}
			>
				Download Notes as Markdown Files
			</button>
		</div>

		<h2 class="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">Here Be Dragons 🐉</h2>

		<div class="grid gap-4 md:grid-cols-2">
			<div>
				<h3 class="text-xl font-semibold">Restore database from a backup</h3>
				<p>This will delete any existing notes in your current database.</p>
				<label for="restore_db" class="mb-1 block text-sm font-medium text-gray-700"
					>Upload file</label
				>
				<input
					type="file"
					id="restore_db"
					name="restore_db"
					bind:files={restoreDb}
					class="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary-500 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-700 focus:outline-none disabled:pointer-events-none disabled:opacity-60"
				/>
				<button
					type="button"
					class="mt-2 rounded-lg border border-red-500 bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-red-700 hover:bg-red-700 focus:ring focus:ring-red-200 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-300"
					onclick={async () => {
						const res = confirm(
							'Are you sure? There is no going back. If your current database has content, it will be overwritten and lost forever.'
						);
						if (res && restoreDb) {
							await overwriteDb(restoreDb[0]);
							Toasts.addToast('success', 'Your database was successfully restored.');
							await goto('/', {
								invalidateAll: true
							});
						} else {
							Toasts.addToast('warning', 'Your database was not overwritten.');
						}
					}}
					disabled={!restoreDb}
				>
					Restore Database
				</button>
			</div>

			<div>
				<h3 class="text-xl font-semibold">Delete database</h3>
				<p>This will delete all notes in your database.</p>
				<button
					type="button"
					class="mt-2 rounded-lg border border-red-500 bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-red-700 hover:bg-red-700 focus:ring focus:ring-red-200 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-300"
					onclick={async () => {
						const res = confirm(
							'Are you sure? There is no going back. Your database will be lost forever.'
						);
						if (res) {
							await deleteDb();
							await goto('/', {
								invalidateAll: true
							});
						}
					}}
				>
					Delete Database
				</button>
			</div>
		</div>
	{/if}
</div>
