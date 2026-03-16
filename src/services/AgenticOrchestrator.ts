import { GoogleGenAI } from "@google/genai";
import localKnowledge from '../data/localKnowledge.json';

// Using free-tier model for efficiency
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runAutonomousTask(task: string, context: any) {
  console.log(`Running autonomous task: ${task}`);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Task: ${task}\nContext: ${JSON.stringify(context)}\nProvide a JSON response with the result.`,
      config: {
        systemInstruction: "You are an autonomous agent assistant. Be concise, efficient, and use minimal tokens. Always return JSON.",
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.warn("Autonomous task failed, using local knowledge base.", error);
    const fallback = localKnowledge.products[0];
    return {
      title: fallback.title,
      outline: fallback.description,
      script: fallback.ad_copy,
      isOffline: true
    };
  }
}
