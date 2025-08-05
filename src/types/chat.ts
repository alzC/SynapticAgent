// types/chat.ts
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  agentName?: string;
  toolUsed?: string;
  error?: string;
  createdAt?: string; // Redondant mais utile selon logique
}
