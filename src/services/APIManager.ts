// /src/services/APIManager.ts

// Simple failover manager for API calls
export const APIManager = {
  // Add your API keys/configurations here
  // In a real app, these would be managed via secure settings
  providers: [
    { name: 'Gemini', key: process.env.GEMINI_API_KEY },
    // Add other providers here for failover
  ],

  async call(task: (key: string) => Promise<any>) {
    for (const provider of this.providers) {
      if (!provider.key) continue;
      try {
        return await task(provider.key);
      } catch (error) {
        console.error(`Provider ${provider.name} failed, trying next...`);
      }
    }
    throw new Error('All API providers failed');
  }
};
