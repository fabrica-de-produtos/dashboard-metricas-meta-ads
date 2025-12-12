'use client';

import { useMetrics } from '@/app/lib/contexts';
import { Skeleton } from '@/components/ui/skeleton';

interface RecommendationProps {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  borderColor: string;
  title: string;
  description: string;
  linkColor: string;
}

function RecommendationCard({ icon, iconBgColor, iconColor, borderColor, title, description, linkColor }: RecommendationProps) {
  return (
    <div className={`bg-dark-elevated rounded-xl p-6 border-l-4 ${borderColor}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
          <i className={`${icon} ${iconColor}`}></i>
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
          <p className="text-sm text-text-secondary mb-3">{description}</p>
          <button className={`text-xs font-medium ${linkColor} hover:underline focus-ring`}>
            Ver detalhes
            <i className="fa-solid fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

function RecommendationsSkeleton() {
  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="mb-6">
          <Skeleton className="h-6 w-56 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-dark-elevated rounded-xl p-6 border-l-4 border-border-subtle">
              <div className="flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Recommendations() {
  const { metrics, isLoading } = useMetrics();

  if (isLoading) {
    return <RecommendationsSkeleton />;
  }

  // Gerar recomendações baseadas nos dados reais
  const kpis = metrics?.data?.kpis;
  const ads = metrics?.data?.ads || [];
  const audience = metrics?.data?.audience;

  const recommendations: RecommendationProps[] = [];

  // Recomendação baseada no investimento
  if (kpis?.investment) {
    recommendations.push({
      icon: 'fa-solid fa-chart-line',
      iconBgColor: 'bg-gold-primary bg-opacity-10',
      iconColor: 'text-gold-primary',
      borderColor: 'border-gold-primary',
      title: 'Análise de Investimento',
      description: `Investimento total de ${kpis.investment.formattedValue} com ${kpis.clicks?.formattedValue || '0'} cliques gerados. ${kpis.cpl?.value && kpis.cpl.value > 0 ? `Custo por lead médio de ${kpis.cpl.formattedValue}.` : ''}`,
      linkColor: 'text-gold-primary'
    });
  }

  // Recomendação baseada na melhor campanha
  if (ads.length > 0) {
    const bestCampaign = ads.reduce((best, current) => 
      current.ctr > best.ctr ? current : best
    , ads[0]);

    recommendations.push({
      icon: 'fa-solid fa-arrow-trend-up',
      iconBgColor: 'bg-success bg-opacity-10',
      iconColor: 'text-success',
      borderColor: 'border-success',
      title: 'Melhor Performance',
      description: `A campanha "${bestCampaign.name.substring(0, 40)}..." tem o melhor CTR (${bestCampaign.ctrFormatted}). Considere aumentar o investimento nesta campanha.`,
      linkColor: 'text-success'
    });
  }

  // Recomendação baseada na audiência
  if (audience?.demographics) {
    const topGender = audience.demographics.gender.female > audience.demographics.gender.male ? 'feminino' : 'masculino';
    const topPercentage = Math.max(audience.demographics.gender.female, audience.demographics.gender.male).toFixed(0);
    
    recommendations.push({
      icon: 'fa-solid fa-bullseye',
      iconBgColor: 'bg-gold-primary bg-opacity-10',
      iconColor: 'text-gold-primary',
      borderColor: 'border-gold-primary',
      title: 'Otimizar Público-Alvo',
      description: `${topPercentage}% do seu público é ${topGender}. Considere criar campanhas específicas para este segmento com maior potencial.`,
      linkColor: 'text-gold-primary'
    });
  }

  // Recomendação sobre leads
  if (kpis?.leads && kpis.leads.value > 0) {
    recommendations.push({
      icon: 'fa-solid fa-users',
      iconBgColor: 'bg-success bg-opacity-10',
      iconColor: 'text-success',
      borderColor: 'border-success',
      title: 'Geração de Leads',
      description: `Foram gerados ${kpis.leads.formattedValue} leads no período. Continue monitorando a qualidade dos leads e a taxa de conversão para agendamentos.`,
      linkColor: 'text-success'
    });
  }

  // Se não há dados suficientes, mostrar recomendação genérica
  if (recommendations.length === 0) {
    recommendations.push({
      icon: 'fa-solid fa-lightbulb',
      iconBgColor: 'bg-gold-primary bg-opacity-10',
      iconColor: 'text-gold-primary',
      borderColor: 'border-gold-primary',
      title: 'Aguardando Dados',
      description: 'Assim que tivermos mais dados das suas campanhas, recomendações personalizadas aparecerão aqui.',
      linkColor: 'text-gold-primary'
    });
  }

  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-1">Recomendações Estratégicas</h2>
          <p className="text-sm text-text-secondary">Sugestões baseadas nos dados das suas campanhas</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.slice(0, 4).map((rec, index) => (
            <RecommendationCard key={index} {...rec} />
          ))}
        </div>
      </div>
    </section>
  );
}
