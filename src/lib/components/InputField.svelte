<script lang="ts">
	let {
		id,
		label,
		value = $bindable(),
		onChange,
		type = 'text'
	}: {
		id: string;
		label: string;
		value: string | null;
		onChange: () => void;
		type?: 'textarea' | 'text' | 'date';
	} = $props();
	$effect(() => {
		() => onChange();
	}); // Run the change handler before teardown
</script>

<div class="mb-2">
	<label for={id} class="block text-xs font-medium text-gray-700">{label}</label>
	{#if type === 'text' || type === 'date'}
		<input
			{type}
			{id}
			class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
			bind:value
			onchange={onChange}
		/>
	{:else if type === 'textarea'}
		<textarea
			{id}
			class="mt-1 w-full rounded-md border-gray-200 shadow-sm sm:text-sm"
			bind:value
			onchange={onChange}
			rows={5}
		></textarea>
	{/if}
</div>
