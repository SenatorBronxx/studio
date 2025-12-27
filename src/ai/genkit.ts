/**
 * @fileoverview This file initializes the Genkit AI platform with necessary plugins.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { nextDev } from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
    nextDev(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});
