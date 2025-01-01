<script lang="ts">
	import SuperDebug from 'sveltekit-superforms';
	import type { PageData, ActionData } from './$types';
	import { AspectRatio } from '$lib/components/ui/aspect-ratio/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { formSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	let { data }: { data: PageData & { profileForm: SuperValidated<Infer<FormSchema>> } } = $props();
	let { user } = $derived(data);
	let avatar: File | null = $state(null);
	let avatarPreview: string | null = $state(null);

	const form = superForm(data.profileForm, {
		validators: zodClient(formSchema)
	});

	const { enhance, errors } = form;

	const formData = form.form;

	const handleAvatarChange = (event: Event) => {
		const fileInput = event.target as HTMLInputElement;
		if (fileInput.files && fileInput.files[0]) {
			$formData.avatar = fileInput.files[0];

			// Create a preview of the image
			const reader = new FileReader();
			reader.onload = () => {
				avatarPreview = reader.result as string;
			};
			reader.readAsDataURL($formData.avatar);
		} else {
			$formData.avatar = null;
			avatarPreview = null;
		}
	};
</script>

{#if $formData && user}
	<form method="POST" enctype="multipart/form-data" action="/profile" use:enhance>
		<div class="flex gap-2">
			<div class="w-1/6">
				<Form.Field {form} name="avatar">
					<Form.Control>
						<Form.Label
							>Avatar<br /><AspectRatio ratio={1 / 1}>
								<Avatar.Root class="h-full w-full rounded-lg">
									<Avatar.Image
										src={avatarPreview ?? 'data:image/jpeg;base64,' + user.avatar}
										alt="Avatar Preview"
										class="rounded-lg object-cover"
									/>
									<Avatar.Fallback class="aspect-square rounded-lg"
										>{user?.name
											?.split(' ')
											.map((el) => el[0])
											.join('') ?? '??'}</Avatar.Fallback
									>
								</Avatar.Root>
							</AspectRatio></Form.Label
						>
						<Input
							type="file"
							bind:value={$formData.avatar}
							accept="image/*"
							onchange={handleAvatarChange}
							name="avatar"
						/>
					</Form.Control>

					<Form.FieldErrors />
				</Form.Field>
			</div>

			<div class="w-5/6">
				<Form.Field {form} name="name">
					<Form.Control>
						<Form.Label>Name</Form.Label>
						<Input bind:value={$formData.name} name="name" required />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="apiKey">
					<Form.Control>
						<Form.Label>API Key</Form.Label>
						<Input bind:value={$formData.apiKey} name="apiKey" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
		</div>

		<Form.Button type="submit" onclick={() => form.submit()}>Update</Form.Button>
	</form>
{/if}
