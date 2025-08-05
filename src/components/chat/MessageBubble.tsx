// components/chat/MessageBubble.tsx
import React from 'react';
import clsx from 'clsx';
import { Message } from '@/types/chat';
import { Calculator, Cloud, Brain, User, AlertTriangle } from 'lucide-react';

// Configuration des agents (même que AgentSelector)
const AGENT_STYLES = {
  calculator: {
    emoji: '🧮',
    icon: Calculator,
    bgGradient: 'from-cyan-400/10 via-blue-500/10 to-cyan-600/10',
    borderGradient: 'from-cyan-400 via-blue-500 to-cyan-600',
    textColor: 'text-cyan-300',
    glowColor: 'shadow-cyan-500/20',
  },
  weather: {
    emoji: '🌦️',
    icon: Cloud,
    bgGradient: 'from-orange-400/10 via-amber-500/10 to-orange-600/10',
    borderGradient: 'from-orange-400 via-amber-500 to-orange-600',
    textColor: 'text-orange-300',
    glowColor: 'shadow-orange-500/20',
  },
  auto: {
    emoji: '🧠',
    icon: Brain,
    bgGradient: 'from-purple-500/10 via-violet-500/10 to-purple-600/10',
    borderGradient: 'from-purple-500 via-violet-500 to-purple-600',
    textColor: 'text-purple-300',
    glowColor: 'shadow-purple-500/20',
  }
} as const;

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isAssistant = message.role === 'assistant';

  // Déterminer le style de l'agent
  const agentKey = message.agentName?.toLowerCase() as keyof typeof AGENT_STYLES;
  const agentStyle = agentKey && AGENT_STYLES[agentKey] ? AGENT_STYLES[agentKey] : null;

  // Style pour les messages système (erreurs)
  if (isSystem) {
    return (
      <div className="text-center">
        <div className="inline-block max-w-[90%] p-3 rounded-xl bg-red-900/20 border border-red-500/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 justify-center text-red-300">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm">{message.content}</p>
          </div>
          {message.error && (
            <div className="text-xs text-red-400 mt-1 opacity-70">
              {message.error}
            </div>
          )}
          <div className="text-[10px] mt-1 text-red-400/60">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx('text-sm', {
        'text-right': isUser,
        'text-left': !isUser,
      })}
    >
      <div
        className={clsx(
          'inline-block max-w-[80%] rounded-xl shadow-lg transition-all duration-300',
          {
            // Style utilisateur - design moderne bleu
            'bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 shadow-blue-500/20': isUser,
            
            // Style assistant avec agent spécifique
            [clsx(
              'relative p-[1px] bg-gradient-to-r',
              agentStyle?.borderGradient || 'from-gray-400 to-gray-600',
              agentStyle?.glowColor || 'shadow-gray-500/20'
            )]: isAssistant,
          }
        )}
      >
        {/* Contenu pour utilisateur */}
        {isUser && (
          <>
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 mt-0.5 opacity-80 flex-shrink-0" />
              <p className="flex-1">{message.content}</p>
            </div>
            <div className="text-[10px] mt-1 text-blue-200/60">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </>
        )}

        {/* Contenu pour assistant avec style agent */}
        {isAssistant && (
          <div className={clsx(
            'bg-black/80 backdrop-blur-md rounded-xl p-3',
            agentStyle && `bg-gradient-to-br ${agentStyle.bgGradient}`
          )}>
            {/* Header avec icône agent */}
            {agentStyle && (
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                <div className={clsx(
                  'p-1.5 rounded-lg bg-gradient-to-r',
                  agentStyle.borderGradient
                )}>
                  <agentStyle.icon className="w-3 h-3 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={clsx('text-xs font-medium', agentStyle.textColor)}>
                    {message.agentName}
                  </span>
                  <span className="text-xs">{agentStyle.emoji}</span>
                  {message.toolUsed && (
                    <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded text-white/70">
                      🛠 {message.toolUsed}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Contenu principal */}
            <p className="text-white leading-relaxed">{message.content}</p>

            {/* Footer avec métadonnées */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
              <div className="text-[10px] text-white/40">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
              
              {/* Indicateur de statut */}
              <div className="flex items-center gap-1">
                {agentStyle && (
                  <div className={clsx(
                    'w-2 h-2 rounded-full animate-pulse',
                    `bg-gradient-to-r ${agentStyle.borderGradient}`
                  )}></div>
                )}
              </div>
            </div>

            {/* Effet de particules subtil */}
            {agentStyle && (
              <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <div className={clsx(
                  'absolute inset-0 bg-gradient-to-r opacity-5 animate-pulse',
                  agentStyle.borderGradient
                )}></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
