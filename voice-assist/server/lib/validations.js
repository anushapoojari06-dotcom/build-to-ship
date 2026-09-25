import { z } from 'zod';

export const voiceProcessSchema = z.object({
  transcript: z.string().min(1, "Transcript cannot be empty"),
  language: z.string().default('en-US'),
  context: z.string().optional()
});

export const formExtractSchema = z.object({
  fieldLabel: z.string().min(1, "Field label cannot be empty"),
  audioTranscript: z.string().min(1, "Audio transcript cannot be empty"),
  fieldType: z.string().default('text'),
  language: z.string().default('en-US')
});

export const docSimplifySchema = z.object({
  documentText: z.string().min(5, "Document text is too short"),
  language: z.string().default('en-US')
});
