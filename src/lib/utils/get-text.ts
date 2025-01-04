import OpenAI from 'openai';

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
		const openai = new OpenAI({
			apiKey,
			dangerouslyAllowBrowser: true
		}); // Note, this isn't actually dangerous because the user themselves is bringing the API key.
		const text = `You are an advanced AI capable of OCR (Optical Character Recognition) and text analysis. Your task is to analyze an image of handwritten text provided via a URL and generate a response in the form of a JSON object. Follow these instructions carefully:

Transcribe: Extract the full handwritten text from the image.
Summarize: Provide a concise summary of the main points in the text.
Extract Keywords: Identify important keywords from the text and return them as a comma-separated list.

Formatting Requirements:

    Output only a JSON object, with no additional text, formatting, or code fences.
    The JSON structure must be as follows:

{
  "text": "Full transcription of the handwritten text.",
  "summary": "Concise summary of the main points.",
  "keywords": "keyword1, keyword2, keyword3"
}

Key Rules:

    Do not include markdown or code fences around the JSON.
    Return only the JSON object.

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
			const response = await openai.chat.completions.create({
				model: 'gpt-4o',
				messages: [
					{
						role: 'user',
						content: [
							{ type: 'text', text },
							{
								type: 'image_url',
								image_url: {
									url: 'data:image/jpeg;base64,' + image
								}
							}
						]
					}
				]
			});
			console.log(response);
			if (!response.choices[0].message.content)
				throw new Error('The response from the API was poorly structured.');
			return JSON.parse(response.choices[0].message.content);
		} catch (e) {
			console.error(e);
			throw new Error('Failed to fetch data. Please check your API key and try again.');
		}
	}
};
