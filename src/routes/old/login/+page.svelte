<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Login/Register</Card.Title>
	</Card.Header>
	<Card.Content
		><form method="post" action="?/login" use:enhance>
			<Label>
				Username
				<Input name="username" />
			</Label>
			<Label>
				Password
				<Input type="password" name="password" />
			</Label>
			<br />
			<Button type="submit">Login</Button>
			<Button formaction="?/register" variant="secondary" type="submit">Register</Button>
		</form>
		<p style="color: red">{form?.message ?? ''}</p></Card.Content
	>
</Card.Root>
