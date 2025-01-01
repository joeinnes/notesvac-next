	
import { z } from "zod";
 
export const formSchema = z.object({
    name: z.string().min(2).max(50),
    avatar: z.instanceof(File, { message: 'Please upload a file.'})
    .refine((f) => f.size < 10_000_000, 'Max 10 MB upload size.').optional(),
    apiKey: z.string().optional()
});
 
export type FormSchema = typeof formSchema;

