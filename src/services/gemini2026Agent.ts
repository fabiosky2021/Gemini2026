import { GoogleGenAI, Type } from "@google/genai";
import { withRetry, generateContentWithRetry } from "../utils/geminiRetry";
import localKnowledge from '../data/localKnowledge.json';
import ncpMemory from '../data/ncpMemory.json';

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const Gemini2026 = {
  runTool: async (toolName: string, topic: string, context?: any) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Erro: GEMINI_API_KEY não configurada no ambiente.");
      throw new Error("Configuração de API ausente.");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const modelName = "gemini-3-flash-preview"; // Usando o modelo flash para maior estabilidade e velocidade

    try {
      if (toolName === 'generateVideoPreview') {
        const response = await withRetry(() => ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: `Cinematic high-quality video preview for an ebook titled "${topic}". 
          Show a professional book cover, pages turning, and dynamic text overlays with the promise: ${context?.promise || 'Transform your life'}. 
          Modern, high-conversion aesthetic.`,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: '16:9'
          }
        }));
        return response;
      }

      if (toolName === 'theCloser') {
        const response = await generateContentWithRetry(ai, {
          model: modelName,
          contents: [{ parts: [{ text: `Aja como 'O Fechador'. Sua missão é pegar a promessa: "${topic}" e transformá-la em uma oferta IRRECUSÁVEL.
          1. Use gatilhos de urgência e escassez.
          2. Crie 3 variações de 'Promessa de 1 Clique' (venda imediata).
          3. Identifique a objeção oculta e destrua-a na copy.` }] }],
        });
        return response.text;
      }

      if (toolName === 'growthHacker') {
        const response = await generateContentWithRetry(ai, {
          model: modelName,
          contents: [{ parts: [{ text: `Aja como um Growth Hacker Infinito. Analise o nicho ${topic} e encontre 5 'Brechas de Lucro' que ninguém está explorando.
          Foque em tráfego barato e alta conversão.` }] }],
        });
        return response.text;
      }

      if (toolName === 'spyGeneral') {
        const response = await generateContentWithRetry(ai, {
          model: modelName,
          contents: [{ parts: [{ text: `MISSÃO SPY GERAL: Analise profundamente o nicho ${topic}. 
          1. Identifique as 3 promessas de anúncios mais clicáveis atualmente.
          2. Analise o 'Histórico Artificial' de tendências que falharam e por quê.
          3. Crie um 'Prompt NCP' específico para este nicho evoluir a memória do agente.
          4. Forneça links diretos de espionagem.` }] }],
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        return response.text || "Missão falhou.";
      }

      if (toolName === 'spyAds') {
        const response = await generateContentWithRetry(ai, {
          model: modelName,
          contents: [{ parts: [{ text: `Pesquise anúncios reais, concorrentes e estratégias de tráfego para o nicho: ${topic}. 
          Retorne uma lista de URLs de concorrentes, exemplos de copy de anúncios e links úteis.
          Também inclua o link direto para a Biblioteca de Anúncios do Facebook para este tópico.` }] }],
          config: {
            tools: [{ googleSearch: {} }],
          },
        });
        
        const fbLibraryLink = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&q=${encodeURIComponent(topic)}&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered`;
        
        return `LINK DIRETO PARA BIBLIOTECA DE ANÚNCIOS: ${fbLibraryLink}\n\nPESQUISA DE MERCADO:\n${response.text || "No ads found."}`;
      }

      if (toolName === 'generateLandingPage') {
        const response = await generateContentWithRetry(ai, {
          model: modelName,
          contents: [{ parts: [{ text: `Crie uma Landing Page de Vendas de alta conversão para um ebook sobre: ${topic}.
          Contexto do Ebook: ${JSON.stringify(context)}
          Retorne um objeto JSON com:
          - headline: Título matador
          - subheadline: Promessa forte
          - vsl_script: Roteiro para vídeo de vendas
          - benefits: Lista de 5 benefícios (strings)
          - sections: Array de objetos { title, content } para a página
          - cta_text: Texto do botão de compra` }] }],
          config: {
            responseMimeType: "application/json"
          }
        });
        return JSON.parse(response.text || "{}");
      }

      if (toolName === 'remodelEbook') {
        const prompt = `Aja como um Editor Senior de Best-Sellers. Remodele o conteúdo abaixo para transformá-lo em um EBOOK COMPLETO E PROFISSIONAL.
        
        Título Original: ${context?.title}
        Conteúdo Original: ${context?.script || context?.description}
        
        REQUISITOS DO NOVO CONTEÚDO:
        1. Escreva pelo menos 1000 palavras.
        2. Divida em Introdução, 5 Capítulos Detalhados e Conclusão.
        3. Use um tom persuasivo e educativo.
        4. Adicione uma seção de 'Plano de Ação' ao final de cada capítulo.
        5. Crie uma descrição detalhada para a capa.
        
        O resultado deve ser um LIVRO PERFEITO pronto para venda.`;
        
        const response = await generateContentWithRetry(ai, {
          model: modelName,
          contents: [{ parts: [{ text: prompt }] }],
        });
        return { 
          title: `[LIVRO COMPLETO] ${context?.title}`, 
          script: response.text || "Conteúdo remodelado indisponível.",
          original: context
        };
      }

      if (toolName === 'generateEbook') {
        const generate = async (p: string) => {
          const res = await generateContentWithRetry(ai, {
            model: modelName,
            contents: [{ parts: [{ text: p }] }],
          });
          return res.text || "";
        };

        const title = await generate(`Crie um título irresistível para um ebook sobre: ${topic}`);
        const outline = await generate(`Crie um sumário detalhado com 7 capítulos para um ebook sobre: ${topic}`);
        const script = await generate(`Escreva o CONTEÚDO COMPLETO E EXTENSO (mínimo 1500 palavras) para o ebook: ${title}. 
        Desenvolva cada capítulo do sumário: ${outline}. 
        O texto deve ser rico em detalhes, exemplos e estratégias práticas. Transforme isso em um LIVRO PERFEITO.`);
        
        return { title, outline, script };
      }
    } catch (error: any) {
      console.error(`Erro na ferramenta ${toolName}:`, error);
      
      // Fallback para conhecimento local em caso de erro de API (incluindo 400)
      const fallbackProduct = localKnowledge.products.find(p => 
        p.title.toLowerCase().includes(topic.toLowerCase()) || 
        p.description.toLowerCase().includes(topic.toLowerCase())
      ) || localKnowledge.products[0];
      
      return {
        title: toolName === 'remodelEbook' ? `[REMODELED] ${context?.title}` : fallbackProduct.title,
        outline: fallbackProduct.description,
        script: `[FALLBACK] ${fallbackProduct.ad_copy}\n\n${fallbackProduct.description}`,
        isOffline: true,
        error: error?.message || "Erro desconhecido"
      };
    }
    throw new Error(`Tool ${toolName} not found`);
  }
};

export async function evaluateEbookContent(ebook: { title: string, outline: string, script: string }) {
  const prompt = `Evaluate the following ebook generated by an AI agent. Provide feedback and a score from 0 to 10 based on quality, coherence, and creativity.
  
  Title: ${ebook.title}
  Outline: ${ebook.outline}
  Script: ${ebook.script}
  
  Format the response as JSON: { "feedback": "...", "score": number }`;

  const response = await generateContentWithRetry(ai, {
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });
  
  return JSON.parse(response.text || "{}");
}

export { Gemini2026 };
