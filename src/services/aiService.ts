import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateHooks(mechanism: string, referenceAd: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Você é o "Rei dos Copywritings". 
    Anúncio de referência: "${referenceAd}"
    Novo mecanismo: "${mechanism}"
    
    Entregue 10 hooks (ganchos) focados no novo mecanismo, com altíssima quebra de padrão, para fazer a pessoa parar de rolar na hora.`,
  });
  return response.text;
}

export async function generateBody(hook: string, mechanism: string, referenceAd: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Você é o "Rei dos Copywritings".
    Anúncio de referência: "${referenceAd}"
    Novo mecanismo: "${mechanism}"
    Hook escolhido: "${hook}"
    
    Crie o corpo do anúncio entre 30 e 50 segundos, focado no novo mecanismo.`,
  });
  return response.text;
}
