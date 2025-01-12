import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const TranscribedNote = z.object({
	text: z
		.string()
		.describe(
			'The full handwritten text, extracted from the image and formatted as markdown in accordance with provided guidelines.'
		),
	summary: z.string().describe('A concise summary of the main points in the text.'),
	keywords: z
		.string()
		.describe(
			'Important keywords from the text as a comma-separated list to better enable search discovery.'
		)
});

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
		// TODO: use the resized image.
		const openai = new OpenAI({
			apiKey,
			dangerouslyAllowBrowser: true
		}); // Note, this isn't actually dangerous because the user themselves is bringing the API key.
		const text = `You are an advanced AI capable of OCR (Optical Character Recognition) and text analysis. Your task is to analyze an image of handwritten text provided via a URL and generate a response in the form of a JSON object. Follow these instructions carefully:

Transcribe: Extract the full handwritten text from the image.
Summarize: Provide a concise summary of the main points in the text.
Extract Keywords: Identify important keywords from the text and return them as a comma-separated list.

Additional Guidance: 
Normal text and headings:
- Headings in the notebook should use # for Markdown headings. 
- If a new top level heading appears part-way through the image, use a dividing line above the heading to separate the sections (---).
- Standard bullet points should use - or *.
- Numbered lists should use 1. or similar.
    
Special bullet points:
- A circle (◯) indicates an event. Transcribe as a normal bullet point (-).
- A box (☐) represents a to-do item:
- Empty box: incomplete task → - [ ].
- Box with a diagonal line: partially completed task → - [/].
- Box with a cross: completed task → - [x].
- Arrow symbol (→): task moved → - [>].
- A circle with a smaller circle or dot (⊙ or •) represents a musical album listened to. Transcribe using ♪ as the bullet point.

Follow these instructions exactly. Failure to do so will result in an invalid response."`;
		try {
			const response = await openai.beta.chat.completions.parse({
				model: 'gpt-4o',
				messages: [
					{ role: 'system', content: text },
					{
						role: 'user',
						content: [
							{ type: 'text', text: 'Extract data from the image' },
							{
								type: 'image_url',
								image_url: {
									url: 'data:image/jpeg;base64,' + image
								}
							}
						]
					}
				],
				response_format: zodResponseFormat(TranscribedNote, 'transcribed_note')
			});
			if (!response.choices[0].message?.parsed)
				throw new Error('The response from the API was poorly structured.');
			return response.choices[0].message.parsed;
		} catch (e) {
			console.error(e);
			throw new Error('Failed to fetch data. Please check your API key and try again.');
		}
	}
};
