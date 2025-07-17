import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export const kimiProvider = () => {
  const openai = createOpenAI({
    baseURL: 'https://api.moonshot.cn/v1',
    apiKey: process.env.KIMI_API_KEY,
  });

  return {
    id: 'kimi',
    name: 'Kimi K2',
    // Pick any model alias you want to expose in the UI
    models: {
      'kimi-k2': openai('kimi-k2-0711-preview') as LanguageModelV1,
      'kimi-k1': openai('kimi-k1-0711-preview') as LanguageModelV1,
    },
  };
};