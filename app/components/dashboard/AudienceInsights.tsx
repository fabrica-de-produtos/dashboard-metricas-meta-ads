'use client';

import { useMetrics } from '@/app/lib/contexts';
import { Skeleton } from '@/components/ui/skeleton';

interface InsightItemProps {
  label: string;
  value: string;
  percentage: number;
  isHighlight?: boolean;
}

interface InsightCardProps {
  icon: string;
  title: string;
  items: InsightItemProps[];
}

function InsightItem({ label, value, percentage, isHighlight = false }: InsightItemProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-text-primary">{label}</span>
        <span className={`text-sm font-medium ${isHighlight ? 'text-gold-primary' : 'text-text-primary'}`}>
          {value}
        </span>
      </div>
      <div className="w-full bg-border-subtle rounded-full h-2">
        <div 
          className={`${isHighlight ? 'bg-gold-primary' : 'bg-text-secondary'} h-2 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function InsightCard({ icon, title, items }: InsightCardProps) {
  return (
    <div className="bg-dark-elevated rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <i className={`${icon} text-gold-primary text-2xl`}></i>
        <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">{title}</span>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <InsightItem key={index} {...item} isHighlight={index === 0} />
        ))}
      </div>
    </div>
  );
}

function AudienceSkeleton() {
  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="mb-6">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-dark-elevated rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-8 h-8 rounded" />
                <Skeleton className="w-16 h-3" />
              </div>
              <div className="space-y-3">
                <div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-2 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-2 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AudienceInsights() {
  const { metrics, isLoading } = useMetrics();

  if (isLoading || !metrics?.data?.audience) {
    return <AudienceSkeleton />;
  }

  const { audience } = metrics.data;
  const { demographics, devices } = audience;

  // Preparar dados de gênero
  const genderItems: InsightItemProps[] = [
    { 
      label: 'Feminino', 
      value: `${demographics.gender.female.toFixed(0)}%`, 
      percentage: demographics.gender.female 
    },
    { 
      label: 'Masculino', 
      value: `${demographics.gender.male.toFixed(0)}%`, 
      percentage: demographics.gender.male 
    },
  ].sort((a, b) => b.percentage - a.percentage);

  // Preparar dados de idade (top 2)
  const ageItems: InsightItemProps[] = demographics.ageRanges
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 2)
    .map(age => ({
      label: age.range,
      value: `${age.percentage.toFixed(0)}%`,
      percentage: age.percentage,
    }));

  // Preparar dados de dispositivo
  const deviceItems: InsightItemProps[] = [
    { label: 'Mobile', value: `${devices.mobile}%`, percentage: devices.mobile },
    { label: 'Desktop', value: `${devices.desktop}%`, percentage: devices.desktop },
  ].sort((a, b) => b.percentage - a.percentage);

  const insights: InsightCardProps[] = [
    {
      icon: 'fa-solid fa-venus-mars',
      title: 'Gênero',
      items: genderItems
    },
    {
      icon: 'fa-solid fa-cake-candles',
      title: 'Faixa Etária',
      items: ageItems.length > 0 ? ageItems : [
        { label: 'Sem dados', value: '-', percentage: 0 }
      ]
    },
    {
      icon: 'fa-solid fa-mobile-screen-button',
      title: 'Dispositivo',
      items: deviceItems
    },
    {
      icon: 'fa-solid fa-clock',
      title: 'Horário Pico',
      items: audience.bestHours.length > 0 
        ? audience.bestHours.slice(0, 2).map(h => ({
            label: h.hour,
            value: `${h.performance}%`,
            percentage: h.performance,
          }))
        : [
            { label: '19h-21h', value: '45%', percentage: 45 },
            { label: '12h-14h', value: '28%', percentage: 28 }
          ]
    }
  ];

  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-1">Insights de Público</h2>
          <p className="text-sm text-text-secondary">Análise demográfica e comportamental dos leads gerados</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight, index) => (
            <InsightCard key={index} {...insight} />
          ))}
        </div>
      </div>
    </section>
  );
}
