export interface ShortcutParams {
	alt?: boolean;
	shift?: boolean;
	control?: boolean;
	code: string;
	callback?: (node: HTMLElement) => void;
}

export const shortcut = (node: HTMLElement, params: ShortcutParams) => {
	let handler: (e: KeyboardEvent) => void;

	const removeHandler = () => window.removeEventListener('keydown', handler),
		setHandler = () => {
			removeHandler();
			if (!params) return;
			handler = (e: KeyboardEvent) => {
				if (
					!!params.alt != e.altKey ||
					!!params.shift != e.shiftKey ||
					!!params.control != (e.ctrlKey || e.metaKey) ||
					params.code != e.code
				)
					return;
				e.preventDefault();
				e.stopPropagation();
				if (params.callback) {
					params.callback(node);
				} else {
					node.click();
				}
			};
			window.addEventListener('keydown', handler);
		};
	setHandler();
	return {
		update: setHandler,
		destroy: removeHandler
	};
};
