'use client';

import { useMetrics } from '@/app/lib/contexts';
import { Skeleton } from '@/components/ui/skeleton';

interface InsightCardProps {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
}

function InsightCard({ icon, iconBgColor, iconColor, title, description }: InsightCardProps) {
  return (
    <div className="glass-effect rounded-2xl p-6 hover-lift">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
          <i className={`${icon} ${iconColor} text-xl`}></i>
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="glass-effect rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function InsightsSection() {
  const { metrics, isLoading } = useMetrics();

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  // Usar insights da API ou fallback
  const apiInsights = metrics?.data?.insights || [];
  
  const defaultInsights: InsightCardProps[] = [
    {
      icon: 'fa-solid fa-lightbulb',
      iconBgColor: 'bg-success bg-opacity-10',
      iconColor: 'text-success',
      title: 'Dados Carregados',
      description: `Analisando ${metrics?.meta?.totalCampaigns || 0} campanhas no período de ${metrics?.meta?.periodStart || ''} a ${metrics?.meta?.periodEnd || ''}.`
    },
    {
      icon: 'fa-solid fa-trophy',
      iconBgColor: 'bg-gold-primary bg-opacity-10',
      iconColor: 'text-gold-primary',
      title: 'Investimento Total',
      description: `O investimento total no período foi de ${metrics?.data?.kpis?.investment?.formattedValue || 'R$ 0'} com ${metrics?.data?.kpis?.clicks?.formattedValue || '0'} cliques gerados.`
    },
    {
      icon: 'fa-solid fa-chart-line',
      iconBgColor: 'bg-info bg-opacity-10',
      iconColor: 'text-info',
      title: 'Performance',
      description: `Foram gerados ${metrics?.data?.kpis?.leads?.formattedValue || '0'} leads com custo médio de ${metrics?.data?.kpis?.cpl?.formattedValue || 'R$ 0'} por lead.`
    },
  ];

  // Mapear insights da API para o formato do componente
  const insights: InsightCardProps[] = apiInsights.length > 0 
    ? apiInsights.slice(0, 3).map(insight => ({
        icon: insight.icon || 'fa-solid fa-info-circle',
        iconBgColor: insight.type === 'success' ? 'bg-success bg-opacity-10' 
          : insight.type === 'warning' ? 'bg-warning bg-opacity-10'
          : insight.type === 'tip' ? 'bg-gold-primary bg-opacity-10'
          : 'bg-info bg-opacity-10',
        iconColor: insight.type === 'success' ? 'text-success' 
          : insight.type === 'warning' ? 'text-warning'
          : insight.type === 'tip' ? 'text-gold-primary'
          : 'text-info',
        title: insight.title,
        description: insight.description,
      }))
    : defaultInsights;

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <InsightCard key={index} {...insight} />
        ))}
      </div>
    </section>
  );
}
