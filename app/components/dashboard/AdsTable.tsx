'use client';

import { useMetrics } from '@/app/lib/contexts';
import { Skeleton } from '@/components/ui/skeleton';

interface AdsTableProps {
  onAdClick?: (adId: string) => void;
}

function TableSkeleton() {
  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-4">
              <Skeleton className="w-10 h-10 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AdsTable({ onAdClick }: AdsTableProps) {
  const { metrics, isLoading } = useMetrics();

  if (isLoading || !metrics?.data?.ads) {
    return <TableSkeleton />;
  }

  const { ads } = metrics.data;

  // Limitar a 10 itens para não sobrecarregar a UI
  const displayAds = ads.slice(0, 10);

  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-1">Campanhas</h2>
            <p className="text-sm text-text-secondary">
              Desempenho detalhado de cada campanha ({ads.length} {ads.length === 1 ? 'campanha' : 'campanhas'})
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg bg-dark-elevated border border-border-subtle text-text-secondary text-sm font-medium hover:border-gold-primary hover:text-gold-primary focus-ring transition-all">
              <i className="fa-solid fa-filter mr-2"></i>
              Filtrar
            </button>
            <button className="px-4 py-2 rounded-lg bg-dark-elevated border border-border-subtle text-text-secondary text-sm font-medium hover:border-gold-primary hover:text-gold-primary focus-ring transition-all">
              <i className="fa-solid fa-download mr-2"></i>
              Exportar
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gold-primary">
                <th className="text-left py-4 px-4 text-sm font-semibold text-text-primary">Nome da Campanha</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-text-primary">Status</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-text-primary">Investimento</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-text-primary">Cliques</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-text-primary">Leads</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-text-primary">CPL</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-text-primary">CTR</th>
                <th className="text-center py-4 px-4 text-sm font-semibold text-text-primary">Ações</th>
              </tr>
            </thead>
            <tbody>
              {displayAds.map((ad, index) => (
                <tr 
                  key={ad.id} 
                  className={`${index !== displayAds.length - 1 ? 'border-b border-border-subtle' : ''} hover:bg-dark-elevated transition-colors`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-dark-elevated flex items-center justify-center">
                        <i className="fa-solid fa-bullhorn text-gold-primary"></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary line-clamp-1 max-w-[300px]" title={ad.name}>
                          {ad.name}
                        </p>
                        <p className="text-xs text-text-secondary">{ad.placement}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      ad.status === 'active' 
                        ? 'bg-success bg-opacity-10 text-success' 
                        : 'bg-text-secondary bg-opacity-10 text-text-secondary'
                    }`}>
                      <i className="fa-solid fa-circle text-[6px]"></i>
                      {ad.status === 'active' ? 'Ativo' : 'Pausado'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-sm font-medium text-text-primary">
                    {ad.investmentFormatted}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-text-primary">
                    {ad.clicks.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-text-primary">
                    {ad.leads.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-4 px-4 text-right text-sm font-medium text-gold-primary">
                    {ad.cplFormatted}
                  </td>
                  <td className="py-4 px-4 text-right text-sm text-text-primary">
                    {ad.ctrFormatted}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button 
                      onClick={() => onAdClick?.(ad.id)}
                      className="w-8 h-8 rounded-lg hover:bg-dark-elevated flex items-center justify-center mx-auto focus-ring" 
                      aria-label="Ver detalhes"
                    >
                      <i className="fa-solid fa-circle-info text-text-secondary hover:text-gold-primary transition-colors"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {ads.length > 10 && (
          <div className="mt-4 text-center">
            <button className="text-sm text-gold-primary hover:text-gold-secondary transition-colors">
              Ver todas as {ads.length} campanhas
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
