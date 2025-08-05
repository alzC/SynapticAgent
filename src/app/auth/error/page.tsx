'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home, Shield, Zap } from 'lucide-react';
import { AuthBackground } from '@/components/auth/AuthBackground';
import { motion } from 'framer-motion';

const errorMessages = {
  Configuration: {
    title: 'Erreur de Configuration',
    description: 'Un problème de configuration système a été détecté. Nos neurones sont en cours de recalibrage.',
    icon: AlertTriangle,
    color: 'from-orange-500 to-red-500'
  },
  AccessDenied: {
    title: 'Accès Neural Refusé',
    description: 'Votre profil n\'a pas les autorisations nécessaires pour accéder au réseau synaptique.',
    icon: Shield,
    color: 'from-red-500 to-pink-500'
  },
  Verification: {
    title: 'Vérification Neural Échouée',
    description: 'La vérification de votre identité numérique a échoué. Tentez une nouvelle synchronisation.',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500'
  },
  Default: {
    title: 'Dysfonction Neural Détectée',
    description: 'Une perturbation dans le réseau neural a été détectée. Recalibrage en cours...',
    icon: AlertTriangle,
    color: 'from-purple-500 to-cyan-500'
  }
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const errorInfo = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default;
  const IconComponent = errorInfo.icon;

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: [0.25, 0.1, 0.25, 1]
    }
  };

  const handleRetry = () => {
    window.location.href = '/auth/signin';
  };

  const handleHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background neural network animation */}
      <AuthBackground />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-orange-900/20" />
      <div className="absolute inset-0 bg-gradient-to-tl from-purple-900/10 via-transparent to-pink-900/10" />
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo et statut */}
          <div className="text-center mb-8">
            <motion.div 
              animate={pulseAnimation}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 mb-6"
            >
              <IconComponent className="w-10 h-10 text-red-400" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-red-200 to-orange-200 bg-clip-text text-transparent mb-2">
              Neural Network Error
            </h1>
            <p className="text-gray-400 text-sm">
              Défaillance du système synaptique détectée
            </p>
          </div>

          {/* Error card */}
          <div className="relative mb-8">
            {/* Glow effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${errorInfo.color} rounded-2xl blur opacity-30 animate-pulse`} />
            
            {/* Glass card */}
            <div className="relative bg-red-950/20 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 shadow-2xl">
              <div className="text-center">
                {/* Error type */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <IconComponent className="w-6 h-6 text-red-400" />
                  <span className="text-red-300 font-medium text-lg">
                    {errorInfo.title}
                  </span>
                </div>

                {/* Error description */}
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  {errorInfo.description}
                </p>

                {/* Error code */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-red-300 text-xs font-mono">
                    ERROR_{error?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRetry}
                    className="w-full relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/15 via-red-500/20 to-pink-500/15 rounded-xl blur-sm group-hover:blur-none transition-all duration-300" />
                    <div className="relative bg-white/8 hover:bg-white/12 backdrop-blur-sm border border-white/20 hover:border-red-400/30 rounded-xl px-6 py-3 flex items-center justify-center gap-3 transition-all duration-300">
                      <RefreshCw className="w-5 h-5 text-orange-400" />
                      <span className="text-white/90 font-medium">
                        Relancer Connexion Neural
                      </span>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleHome}
                    className="w-full relative group"
                  >
                    <div className="relative bg-white/5 hover:bg-white/8 backdrop-blur-sm border border-white/10 hover:border-cyan-400/20 rounded-xl px-6 py-3 flex items-center justify-center gap-3 transition-all duration-300">
                      <Home className="w-5 h-5 text-cyan-400" />
                      <span className="text-white/70 font-medium">
                        Retour au Réseau Principal
                      </span>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Status info */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 text-gray-500 text-xs">
              <div className="relative">
                <Shield className="w-4 h-4 text-red-400" />
                <div className="absolute -inset-1 bg-red-400/20 blur-sm rounded-full animate-pulse" />
              </div>
              <span className="font-medium">
                Diagnostic neural en cours • Tentative de réparation automatique
              </span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse delay-150" />
                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}