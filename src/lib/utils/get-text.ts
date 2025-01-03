import OpenAI from "openai";

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
    apiKey
  });
		const text = `Please use your vision abilities to analyze the attached image of a handwritten notebook and transcribe the content into Markdown format. You MUST maintain the structure and organization of the original notes while adhering to the following transcription rules for specific bullet points:
    
        Normal text and headings:
            Headings in the notebook should use # for Markdown headings.
            Standard bullet points should use - or *.
            Numbered lists should use 1. or similar.
    
        Special bullet points:
            A circle (◯) indicates an event. Transcribe as a normal bullet point (-).
            A box (☐) represents a to-do item:
                Empty box: incomplete task → - [ ].
                Box with a diagonal line: partially completed task → - [/].
                Box with a cross: completed task → - [x].
                Arrow symbol (→): task moved → - [>].
            A circle with a smaller circle or dot (⊙ or •) represents a musical album listened to. Transcribe using ♪ as the bullet point.
    
    You MUST ensure the output is clean, accurate, and formatted in Markdown. You SHOULD use appropriate context clues to figure out any potential transcription errors you may have made, and correct them appropriately.
    
    You MUST also provide a list of search keywords and a brief summary of the most salient points. Format your answer as a JSON object with the properties 'text', 'summary' and 'keywords'.`
      try {
        const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text },
              {
                type: "image_url",
                image_url: {
                  image
                },
              },
            ],
          },
        ],
      });
      console.log(response)
      return response;
	}
};
