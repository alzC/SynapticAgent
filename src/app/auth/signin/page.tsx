import { Suspense } from 'react';
import SignInForm from '@/components/auth/SignInForm';
import { AuthBackground } from '@/components/auth/AuthBackground';

export default function SignInPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background neural network animation */}
      <AuthBackground />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20" />
      <div className="absolute inset-0 bg-gradient-to-tl from-orange-900/10 via-transparent to-blue-900/10" />
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 mb-6 animate-pulse">
              <span className="text-2xl font-bold text-white">🧠</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
              SynapticAgent
            </h1>
            <p className="text-gray-400 text-sm">
              Connectez-vous à l'intelligence augmentée
            </p>
          </div>

          {/* Glass container */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 via-cyan-500/50 to-orange-500/50 rounded-2xl blur opacity-75 animate-pulse" />
            
            {/* Glass card */}
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              {/* Inner glow */}
              <div className="absolute inset-0.5 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
              
              <div className="relative">
                <Suspense fallback={
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                }>
                  <SignInForm />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Footer text */}
          <p className="text-center text-gray-500 text-xs mt-6">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}