'use client';

import { useMetrics } from '@/app/lib/contexts';
import { Skeleton } from '@/components/ui/skeleton';

interface KPICardProps {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label?: string;
  };
  subtitle?: string;
  isLoading?: boolean;
}

function KPICardSkeleton() {
  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, highlight = false, trend, subtitle }: KPICardProps) {
  return (
    <div className="glass-effect rounded-2xl p-6 hover:border-gold-primary transition-all hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-dark-elevated flex items-center justify-center">
          <i className={`${icon} text-gold-primary text-xl`}></i>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">{label}</p>
        <p className={`text-3xl font-bold ${highlight ? 'text-gold-primary' : 'text-text-primary'}`}>
          {value}
        </p>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <i className={`fa-solid fa-arrow-${trend.direction === 'down' ? 'down' : 'up'} text-${trend.direction === 'down' ? 'success' : 'success'} text-xs`}></i>
            <span className={`text-xs text-success font-medium`}>{trend.value}</span>
            {trend.label && <span className="text-xs text-text-secondary">{trend.label}</span>}
          </div>
        )}
        {subtitle && !trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-xs text-text-secondary">{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KPICards() {
  const { metrics, isLoading } = useMetrics();

  // Mostrar skeletons enquanto carrega
  if (isLoading || !metrics?.data?.kpis) {
    return (
      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, index) => (
            <KPICardSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }

  const { kpis } = metrics.data;

  const kpiCards: KPICardProps[] = [
    {
      icon: 'fa-solid fa-wallet',
      label: kpis.investment.label,
      value: kpis.investment.formattedValue,
      highlight: true,
      trend: kpis.investment.trend,
    },
    {
      icon: 'fa-solid fa-mouse-pointer',
      label: kpis.clicks.label,
      value: kpis.clicks.formattedValue,
      subtitle: kpis.clicks.subtitle,
    },
    {
      icon: 'fa-solid fa-user-plus',
      label: kpis.leads.label,
      value: kpis.leads.formattedValue,
      subtitle: kpis.leads.subtitle,
    },
    {
      icon: 'fa-solid fa-dollar-sign',
      label: kpis.cpl.label,
      value: kpis.cpl.formattedValue,
      trend: kpis.cpl.trend,
    },
    {
      icon: 'fa-solid fa-calendar-check',
      label: kpis.appointments.label,
      value: kpis.appointments.formattedValue,
      subtitle: kpis.appointments.subtitle,
    },
    {
      icon: 'fa-solid fa-chart-line',
      label: kpis.roas.label,
      value: kpis.roas.formattedValue,
      trend: kpis.roas.trend,
    },
  ];

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpiCards.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>
    </section>
  );
}
