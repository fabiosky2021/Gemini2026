import { generateEbookContent } from './openRouterService';

// Define a simple orchestrator
const Gemini2026 = {
  runTool: async (toolName: string, topic: string) => {
    if (toolName === 'generateEbook') {
      const title = await generateEbookContent(topic, 'title');
      const outline = await generateEbookContent(topic, 'outline');
      const script = await generateEbookContent(topic, 'script');
      return { title, outline, script };
    }
    throw new Error(`Tool ${toolName} not found`);
  }
};

export { Gemini2026 };
