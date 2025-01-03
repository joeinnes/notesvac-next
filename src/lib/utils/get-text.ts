export const getText = async (vendor: string, apiKey: string, image: string) => {
	if (vendor === 'GCP') {
		const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
			method: 'POST',
			body: JSON.stringify({
				requests: [
					{
						image: {
							content: image
						},
						features: [
							{
								type: 'DOCUMENT_TEXT_DETECTION'
							}
						]
					}
				]
			})
		});
		if (!res.ok) {
			throw new Error('Failed to fetch data. Please check your API key and try again.');
		}
		const json = await res.json();
		const text = json.responses[0].fullTextAnnotation.text;
		return {
			text,
			keywords: '',
			summary: ''
		};
	} else if (vendor === 'ChatGPT') {
		console.log('NOT IMPLEMENTED');
	}
};
