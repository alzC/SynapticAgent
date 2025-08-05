'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Message } from '@/types/chat';
// Supprime l'importation du service côté client
// import { useConversationService } from '@/lib/conversations'; 
import ToastManager from '@/components/chat/ToastManager';
import TopBar from '@/components/chat/TopBar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInputBar from '@/components/chat/ChatInputBar';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

type AgentId = 'auto' | 'calculator' | 'weather';

export default function ChatInterface() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentId>('auto');
  const [currentAutoAgent, setCurrentAutoAgent] = useState<AgentId | undefined>();
  // Gère l'ID de la conversation pour la persistance
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Le service de conversation n'est plus instancié ici.
  // La logique de persistance est gérée par l'API route.

  // Initialiser l'état local ou charger les conversations précédentes
  useEffect(() => {
    // Tu peux appeler ici une API route pour charger l'historique
    // des messages si tu le souhaites. Pour l'instant, on démarre une conversation vide.
    console.log('💬 Interface de chat initialisée');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!session?.user?.id) {
      toast.error('🔒 Veuillez vous connecter pour utiliser SynapticAgent');
      return;
    }

    setIsLoading(true);
    const userMessageContent = input;
    setInput('');

    // Création du message utilisateur pour l'affichage immédiat (optimistic update)
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user' as const,
      content: userMessageContent,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Appel de l'API route pour gérer la conversation
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageContent,
          forcedAgent: selectedAgent === 'auto' ? undefined : selectedAgent,
          conversationId: currentConversationId, // Envoi de l'ID de conversation
        }),
      });

      const data = await res.json();

      if (res.status === 429 && data.quotaExceeded) {
        toast.error(`🚫 ${data.error}: ${data.reason}`, {
          duration: 5000,
          style: { background: '#dc2626', color: 'white' },
        });
        // Ajoute un message d'erreur dans le chat
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: 'system',
            content: `❌ ${data.error}: ${data.reason}`,
            timestamp: new Date().toISOString(),
            error: data.reason,
          },
        ]);
        return;
      }

      // En cas de succès, on reçoit l'ID de la conversation et le message de l'assistant
      if (data.conversationId) {
        setCurrentConversationId(data.conversationId);
      }

      if (selectedAgent === 'auto' && data.agentName) {
        setCurrentAutoAgent(data.agentName.toLowerCase() as AgentId);
      }

      // Ajoute la réponse de l'assistant
      const assistantMessage: Message = {
        id: uuidv4(), // L'ID réel sera généré par la DB et peut être récupéré de la réponse API
        role: 'assistant' as const,
        content: data.response,
        agentName: data.agentName,
        toolUsed: data.toolUsed,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
      toast.error(`🔥 Erreur: ${errorMessage}`, { duration: 4000 });
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'system',
          content: 'Erreur serveur. Veuillez réessayer.',
          timestamp: new Date().toISOString(),
          error: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto px-4 py-6 bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] text-white rounded-2xl shadow-lg">
      <TopBar
        selectedAgent={selectedAgent}
        onAgentChange={setSelectedAgent}
        currentAutoAgent={currentAutoAgent}
        isLoading={isLoading}
      />
      <ChatMessages messages={messages} isLoading={isLoading} />
      <ChatInputBar
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <ToastManager />
    </div>
  );
}