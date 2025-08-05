'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  energy: number; // Neural energy level
  pulsePhase: number; // For pulsing effect
  isNeuron: boolean; // Special neural nodes
}

export function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initParticles = () => {
      const particleCount = Math.min(120, Math.floor((canvas.width * canvas.height) / 12000));
      particlesRef.current = [];

      // Neural color palette: purple, cyan, orange (matching our theme)
      const neuralHues = [270, 190, 30]; // Purple, Cyan, Orange

      for (let i = 0; i < particleCount; i++) {
        const isNeuron = Math.random() < 0.15; // 15% chance to be a special neuron
        const hueIndex = Math.floor(Math.random() * neuralHues.length);
        
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * (isNeuron ? 0.3 : 0.6),
          vy: (Math.random() - 0.5) * (isNeuron ? 0.3 : 0.6),
          size: isNeuron ? Math.random() * 3 + 2 : Math.random() * 1.5 + 0.5,
          opacity: isNeuron ? Math.random() * 0.4 + 0.6 : Math.random() * 0.5 + 0.2,
          hue: neuralHues[hueIndex] + (Math.random() - 0.5) * 20, // Slight variation
          energy: Math.random(),
          pulsePhase: Math.random() * Math.PI * 2,
          isNeuron,
        });
      }
    };

    const drawConnections = () => {
      const particles = particlesRef.current;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Neural synapses - stronger connections between neurons
          const connectionRange = particles[i].isNeuron || particles[j].isNeuron ? 140 : 80;
          
          if (distance < connectionRange) {
            const opacity = (connectionRange - distance) / connectionRange * 0.3;
            const avgHue = (particles[i].hue + particles[j].hue) / 2;
            const energy = (particles[i].energy + particles[j].energy) / 2;
            
            // Neural energy pulse effect
            const pulseIntensity = Math.sin(Date.now() * 0.001 + energy * 6.28) * 0.3 + 0.7;
            const finalOpacity = opacity * pulseIntensity;
            
            // Thicker lines for neuron connections
            const lineWidth = particles[i].isNeuron || particles[j].isNeuron ? 1.2 : 0.6;
            
            ctx.strokeStyle = `hsla(${avgHue}, 80%, 65%, ${finalOpacity})`;
            ctx.lineWidth = lineWidth;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            
            // Add glow effect for neural connections
            if (particles[i].isNeuron || particles[j].isNeuron) {
              ctx.strokeStyle = `hsla(${avgHue}, 90%, 80%, ${finalOpacity * 0.3})`;
              ctx.lineWidth = lineWidth * 3;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }
    };

    const animate = () => {
      // Neural fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw neural connections
      drawConnections();

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update neural energy and pulse phase
        particle.energy += 0.01;
        particle.pulsePhase += 0.05;
        if (particle.energy > 1) particle.energy = 0;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges with some randomness
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.vx += (Math.random() - 0.5) * 0.1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8;
          particle.vy += (Math.random() - 0.5) * 0.1;
        }

        // Keep in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Neural pulsing effect
        const pulseScale = particle.isNeuron 
          ? Math.sin(particle.pulsePhase) * 0.3 + 1.2
          : Math.sin(particle.pulsePhase * 0.5) * 0.1 + 1;

        const currentOpacity = particle.opacity * 
          (Math.sin(Date.now() * 0.002 + index * 0.1) * 0.2 + 0.8);

        // Enhanced glow for neurons
        const glowSize = particle.isNeuron ? particle.size * 6 : particle.size * 3;
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize * pulseScale
        );
        
        if (particle.isNeuron) {
          gradient.addColorStop(0, `hsla(${particle.hue}, 90%, 85%, ${currentOpacity})`);
          gradient.addColorStop(0.3, `hsla(${particle.hue}, 80%, 70%, ${currentOpacity * 0.6})`);
          gradient.addColorStop(0.7, `hsla(${particle.hue}, 70%, 60%, ${currentOpacity * 0.2})`);
          gradient.addColorStop(1, `hsla(${particle.hue}, 60%, 50%, 0)`);
        } else {
          gradient.addColorStop(0, `hsla(${particle.hue}, 75%, 65%, ${currentOpacity * 0.8})`);
          gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 60%, ${currentOpacity * 0.4})`);
          gradient.addColorStop(1, `hsla(${particle.hue}, 65%, 55%, 0)`);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowSize * pulseScale, 0, Math.PI * 2);
        ctx.fill();

        // Core neural node
        const coreSize = particle.size * pulseScale;
        ctx.fillStyle = particle.isNeuron 
          ? `hsla(${particle.hue}, 95%, 90%, ${currentOpacity})`
          : `hsla(${particle.hue}, 85%, 75%, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, coreSize, 0, Math.PI * 2);
        ctx.fill();

        // Extra bright core for neurons
        if (particle.isNeuron) {
          ctx.fillStyle = `hsla(${particle.hue}, 100%, 95%, ${currentOpacity * 0.8})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, coreSize * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animate();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ 
        background: `
          radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          radial-gradient(ellipse at top right, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at bottom, rgba(251, 146, 60, 0.06) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f14 100%)
        `
      }}
    />
  );
}