import { GoogleGenerativeAI } from '@google/generative-ai';

const generativeAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = generativeAi.getGenerativeModel({
  model: 'gemini-2.5-flash',
});
