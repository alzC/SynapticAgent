'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, Brain, Calculator, Cloud, Zap, Settings } from 'lucide-react';
import clsx from 'clsx';

// Configuration des agents avec leurs identités visuelles
const AGENT_CONFIG = {
  auto: {
    id: 'auto',
    name: 'Mode Auto',
    icon: Brain,
    color: 'from-purple-500 via-violet-500 to-purple-600',
    glowColor: 'shadow-purple-500/30',
    hoverGlow: 'hover:shadow-purple-500/50',
    description: 'IA choisit l\'agent optimal',
    emoji: '🧠'
  },
  calculator: {
    id: 'calculator', 
    name: 'Calculateur',
    icon: Calculator,
    color: 'from-cyan-400 via-blue-500 to-cyan-600',
    glowColor: 'shadow-cyan-500/30',
    hoverGlow: 'hover:shadow-cyan-500/50',
    description: 'Expert en mathématiques',
    emoji: '🧮'
  },
  weather: {
    id: 'weather',
    name: 'Météo',
    icon: Cloud,
    color: 'from-orange-400 via-amber-500 to-orange-600',
    glowColor: 'shadow-orange-500/30', 
    hoverGlow: 'hover:shadow-orange-500/50',
    description: 'Expert météorologique',
    emoji: '🌦️'
  }
} as const;

type AgentId = keyof typeof AGENT_CONFIG;

interface AgentSelectorProps {
  selectedAgent: AgentId;
  onAgentChange: (agentId: AgentId) => void;
  currentAutoAgent?: AgentId; // Agent actuellement choisi par l'IA en mode auto
  isLoading?: boolean;
}

export default function AgentSelector({ 
  selectedAgent, 
  onAgentChange, 
  currentAutoAgent,
  isLoading = false 
}: AgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation fluide lors du changement d'agent
  const handleAgentChange = async (newAgent: AgentId) => {
    if (newAgent === selectedAgent) return;
    
    setIsAnimating(true);
    setIsOpen(false);
    
    // Délai pour l'animation de transition
    setTimeout(() => {
      onAgentChange(newAgent);
      setIsAnimating(false);
    }, 200);
  };

  // Agent affiché (auto mode montre l'agent choisi par l'IA)
  const displayedAgent = selectedAgent === 'auto' && currentAutoAgent 
    ? AGENT_CONFIG[currentAutoAgent] 
    : AGENT_CONFIG[selectedAgent];

  const isAutoMode = selectedAgent === 'auto';

  return (
    <div className="relative">
      {/* Container principal avec glow effect */}
      <div className={clsx(
        'relative bg-gradient-to-r p-[1px] rounded-xl transition-all duration-500',
        displayedAgent.glowColor,
        displayedAgent.hoverGlow,
        isAnimating && 'scale-105 animate-pulse',
        isLoading && 'animate-pulse'
      )}>
        
        {/* Background animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 rounded-xl animate-pulse opacity-60"></div>
        
        {/* Bouton principal */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={clsx(
            'relative flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl',
            'transition-all duration-300 hover:bg-black/40 group',
            'min-w-[180px] justify-between',
            isLoading && 'cursor-wait opacity-70'
          )}
        >
          {/* Icône et info de l'agent */}
          <div className="flex items-center gap-3">
            <div className={clsx(
              'p-2 rounded-lg bg-gradient-to-r transition-all duration-300',
              displayedAgent.color,
              'group-hover:scale-110'
            )}>
              <displayedAgent.icon className="w-4 h-4 text-white" />
            </div>
            
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium text-sm">
                  {displayedAgent.name}
                </span>
                {isAutoMode && currentAutoAgent && (
                  <span className="text-xs px-1.5 py-0.5 bg-white/10 rounded text-white/70">
                    → {AGENT_CONFIG[currentAutoAgent].emoji}
                  </span>
                )}
              </div>
              <div className="text-xs text-white/60">
                {displayedAgent.description}
              </div>
            </div>
          </div>

          {/* Indicateur et chevron */}
          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
            )}
            <ChevronDown className={clsx(
              'w-4 h-4 text-white/60 transition-transform duration-300',
              isOpen && 'rotate-180'
            )} />
          </div>
          
          {/* Particules énergétiques */}
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
            <div className={clsx(
              'absolute inset-0 bg-gradient-to-r opacity-20 animate-pulse',
              displayedAgent.color
            )}></div>
          </div>
        </button>
      </div>

      {/* Dropdown menu avec animations fluides */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
            {Object.values(AGENT_CONFIG).map((agent) => {
              const isSelected = agent.id === selectedAgent;
              const IconComponent = agent.icon;
              
              return (
                <button
                  key={agent.id}
                  onClick={() => handleAgentChange(agent.id as AgentId)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 transition-all duration-200',
                    'hover:bg-white/5 border-b border-white/5 last:border-b-0',
                    isSelected && 'bg-white/10'
                  )}
                >
                  {/* Icône avec glow */}
                  <div className={clsx(
                    'p-2 rounded-lg bg-gradient-to-r transition-all duration-200',
                    agent.color,
                    'group-hover:scale-105',
                    isSelected && agent.glowColor + ' shadow-lg'
                  )}>
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Info agent */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">
                        {agent.name}
                      </span>
                      <span className="text-sm">{agent.emoji}</span>
                      {isSelected && (
                        <Zap className="w-3 h-3 text-white/60" />
                      )}
                    </div>
                    <div className="text-xs text-white/60">
                      {agent.description}
                    </div>
                  </div>
                  
                  {/* Mode spécial pour Auto */}
                  {agent.id === 'auto' && currentAutoAgent && (
                    <div className="text-xs text-white/40 flex items-center gap-1">
                      <span>Active:</span>
                      <span className={clsx(
                        'px-1.5 py-0.5 rounded text-white',
                        `bg-gradient-to-r ${AGENT_CONFIG[currentAutoAgent].color}`
                      )}>
                        {AGENT_CONFIG[currentAutoAgent].emoji}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}