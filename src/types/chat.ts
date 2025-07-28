export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  agentName?: string;
  toolUsed?: string;
}
