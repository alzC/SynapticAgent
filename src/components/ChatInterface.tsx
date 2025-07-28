'use client';

import { useState } from 'react';
import { type Message } from '@/types/chat';

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    /* Option pour limiter les tokens
    const MAX_MESSAGES = 10;
    */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Ajouter le message de l'utilisateur
        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        /* Option pour limiter les tokens
        setMessages(prev => {
            const newMessages = [...prev, userMessage];
            return newMessages.slice(-10); // Garder les 10 derniers messages
        });
        */
        setIsLoading(true);
        setInput('');

        try {
            // Appeler l'API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();

            // Ajouter la réponse de l'agent
            const agentMessage: Message = {
                role: 'assistant',
                content: data.response,
                agentName: data.agentName,
                toolUsed: data.toolUsed,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, agentMessage]);
            /* Option pour limiter les tokens
            setMessages(prev => {
                const newMessages = [...prev, agentMessage];
                return newMessages.slice(-10); // Garder les 10 derniers messages
            });
            */
        } catch (error) {
            console.error('Error:', error);
            // Ajouter un message d'erreur
            const errorMessage: Message = {
                role: 'system',
                content: 'Désolé, une erreur est survenue.',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
            /* Option pour limiter les tokens
            setMessages(prev => {
                const newMessages = [...prev, errorMessage];
                return newMessages.slice(-10); // Garder les 10 derniers messages
            });
            */
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-3xl mx-auto p-4">
            {/* En-tête */}
            <header className="text-center py-4">
                <h1 className="text-2xl font-bold">Chat Multi-Agents</h1>
            </header>

            {/* Zone de messages */}
            <div className="flex-1 overflow-auto bg-gray-50 rounded-lg p-4 mb-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'
                            }`}
                    >
                        <div
                            className={`inline-block p-3 rounded-lg ${msg.role === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-200'
                                }`}
                        >
                            <p>{msg.content}</p>
                            {msg.agentName && (
                                <div className="text-xs mt-1 text-gray-500">
                                    Agent: {msg.agentName}
                                    {msg.toolUsed && ` | Tool: ${msg.toolUsed}`}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="text-center text-gray-500">
                        Traitement en cours...
                    </div>
                )}
            </div>

            {/* Zone de saisie */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Posez votre question..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                    Envoyer
                </button>
            </form>
        </div>
    );
}
