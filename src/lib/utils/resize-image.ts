export const resizeImage = async (
	url: string,
	options = {
		maxWidth: 1024,
		maxHeight: 1024,
		contentType: 'image/jpeg',
		quality: 1
	}
): Promise<{ url: string; contentType: string; b64: string; size: number }> => {
	const calculateSize = (img: HTMLImageElement) => {
		let w = img.width,
			h = img.height;
		if (w > h) {
			if (w > options.maxWidth) {
				h = Math.round((h * options.maxWidth) / w);
				w = options.maxWidth;
			}
		} else {
			if (h > options.maxHeight) {
				w = Math.round((w * options.maxHeight) / h);
				h = options.maxHeight;
			}
		}
		return [w, h];
	};

	return new Promise<{
		url: string;
		contentType: string;
		b64: string;
		size: number;
	}>((resolve, reject) => {
		try {
			const img = new Image();
			img.src = url;
			img.onerror = function () {
				URL.revokeObjectURL(this.src);
			};
			img.onload = function () {
				URL.revokeObjectURL(img.src); // Can't use this as 'this' is an event handler
				const [newWidth, newHeight] = calculateSize(img);
				const canvas = document.createElement('canvas');
				canvas.width = newWidth;
				canvas.height = newHeight;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.imageSmoothingQuality = 'high';
					ctx.imageSmoothingEnabled = true;
				}
				ctx?.drawImage(img, 0, 0, newWidth, newHeight);

				const resultUrl = canvas.toDataURL(options.contentType, options.quality),
					result = {
						url: resultUrl,
						contentType: resultUrl.match(/^data:([^;]+);base64,/im)?.[1] || '',
						b64: resultUrl.replace(/^data:([^;]+);base64,/gim, ''),
						size: 0
					};

				canvas.toBlob(
					(blob) => {
						result.size = blob?.size || 0;
						resolve(result);
					},
					options.contentType,
					options.quality
				);
			};
		} catch (e) {
			console.log(e);
			reject('');
		}
	});
};
