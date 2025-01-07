class Toaster {
	toasts: {
		id: string;
		type: 'success' | 'error' | 'warning' | 'default';
		content: string;
	}[] = $state([]);
	addToast(type: 'success' | 'error' | 'warning' | 'default', content: string, timeout?: number) {
		const id = crypto.randomUUID();
		this.toasts = [{ id, type, content }, ...this.toasts];
		setTimeout(() => {
			this.toasts = this.toasts.filter((el) => el.id !== id);
		}, timeout || 3000);
	}
	dismissToast(id: string) {
		this.toasts = this.toasts.filter((el) => el.id !== id);
	}
	get() {
		return this.toasts;
	}
}

export const Toasts = new Toaster();
