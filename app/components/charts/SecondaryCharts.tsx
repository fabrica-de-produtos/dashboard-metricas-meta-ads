'use client';

import { useEffect, useRef } from 'react';
import { useMetrics } from '@/app/lib/contexts';
import { Skeleton } from '@/components/ui/skeleton';

declare global {
  interface Window {
    Plotly: typeof import('plotly.js-dist-min');
  }
}

function ChartsSkeleton() {
  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-2xl p-8">
          <div className="mb-6">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-[320px] w-full" />
        </div>

        <div className="glass-effect rounded-2xl p-8">
          <div className="mb-6">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-[320px] w-full" />
        </div>
      </div>
    </section>
  );
}

export default function SecondaryCharts() {
  const cplChartRef = useRef<HTMLDivElement>(null);
  const placementChartRef = useRef<HTMLDivElement>(null);
  const { metrics, isLoading } = useMetrics();

  useEffect(() => {
    if (isLoading || !metrics?.data?.performance) return;

    const renderCharts = () => {
      if (typeof window === 'undefined' || !window.Plotly) return;

      const performance = metrics.data.performance;

      // CPL Chart - usando dados reais
      if (cplChartRef.current) {
        const dates = performance.map(p => p.date);
        const cplValues = performance.map(p => p.cpl);

        const cplData = [{
          type: 'bar' as const,
          x: dates,
          y: cplValues,
          marker: { color: '#E4C27A' }
        }];

        const cplLayout = {
          plot_bgcolor: '#050509',
          paper_bgcolor: '#050509',
          font: { family: 'Inter, sans-serif', color: '#F5F5F5' },
          xaxis: { gridcolor: '#262837', color: '#A0A3B1' },
          yaxis: { title: 'CPL (R$)', gridcolor: '#262837', color: '#A0A3B1' },
          margin: { t: 20, r: 20, b: 50, l: 60 },
          showlegend: false
        };

        window.Plotly.newPlot(cplChartRef.current, cplData, cplLayout, { responsive: true, displayModeBar: false });
      }

      // Placement Chart - usando dados de audiência se disponível
      if (placementChartRef.current) {
        const audience = metrics.data.audience;
        
        // Usar dados de gênero como proxy para o gráfico de pizza
        const genderData = audience?.demographics?.gender;
        
        let labels: string[];
        let values: number[];
        
        if (genderData) {
          labels = ['Feminino', 'Masculino', 'Outros'];
          values = [genderData.female, genderData.male, genderData.other];
        } else {
          labels = ['Sem dados'];
          values = [100];
        }

        const placementData = [{
          type: 'pie' as const,
          labels,
          values,
          marker: { colors: ['#E4C27A', '#C9A965', '#A0A3B1', '#262837'] },
          textinfo: 'label+percent' as const,
          textfont: { color: '#F5F5F5' }
        }];

        const placementLayout = {
          plot_bgcolor: '#050509',
          paper_bgcolor: '#050509',
          font: { family: 'Inter, sans-serif', color: '#F5F5F5' },
          margin: { t: 20, r: 20, b: 20, l: 20 },
          showlegend: true,
          legend: { orientation: 'v' as const, x: 1, y: 0.5, font: { color: '#F5F5F5' } }
        };

        window.Plotly.newPlot(placementChartRef.current, placementData, placementLayout, { responsive: true, displayModeBar: false });
      }
    };

    const checkAndRender = () => {
      if (window.Plotly) {
        renderCharts();
      } else {
        setTimeout(checkAndRender, 100);
      }
    };

    checkAndRender();

    return () => {
      if (cplChartRef.current && window.Plotly) {
        window.Plotly.purge(cplChartRef.current);
      }
      if (placementChartRef.current && window.Plotly) {
        window.Plotly.purge(placementChartRef.current);
      }
    };
  }, [metrics, isLoading]);

  if (isLoading || !metrics?.data?.performance) {
    return <ChartsSkeleton />;
  }

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="glass-effect rounded-2xl p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-1">Custo por Lead Diário</h3>
            <p className="text-sm text-text-secondary">Análise do CPL ao longo do período</p>
          </div>
          <div ref={cplChartRef} style={{ height: '320px' }}></div>
        </div>

        <div className="glass-effect rounded-2xl p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-primary mb-1">Distribuição por Gênero</h3>
            <p className="text-sm text-text-secondary">Proporção de público por gênero</p>
          </div>
          <div ref={placementChartRef} style={{ height: '320px' }}></div>
        </div>

      </div>
    </section>
  );
}
