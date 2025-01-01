import type { PageServerLoad, Actions } from './$types';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db'; // Your Drizzle SQLite database connection
import { user } from '$lib/db/schema'; // Your SQLite schema
import sharp from 'sharp';
import { error } from '@sveltejs/kit';
import { superValidate, fail, message } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod } from 'sveltekit-superforms/adapters';
export const load = (async ({ locals }) => {
	const user = locals.user;
	if (!user) error(401, 'Unauthorized');
	const transformedUser: Omit<typeof user, 'avatar'> & { avatar?: string | null } = {
		...user,
		apiKey: user.apiKey || ''
	};
	delete transformedUser.avatar;
	return {
		user,
		profileForm: await superValidate(transformedUser, zod(formSchema))
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async (event) => {
		const { locals } = event;
		const currentUser = locals?.user;
		if (!currentUser) error(401, 'Unauthorized');
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) return fail(400, { form });
		if (typeof form.data.avatar === 'string') {
			return fail(400, { form });
		}
		let avatarBuffer: Buffer | null = null;

		if (form.data.avatar) {
			const avatarArrayBuffer = await form.data.avatar.arrayBuffer();
			const buffer = Buffer.from(avatarArrayBuffer);

			avatarBuffer = await sharp(buffer)
				.resize({ width: 256, height: 256, fit: 'inside' })
				.toBuffer();
		}
		const avatarString = avatarBuffer ? avatarBuffer.toString('base64') : null;
		await db
			.update(user)
			.set({
				name: form.data.name || currentUser.name,
				avatar: avatarString || currentUser.avatar,
				apiKey: form.data.apiKey || currentUser.apiKey
			})
			.where(eq(user.id, currentUser.id)); // Replace with actual user lookup logic

		return message(form, { toastType: 'success', message: 'Successfully updated your profile!' });
		// return { status: 200, body: { success: true } };
	}
};
