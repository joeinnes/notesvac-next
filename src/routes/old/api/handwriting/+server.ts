import OpenAI from "openai";
import type { RequestHandler } from './$types';
import { json, error } from "@sveltejs/kit";
import sharp from 'sharp';
export const POST: RequestHandler = async ({ request, locals }) => {
  const { user } = locals;
  if (!user || !user?.apiKey) {
    error(401, {message: 'Unauthorized'});
  }
  const data = await request.formData();
  const file = data.get('image') as File;
  if (!file) error(400, { message: "No file uploaded" });  
  const openai = new OpenAI({
    apiKey: user.apiKey
  });
  let fileBuffer: Buffer | null = null;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fileBuffer = await sharp(buffer)
                .resize({ width: 1024, height: 1024, fit: 'inside' }).withMetadata()
                .toBuffer();
        
  const b64image = fileBuffer ? fileBuffer.toString('base64') : null;
  return json({ type: 'success', text: `# Wow!
This actually worked! **So**, __we can see__ ~~if~~ how it works.`, b64image, keywords:['test','wow','working'], summary:'This note indicates surprise at a successful test outcome.' });
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
              "url": "data:image/jpeg;base64," + b64image,
            },
          },
        ],
      },
    ],
  });
  console.log(response)
  return json(response.choices[0]);
} catch (e) {
  console.log(e)
  error(500, { message: 'Failed to transcribe' });
}
}