'use client';

import { useMetrics } from '@/app/lib/contexts';
import { useState, useEffect } from 'react';

function AnimatedDots() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-sm font-medium text-text-primary">
      Carregando métricas<span className="text-gold-primary inline-block w-4">{dots}</span>
    </span>
  );
}

export default function LoadingOverlay() {
  const { isLoading, error, refreshMetrics } = useMetrics();
  
  // Indicador de loading centralizado com reticências oscilando
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        <div className="px-6 py-3 rounded-full bg-dark-surface/90 backdrop-blur-sm animate-pulse-slow">
          <AnimatedDots />
        </div>
      </div>
    );
  }
  
  // Overlay de erro
  if (error) {
    return (
      <div className="fixed inset-0 z-[100] bg-dark-primary bg-opacity-90 flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-error bg-opacity-10 flex items-center justify-center mb-4">
            <i className="fa-solid fa-triangle-exclamation text-error text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Erro ao carregar métricas
          </h3>
          <p className="text-text-secondary mb-6">
            {error}
          </p>
          <button 
            onClick={refreshMetrics}
            className="px-6 py-3 rounded-xl font-medium text-dark-primary transition-all hover:shadow-lg hover:shadow-gold-primary/20"
            style={{ 
              background: 'linear-gradient(to right, #E4C27A, #C9A965)',
            }}
          >
            <i className="fa-solid fa-rotate-right mr-2"></i>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }
  
  return null;
}

