'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  fetchMetrics, 
  buildMetricsRequest 
} from '@/app/lib/services/metricsService';
import type { 
  MetricsResponse, 
  MetricPeriod 
} from '@/app/lib/types/metrics';

// ===================================================
// CONTEXTO DE MÉTRICAS DO DASHBOARD
// ===================================================

interface MetricsContextType {
  // Dados
  metrics: MetricsResponse | null;
  
  // Estados
  isLoading: boolean;
  error: string | null;
  
  // Filtros atuais
  currentPeriod: MetricPeriod | null;
  
  // Ações
  refreshMetrics: () => Promise<void>;
  setPeriod: (period: MetricPeriod | null) => void;
  setCustomPeriod: (startDate: string, endDate: string) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

interface MetricsProviderProps {
  children: ReactNode;
}

export function MetricsProvider({ children }: MetricsProviderProps) {
  // Estados principais
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros (null = 2024 inteiro por padrão)
  const [currentPeriod, setCurrentPeriod] = useState<MetricPeriod | null>(null);
  const [customPeriodDates, setCustomPeriodDates] = useState<{ start: string; end: string } | null>(null);
  
  // Função para buscar métricas
  const fetchDashboardMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Construir request no formato da Meta API
      const request = buildMetricsRequest(
        '', // userId não é mais necessário no formato Meta
        currentPeriod || undefined,
        {
          customPeriod: currentPeriod === 'custom' && customPeriodDates 
            ? { startDate: customPeriodDates.start, endDate: customPeriodDates.end }
            : undefined,
          includeAudience: true,
        }
      );
      
      console.log('📊 Buscando métricas (formato Meta):', request);
      
      // Fazer chamada ao webhook
      const response = await fetchMetrics(request);
      
      if (response.success) {
        setMetrics(response);
        console.log('✅ Métricas carregadas:', response);
      } else {
        setError(response.error?.message || 'Erro ao carregar métricas');
        console.error('❌ Erro ao carregar métricas:', response.error);
      }
      
    } catch (err) {
      console.error('❌ Erro na requisição:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  }, [currentPeriod, customPeriodDates]);
  
  // Buscar métricas ao montar o componente e quando filtros mudarem
  useEffect(() => {
    fetchDashboardMetrics();
  }, [fetchDashboardMetrics]);
  
  // Funções para atualizar filtros
  const setPeriod = useCallback((period: MetricPeriod | null) => {
    setCurrentPeriod(period);
  }, []);
  
  const setCustomPeriod = useCallback((startDate: string, endDate: string) => {
    setCustomPeriodDates({ start: startDate, end: endDate });
    setCurrentPeriod('custom');
  }, []);
  
  const value: MetricsContextType = {
    metrics,
    isLoading,
    error,
    currentPeriod,
    refreshMetrics: fetchDashboardMetrics,
    setPeriod,
    setCustomPeriod,
  };
  
  return (
    <MetricsContext.Provider value={value}>
      {children}
    </MetricsContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de métricas
 */
export function useMetrics() {
  const context = useContext(MetricsContext);
  
  if (context === undefined) {
    throw new Error('useMetrics deve ser usado dentro de um MetricsProvider');
  }
  
  return context;
}

