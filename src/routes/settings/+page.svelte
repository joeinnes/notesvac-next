<script>
	import { goto } from '$app/navigation';
	import { deleteDb, getDb } from '$lib/db';
</script>

<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">Settings</h1>
<h2 class="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">API Keys</h2>

<div class="mb-2">
	<label for="OpenAIAPIKey" class="block text-xs font-medium text-gray-700"> OpenAI API Key </label>

	<input
		type="text"
		id="OpenAIAPIKey"
		placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
		class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
		name="OpenAIAPIKey"
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
		class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
		name="GCPAPIKey"
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
					Results are significantly worse, but pricing is better. GCP gives 1000 'units' (for our
					purposes, this equates to 'pages') free per month, and the cost of additional 'units' is ${1.5 /
						1000}. Assuming you're not using cloud vision credits anywhere else with your GCP
					account, this is almost certainly the cheapest option, and in most cases will be
					completely free (unless you're writing more than 30 pages a day).
				</p>
			</div>

			<input
				type="radio"
				name="api_choices"
				value="GCP"
				id="GCP"
				class="size-5 border-gray-300 text-primary-500"
				checked
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
					ChatGPT is generally much more capable, but pricing is more complex. Initially, you can
					expect to pay $0.003825 per image, with additional cost for input tokens and output
					tokens. Our default prompt is around 300 tokens (${(2.5 * 300) / 1000000}), and you can
					expect your response to at least double that in output tokens (which are three times as
					expensive at ${(7.5 * 300) / 1000000}). Note that automated summaries and keyword
					generation is only available using ChatGPT. An average user uploading 3 pages per day can
					expect to pay around ${3 * 30 * (0.003825 + 0.00225 + 0.00075)} per month depending on handwriting
					density.
				</p>
			</div>

			<input
				type="radio"
				name="api_choices"
				value="ChatGPT"
				id="ChatGPT"
				class="size-5 border-gray-300 text-primary-500"
				disabled
			/>
		</label>
	</div>
</fieldset>

<h2 class="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">Get My Data</h2>

<div>
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
</div>

<h2 class="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">Here Be Dragons 🐉</h2>

<div>
	<button
		type="button"
		class="mt-2 rounded-lg border border-red-500 bg-red-500 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-all hover:border-red-700 hover:bg-red-700 focus:ring focus:ring-red-200 disabled:cursor-not-allowed disabled:border-red-300 disabled:bg-red-300"
		onclick={async () => {
			const res = confirm(
				'Are you sure? There is no going back. Your database will be lost forever.'
			);
			if (res) {
				await deleteDb();
				goto('/');
			}
		}}
	>
		Delete Database
	</button>
</div>
