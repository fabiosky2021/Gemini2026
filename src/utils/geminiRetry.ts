import { GenerateContentParameters, GenerateContentResponse, GoogleGenAI } from "@google/genai";

/**
 * Utility to call Gemini API with exponential backoff on 429 errors.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.message?.includes("429") || 
                          error?.status === 429 || 
                          error?.message?.includes("RESOURCE_EXHAUSTED");
      
      if (isRateLimit && retries < maxRetries) {
        const delay = initialDelay * Math.pow(2, retries);
        console.warn(`Gemini Rate Limit hit. Retrying in ${delay}ms... (Attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
        continue;
      }
      throw error;
    }
  }
}

/**
 * Wrapper for generateContent with retry logic.
 */
export async function generateContentWithRetry(
  ai: any,
  params: GenerateContentParameters,
  maxRetries: number = 3
): Promise<GenerateContentResponse> {
  return withRetry(() => ai.models.generateContent(params), maxRetries);
}
