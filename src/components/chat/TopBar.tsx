'use client';
import { useState, useEffect } from 'react';
import { BadgeCheck, User, Brain } from 'lucide-react';
import AgentSelector from './AgentSelector';

// Hook personnalisé pour récupérer les données de quota
function useQuotaData(modelId: string) {
  const [quotaData, setQuotaData] = useState<{
    used: { rpd: number };
    limits: { rpd: number };
    ok: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/quotas?modelId=${modelId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        setQuotaData(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du fetch des quotas:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        // Fallback data pour éviter le crash
        setQuotaData({
          used: { rpd: 0 },
          limits: { rpd: 100 },
          ok: true
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuota();
    
    // Refresh toutes les 30 secondes
    const interval = setInterval(fetchQuota, 30000);
    return () => clearInterval(interval);
  }, [modelId]);

  return { quotaData, loading, error };
}

type AgentId = 'auto' | 'calculator' | 'weather';

interface TopBarProps {
  selectedAgent: AgentId;
  onAgentChange: (agent: AgentId) => void;
  currentAutoAgent?: AgentId;
  isLoading?: boolean;
}

export default function TopBar({ 
  selectedAgent, 
  onAgentChange, 
  currentAutoAgent,
  isLoading = false 
}: TopBarProps) {
  
  // Récupérer les vraies données de quota
  const modelId = 'meta-llama/llama-4-scout-17b-16e-instruct';
  const { quotaData, loading, error } = useQuotaData(modelId);

  return (
    <header className="flex justify-between items-center p-4 border-b border-white/10 backdrop-blur-md bg-gradient-to-r from-[#1a1a1a]/80 to-[#0d0d0d]/80">
      <h1 className="text-white text-xl font-semibold tracking-wide">Neural Mesh</h1>
      <div className="flex items-center space-x-4">
        <AgentSelector
          selectedAgent={selectedAgent}
          onAgentChange={onAgentChange}
          currentAutoAgent={currentAutoAgent}
          isLoading={isLoading}
        />
        <QuotaBadge 
          used={quotaData?.used.rpd || 0} 
          limit={quotaData?.limits.rpd || 100}
          loading={loading}
          error={error}
          isOk={quotaData?.ok ?? true}
        />
      </div>
    </header>
  );
}

interface QuotaBadgeProps {
  used: number;
  limit: number;
  loading?: boolean;
  error?: string | null;
  isOk?: boolean;
}

function QuotaBadge({ used, limit, loading, error, isOk = true }: QuotaBadgeProps) {
  const percentage = Math.min(100, (used / limit) * 100);
  
  // Couleurs dynamiques selon le pourcentage
  const getGlowColor = () => {
    if (!isOk || error) return 'shadow-red-500/30';
    if (percentage >= 90) return 'shadow-red-400/40';
    if (percentage >= 70) return 'shadow-yellow-400/40';
    return 'shadow-cyan-400/30';
  };

  const getBarColor = () => {
    if (!isOk || error) return 'from-red-500 via-red-400 to-red-600';
    if (percentage >= 90) return 'from-red-400 via-orange-400 to-red-500';
    if (percentage >= 70) return 'from-yellow-400 via-orange-400 to-red-400';
    return 'from-cyan-400 via-blue-400 to-purple-500';
  };

  const getStatusIcon = () => {
    if (loading) return '⟳';
    if (error) return '⚠️';
    if (!isOk) return '🚫';
    return '🧠';
  };

  return (
    <div className="relative group">
      {/* Container principal avec glow effect */}
      <div className={`relative w-36 h-3 bg-black/40 rounded-full overflow-hidden border border-white/10 transition-all duration-500 hover:scale-105 ${getGlowColor()} hover:shadow-lg`}>
        
        {/* Barre de progression animée */}
        <div
          className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getBarColor()} transition-all duration-700 ease-out ${
            loading ? 'animate-pulse' : ''
          }`}
          style={{ width: `${percentage}%` }}
        >
          {/* Particules énergétiques */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        </div>

        {/* Animation de breathing pour le container */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
      </div>

      {/* Label avec icône */}
      <div className="absolute -top-7 left-0 flex items-center gap-1">
        <span className="text-xs animate-pulse">{getStatusIcon()}</span>
        <span className="text-xs text-white/80 font-mono tracking-wide">
          {loading ? 'Chargement...' : error ? 'Erreur' : `${used} / ${limit}`}
        </span>
      </div>

      {/* Tooltip au hover */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        {error ? `Erreur: ${error}` : 
         !isOk ? 'Quota dépassé' :
         `${Math.round(percentage)}% utilisé - ${limit - used} restantes`}
      </div>
    </div>
  );
}
