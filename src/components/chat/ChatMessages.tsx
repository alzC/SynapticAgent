import React from 'react';
import { Message } from '@/types/chat';
import clsx from 'clsx';
import MessageBubble from './MessageBubble';



interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-element-bg rounded-xl p-4 shadow-inner border border-border-color space-y-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
        />
      ))}
      {isLoading && (
        <div className="text-center text-gray-400 italic">Traitement en cours…</div>
      )}
    </div>
  );
}
