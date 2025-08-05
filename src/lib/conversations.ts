// lib/conversations.ts - Service de gestion des conversations

import { 
  createConversation, 
  createMessage, 
  getUserConversations, 
  getConversationMessages,
  updateConversationTitle 
} from './db/queries';
import type { Message } from '@/types/chat';

/**
 * Service de gestion des conversations avec auto-sauvegarde
 */
export class ConversationService {
  private currentConversationId: string | null = null;
  private messages: Message[] = [];
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Démarre une nouvelle conversation
   */
  async startNewConversation(firstMessage?: string): Promise<string> {
    try {
      const title = firstMessage 
        ? this.generateTitle(firstMessage)
        : 'Nouvelle conversation';

      const conversation = await createConversation({
        userId: this.userId,
        title,
        isArchived: false,
      });

      this.currentConversationId = conversation.id;
      this.messages = [];

      console.log('💬 Nouvelle conversation créée:', conversation.id);
      return conversation.id;
    } catch (error) {
      console.error('❌ Erreur création conversation:', error);
      throw error;
    }
  }

  /**
   * Charge une conversation existante
   */
  async loadConversation(conversationId: string): Promise<Message[]> {
    try {
      const dbMessages = await getConversationMessages(conversationId);
      
      this.currentConversationId = conversationId;
      this.messages = dbMessages.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: msg.createdAt.toISOString(),
        agentName: msg.agentName || undefined,
        toolUsed: msg.toolUsed || undefined,
        createdAt: msg.createdAt.toISOString(),
      }));

      console.log('📖 Conversation chargée:', conversationId, this.messages.length, 'messages');
      return this.messages;
    } catch (error) {
      console.error('❌ Erreur chargement conversation:', error);
      return [];
    }
  }

  /**
   * Ajoute un message utilisateur et le sauvegarde
   */
  async addUserMessage(content: string): Promise<Message> {
    // Créer conversation si nécessaire
    if (!this.currentConversationId) {
      await this.startNewConversation(content);
    }

    const message: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      // Sauvegarder en DB
      await createMessage({
        conversationId: this.currentConversationId!,
        role: 'user',
        content,
        agentName: null,
        toolUsed: null,
        metadata: null,
      });

      this.messages.push(message);
      console.log('👤 Message utilisateur sauvegardé');
      return message;
    } catch (error) {
      console.error('❌ Erreur sauvegarde message utilisateur:', error);
      // Ajouter quand même en local pour éviter de perdre le message
      this.messages.push(message);
      return message;
    }
  }

  /**
   * Ajoute une réponse d'assistant et la sauvegarde
   */
  async addAssistantMessage(
    content: string, 
    agentName?: string, 
    toolUsed?: string,
    tokensUsed?: number,
    responseTime?: number
  ): Promise<Message> {
    if (!this.currentConversationId) {
      throw new Error('Aucune conversation active');
    }

    const message: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      agentName,
      toolUsed,
      createdAt: new Date().toISOString(),
    };

    try {
      // Sauvegarder en DB avec métadonnées
      await createMessage({
        conversationId: this.currentConversationId!,
        role: 'assistant',
        content,
        agentName: agentName || null,
        toolUsed: toolUsed || null,
        metadata: {
          tokensUsed,
          responseTime,
          modelId: 'meta-llama/llama-4-scout-17b-16e-instruct'
        },
      });

      this.messages.push(message);
      console.log('🤖 Réponse assistant sauvegardée');
      return message;
    } catch (error) {
      console.error('❌ Erreur sauvegarde réponse assistant:', error);
      // Ajouter quand même en local
      this.messages.push(message);
      return message;
    }
  }

  /**
   * Récupère les messages actuels
   */
  getMessages(): Message[] {
    return [...this.messages];
  }

  /**
   * Récupère l'ID de la conversation actuelle
   */
  getCurrentConversationId(): string | null {
    return this.currentConversationId;
  }

  /**
   * Récupère la liste des conversations de l'utilisateur
   */
  async getUserConversations() {
    try {
      return await getUserConversations(this.userId);
    } catch (error) {
      console.error('❌ Erreur récupération conversations:', error);
      return [];
    }
  }

  /**
   * Met à jour le titre d'une conversation
   */
  async updateTitle(conversationId: string, title: string) {
    try {
      return await updateConversationTitle(conversationId, title);
    } catch (error) {
      console.error('❌ Erreur mise à jour titre:', error);
      throw error;
    }
  }

  /**
   * Génère un titre intelligent basé sur le premier message
   */
  private generateTitle(firstMessage: string): string {
    // Nettoyage et troncature
    const cleaned = firstMessage
      .replace(/[^\w\s\-\.,\?!]/g, '')
      .trim()
      .substring(0, 60);

    if (cleaned.length === 0) {
      return 'Nouvelle conversation';
    }

    // Si c'est une question
    if (cleaned.includes('?')) {
      return cleaned.length > 40 ? cleaned.substring(0, 37) + '...' : cleaned;
    }

    // Si c'est long, couper au dernier mot complet
    if (cleaned.length > 40) {
      const words = cleaned.substring(0, 37).split(' ');
      words.pop(); // Retirer le dernier mot potentiellement coupé
      return words.join(' ') + '...';
    }

    return cleaned;
  }

  /**
   * Nettoie les ressources
   */
  cleanup() {
    this.currentConversationId = null;
    this.messages = [];
  }
}

/**
 * Factory pour créer un service de conversation
 */
export function createConversationService(userId: string): ConversationService {
  return new ConversationService(userId);
}

/**
 * Hook-like function pour utiliser dans les composants React
 */
let globalConversationService: ConversationService | null = null;

export function useConversationService(userId: string): ConversationService {
  if (!globalConversationService || globalConversationService['userId'] !== userId) {
    globalConversationService = new ConversationService(userId);
  }
  return globalConversationService;
}