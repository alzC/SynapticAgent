'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Brain, Github, Zap, Network, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const buttonVariants = {
    idle: { 
      scale: 1, 
      boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
    },
    hover: { 
      scale: 1.02, 
      boxShadow: '0 0 35px rgba(139, 92, 246, 0.6), 0 0 70px rgba(6, 182, 212, 0.2)',
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.98 }
  };

  const neuralPulseAnimation = {
    opacity: [0.4, 0.8, 0.4],
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        {/* Neural mesh header */}
        <div className="relative mb-6">
          <motion.div 
            animate={neuralPulseAnimation}
            className="flex items-center justify-center gap-3"
          >
            <Network className="w-6 h-6 text-purple-400" />
            <Brain className="w-8 h-8 text-cyan-400" />
            <Sparkles className="w-6 h-6 text-orange-400" />
          </motion.div>
          
          {/* Neural connections */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />
          </div>
        </div>

        <h2 className="text-xl font-semibold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
          Activez votre neural network
        </h2>
        <p className="text-gray-400 text-sm">
          Connectez-vous au réseau synaptique sécurisé
        </p>
      </div>

      {/* Google Sign In */}
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={() => handleSignIn('google')}
        disabled={isLoading !== null}
        className="w-full relative group"
      >
        {/* Neural synaptic background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/15 via-orange-500/20 to-yellow-500/15 rounded-xl blur-sm group-hover:blur-none transition-all duration-300" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-orange-400/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative bg-white/8 hover:bg-white/12 backdrop-blur-sm border border-white/20 hover:border-orange-400/30 rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all duration-300 group-hover:shadow-inner">
          {isLoading === 'google' ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="relative"
            >
              <Zap className="w-5 h-5 text-orange-400" />
              <div className="absolute inset-0 w-5 h-5 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
            </motion.div>
          ) : (
            <div className="relative group">
              <Sparkles className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute -inset-1 bg-orange-400/20 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}
          <span className="text-white/90 font-medium group-hover:text-white transition-colors duration-200">
            {isLoading === 'google' ? 'Synapses activées...' : 'Neural Sync • Google'}
          </span>
        </div>
      </motion.button>

      {/* GitHub Sign In */}
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={() => handleSignIn('github')}
        disabled={isLoading !== null}
        className="w-full relative group"
      >
        {/* Neural synaptic background */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/15 via-purple-500/20 to-violet-500/15 rounded-xl blur-sm group-hover:blur-none transition-all duration-300" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-400/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative bg-white/8 hover:bg-white/12 backdrop-blur-sm border border-white/20 hover:border-purple-400/30 rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all duration-300 group-hover:shadow-inner">
          {isLoading === 'github' ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="relative"
            >
              <Network className="w-5 h-5 text-purple-400" />
              <div className="absolute inset-0 w-5 h-5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
            </motion.div>
          ) : (
            <div className="relative group">
              <Github className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute -inset-1 bg-purple-400/20 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}
          <span className="text-white/90 font-medium group-hover:text-white transition-colors duration-200">
            {isLoading === 'github' ? 'Réseau établi...' : 'Code Nexus • GitHub'}
          </span>
        </div>
      </motion.button>

      {/* Neural Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
        </div>
        <div className="relative flex justify-center text-sm">
          <div className="px-4 bg-black/70 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-gray-400 font-medium">neural bridge</span>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Demo mode */}
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={() => handleSignIn('credentials')}
        disabled={isLoading !== null}
        className="w-full relative group"
      >
        {/* Neural synaptic background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-teal-500/20 to-blue-500/15 rounded-xl blur-sm group-hover:blur-none transition-all duration-300" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-400/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative bg-white/8 hover:bg-white/12 backdrop-blur-sm border border-white/20 hover:border-cyan-400/30 rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all duration-300 group-hover:shadow-inner">
          {isLoading === 'credentials' ? (
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="relative"
            >
              <Brain className="w-5 h-5 text-cyan-400" />
              <div className="absolute inset-0 w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            </motion.div>
          ) : (
            <div className="relative group">
              <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute -inset-1 bg-cyan-400/20 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}
          <span className="text-white/90 font-medium group-hover:text-white transition-colors duration-200">
            {isLoading === 'credentials' ? 'Initialisation...' : 'Demo Nexus • Test'}
          </span>
        </div>
      </motion.button>

      {/* Neural Security note */}
      <div className="text-center mt-8">
        <div className="inline-flex items-center gap-3 text-gray-400 text-xs">
          <div className="relative">
            <Shield className="w-4 h-4 text-green-400" />
            <div className="absolute -inset-1 bg-green-400/20 blur-sm rounded-full animate-pulse" />
          </div>
          <span className="font-medium bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            Neural encryption • SSL secured
          </span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse delay-150" />
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-300" />
          </div>
        </div>
      </div>
    </div>
  );
}