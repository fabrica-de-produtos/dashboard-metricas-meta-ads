'use client';

import { useMetrics } from '@/app/lib/contexts';
import { Skeleton } from '@/components/ui/skeleton';

function ComparisonSkeleton() {
  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="mb-6">
          <Skeleton className="h-6 w-56 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-border-subtle">
              <Skeleton className="h-4 w-40" />
              <div className="flex gap-8">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CampaignComparison() {
  const { metrics, isLoading } = useMetrics();

  if (isLoading || !metrics?.data?.ads) {
    return <ComparisonSkeleton />;
  }

  const { ads } = metrics.data;

  // Pegar top 4 campanhas por investimento
  const topCampaigns = ads.slice(0, 4);

  // Encontrar o melhor CPL para destacar
  const bestCpl = Math.min(...topCampaigns.filter(c => c.cpl > 0).map(c => c.cpl));

  const getCplStatus = (cpl: number): 'success' | 'error' | 'neutral' => {
    if (cpl === 0) return 'neutral';
    if (cpl <= bestCpl * 1.05) return 'success';
    if (cpl > bestCpl * 1.15) return 'error';
    return 'neutral';
  };

  const getCplColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-success';
      case 'error': return 'text-error';
      default: return 'text-text-primary';
    }
  };

  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-1">Comparação entre Campanhas</h2>
          <p className="text-sm text-text-secondary">Análise comparativa de desempenho das principais campanhas</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">Campanha</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">Investimento</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">Leads</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">CPL</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-text-secondary uppercase tracking-wide">CTR</th>
              </tr>
            </thead>
            <tbody>
              {topCampaigns.map((campaign, index) => {
                const cplStatus = getCplStatus(campaign.cpl);
                return (
                  <tr key={campaign.id} className={index !== topCampaigns.length - 1 ? 'border-b border-border-subtle' : ''}>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-gold-primary' : 'bg-text-secondary'}`}></div>
                        <span className="text-sm font-medium text-text-primary line-clamp-1 max-w-[200px]" title={campaign.name}>
                          {campaign.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-text-primary">{campaign.investmentFormatted}</td>
                    <td className="py-4 px-4 text-right text-sm text-text-primary">{campaign.leads}</td>
                    <td className={`py-4 px-4 text-right text-sm font-medium ${getCplColor(cplStatus)}`}>{campaign.cplFormatted}</td>
                    <td className="py-4 px-4 text-right text-sm font-medium text-gold-primary">{campaign.ctrFormatted}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
