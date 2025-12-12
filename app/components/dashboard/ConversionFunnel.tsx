'use client';

import { useMetrics } from '@/app/lib/contexts';
import { Skeleton } from '@/components/ui/skeleton';

interface FunnelStep {
  icon: string;
  title: string;
  subtitle: string;
  value: string;
  percentage: number;
  conversionLabel?: string;
  barColor?: string;
}

function FunnelSkeleton() {
  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="mb-6">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="w-full h-3 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ConversionFunnel() {
  const { metrics, isLoading } = useMetrics();

  if (isLoading || !metrics?.data?.funnel) {
    return <FunnelSkeleton />;
  }

  const { funnel } = metrics.data;
  
  // Calcular percentuais baseado nas impressões (topo do funil)
  const maxValue = funnel.impressions || 1;
  
  const funnelSteps: FunnelStep[] = [
    {
      icon: 'fa-solid fa-eye',
      title: 'Impressões',
      subtitle: 'Pessoas que viram o anúncio',
      value: funnel.impressions.toLocaleString('pt-BR'),
      percentage: 100
    },
    {
      icon: 'fa-solid fa-mouse-pointer',
      title: 'Cliques',
      subtitle: 'Usuários que clicaram no anúncio',
      value: funnel.clicks.toLocaleString('pt-BR'),
      percentage: Math.min(100, (funnel.clicks / maxValue) * 100 * 10), // Escala visual
      conversionLabel: `${((funnel.clicks / maxValue) * 100).toFixed(1)}% CTR`
    },
    {
      icon: 'fa-solid fa-user-plus',
      title: 'Leads Gerados',
      subtitle: 'Formulários preenchidos',
      value: funnel.leads.toLocaleString('pt-BR'),
      percentage: Math.min(100, (funnel.leads / maxValue) * 100 * 50), // Escala visual
      conversionLabel: funnel.clicks > 0 
        ? `${((funnel.leads / funnel.clicks) * 100).toFixed(1)}% dos cliques`
        : '0%'
    },
    {
      icon: 'fa-solid fa-calendar-check',
      title: 'Agendamentos',
      subtitle: 'Consultas marcadas',
      value: funnel.appointments.toLocaleString('pt-BR'),
      percentage: Math.min(100, (funnel.appointments / maxValue) * 100 * 100), // Escala visual
      conversionLabel: funnel.leads > 0 
        ? `${((funnel.appointments / funnel.leads) * 100).toFixed(0)}% dos leads`
        : '0%'
    },
    {
      icon: 'fa-solid fa-check-circle',
      title: 'Conversões',
      subtitle: 'Vendas realizadas',
      value: funnel.conversions.toLocaleString('pt-BR'),
      percentage: Math.min(100, (funnel.conversions / maxValue) * 100 * 200), // Escala visual
      conversionLabel: funnel.appointments > 0 
        ? `${((funnel.conversions / funnel.appointments) * 100).toFixed(0)}% dos agendamentos`
        : '0%',
      barColor: 'bg-success'
    },
  ];

  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-1">Funil de Conversão</h2>
          <p className="text-sm text-text-secondary">Jornada completa do usuário desde a impressão até a conversão</p>
        </div>
        
        <div className="space-y-4">
          {funnelSteps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-dark-elevated flex items-center justify-center">
                    <i className={`${step.icon} text-gold-primary`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{step.title}</p>
                    <p className="text-xs text-text-secondary">{step.subtitle}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-text-primary">{step.value}</p>
              </div>
              <div className="w-full bg-dark-elevated rounded-full h-3">
                <div 
                  className={`${step.barColor || 'bg-gold-primary'} h-3 rounded-full transition-all duration-500`} 
                  style={{ width: `${Math.max(5, step.percentage)}%` }}
                ></div>
              </div>
              {step.conversionLabel && (
                <p className="text-xs text-text-secondary mt-1">{step.conversionLabel}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
