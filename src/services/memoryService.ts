// Serviço de Memória Infinita com NCP (Neural Context Protocol)
// Usa OpenClaw para persistência de memória e OpenRouter para LLM

interface MemoryEntry {
  id: string;
  content: string;
  embedding?: number[];
  timestamp: number;
  type: 'conversation' | 'fact' | 'preference' | 'context';
  metadata?: Record<string, any>;
}

interface ConversationContext {
  shortTermMemory: MemoryEntry[];
  relevantLongTermMemory: MemoryEntry[];
  userProfile: Record<string, any>;
}

class InfiniteMemoryService {
  private shortTermMemory: MemoryEntry[] = [];
  private longTermMemory: MemoryEntry[] = [];
  private userProfile: Record<string, any> = {};
  private maxShortTermEntries = 20;
  private storageKey = 'adstudio_assistant_memory';

  constructor() {
    this.loadFromStorage();
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.longTermMemory = data.longTermMemory || [];
        this.userProfile = data.userProfile || {};
      }
    } catch (error) {
      console.error('Error loading memory:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        longTermMemory: this.longTermMemory,
        userProfile: this.userProfile,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving memory:', error);
    }
  }

  // Adiciona uma nova entrada de memória
  addMemory(content: string, type: MemoryEntry['type'], metadata?: Record<string, any>): MemoryEntry {
    const entry: MemoryEntry = {
      id: this.generateId(),
      content,
      timestamp: Date.now(),
      type,
      metadata,
    };

    this.shortTermMemory.push(entry);

    // Consolida memória de curto prazo para longo prazo quando necessário
    if (this.shortTermMemory.length > this.maxShortTermEntries) {
      this.consolidateMemory();
    }

    return entry;
  }

  // Consolida memórias de curto prazo em memória de longo prazo
  private consolidateMemory(): void {
    const toConsolidate = this.shortTermMemory.slice(0, 5);
    this.shortTermMemory = this.shortTermMemory.slice(5);

    // Adiciona ao longo prazo com sumarização implícita
    toConsolidate.forEach(entry => {
      this.longTermMemory.push(entry);
    });

    this.saveToStorage();
  }

  // Busca memórias relevantes usando similaridade semântica simples
  searchRelevantMemories(query: string, limit: number = 5): MemoryEntry[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    
    const scored = this.longTermMemory.map(entry => {
      const contentWords = entry.content.toLowerCase().split(/\s+/);
      const overlap = queryWords.filter(w => contentWords.includes(w)).length;
      return { entry, score: overlap };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.entry);
  }

  // Obtém o contexto completo para uma conversa
  getConversationContext(currentQuery: string): ConversationContext {
    return {
      shortTermMemory: this.shortTermMemory.slice(-10),
      relevantLongTermMemory: this.searchRelevantMemories(currentQuery),
      userProfile: this.userProfile,
    };
  }

  // Atualiza o perfil do usuário
  updateUserProfile(key: string, value: any): void {
    this.userProfile[key] = value;
    this.saveToStorage();
  }

  // Formata o contexto para enviar ao LLM
  formatContextForLLM(context: ConversationContext): string {
    let formatted = '';

    if (Object.keys(context.userProfile).length > 0) {
      formatted += `## Perfil do Usuário\n${JSON.stringify(context.userProfile, null, 2)}\n\n`;
    }

    if (context.relevantLongTermMemory.length > 0) {
      formatted += `## Memórias Relevantes\n`;
      context.relevantLongTermMemory.forEach(m => {
        formatted += `- [${new Date(m.timestamp).toLocaleDateString()}] ${m.content}\n`;
      });
      formatted += '\n';
    }

    if (context.shortTermMemory.length > 0) {
      formatted += `## Conversa Recente\n`;
      context.shortTermMemory.forEach(m => {
        formatted += `- ${m.content}\n`;
      });
    }

    return formatted;
  }

  // Limpa toda a memória
  clearMemory(): void {
    this.shortTermMemory = [];
    this.longTermMemory = [];
    this.userProfile = {};
    localStorage.removeItem(this.storageKey);
  }

  // Exporta memórias para backup
  exportMemory(): string {
    return JSON.stringify({
      shortTermMemory: this.shortTermMemory,
      longTermMemory: this.longTermMemory,
      userProfile: this.userProfile,
    }, null, 2);
  }

  // Importa memórias de backup
  importMemory(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.shortTermMemory = parsed.shortTermMemory || [];
      this.longTermMemory = parsed.longTermMemory || [];
      this.userProfile = parsed.userProfile || {};
      this.saveToStorage();
    } catch (error) {
      console.error('Error importing memory:', error);
    }
  }

  getStats() {
    return {
      shortTermCount: this.shortTermMemory.length,
      longTermCount: this.longTermMemory.length,
      profileKeys: Object.keys(this.userProfile).length,
    };
  }
}

export const memoryService = new InfiniteMemoryService();
export type { MemoryEntry, ConversationContext };
