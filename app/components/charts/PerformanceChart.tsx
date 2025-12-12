'use client';

import { useEffect, useRef, useState } from 'react';
import { useMetrics } from '@/app/lib/contexts';
import { Skeleton } from '@/components/ui/skeleton';

declare global {
  interface Window {
    Plotly: typeof import('plotly.js-dist-min');
  }
}

function ChartSkeleton() {
  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        <Skeleton className="h-[450px] w-full" />
      </div>
    </section>
  );
}

export default function PerformanceChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const { metrics, isLoading } = useMetrics();
  const [activeMetrics, setActiveMetrics] = useState({
    investimento: true,
    cliques: false,
    leads: false,
  });

  useEffect(() => {
    if (isLoading || !metrics?.data?.performance) return;

    const renderChart = () => {
      if (!chartRef.current || typeof window === 'undefined' || !window.Plotly) return;

      const performance = metrics.data.performance;
      const dates = performance.map(p => p.date);
      
      const traces = [];

      if (activeMetrics.investimento) {
        traces.push({
          type: 'scatter' as const,
          mode: 'lines' as const,
          name: 'Investimento',
          x: dates,
          y: performance.map(p => p.investment),
          line: { color: '#E4C27A', width: 3 }
        });
      }

      if (activeMetrics.cliques) {
        traces.push({
          type: 'scatter' as const,
          mode: 'lines' as const,
          name: 'Cliques',
          x: dates,
          y: performance.map(p => p.clicks),
          line: { color: '#A0A3B1', width: 3 }
        });
      }

      if (activeMetrics.leads) {
        traces.push({
          type: 'scatter' as const,
          mode: 'lines' as const,
          name: 'Leads',
          x: dates,
          y: performance.map(p => p.leads),
          line: { color: '#4ADE80', width: 3 }
        });
      }

      const layout = {
        plot_bgcolor: '#050509',
        paper_bgcolor: '#050509',
        font: { family: 'Inter, sans-serif', color: '#F5F5F5' },
        xaxis: { gridcolor: '#262837', color: '#A0A3B1' },
        yaxis: { gridcolor: '#262837', color: '#A0A3B1' },
        margin: { t: 20, r: 20, b: 50, l: 60 },
        showlegend: true,
        legend: { orientation: 'h' as const, x: 0, y: -0.15, font: { color: '#F5F5F5' } }
      };

      const config = { responsive: true, displayModeBar: false, displaylogo: false };

      window.Plotly.newPlot(chartRef.current, traces, layout, config);
    };

    const checkAndRender = () => {
      if (window.Plotly) {
        renderChart();
      } else {
        setTimeout(checkAndRender, 100);
      }
    };

    checkAndRender();

    return () => {
      if (chartRef.current && window.Plotly) {
        window.Plotly.purge(chartRef.current);
      }
    };
  }, [activeMetrics, metrics, isLoading]);

  const toggleMetric = (metric: keyof typeof activeMetrics) => {
    setActiveMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  };

  if (isLoading || !metrics?.data?.performance) {
    return <ChartSkeleton />;
  }

  return (
    <section className="mb-10">
      <div className="glass-effect rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-1">Performance da Campanha</h2>
            <p className="text-sm text-text-secondary">
              Evolução dos principais indicadores ({metrics.data.performance.length} dias)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleMetric('investimento')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-elevated text-sm font-medium focus-ring transition-all ${
                activeMetrics.investimento 
                  ? 'border border-gold-primary text-gold-primary' 
                  : 'border border-border-subtle text-text-secondary hover:border-gold-primary hover:text-gold-primary'
              }`}
            >
              <i className={`fa-solid fa-check text-xs ${activeMetrics.investimento ? 'opacity-100' : 'opacity-0'}`}></i>
              Investimento
            </button>
            <button
              onClick={() => toggleMetric('cliques')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-elevated text-sm font-medium focus-ring transition-all ${
                activeMetrics.cliques 
                  ? 'border border-gold-primary text-gold-primary' 
                  : 'border border-border-subtle text-text-secondary hover:border-gold-primary hover:text-gold-primary'
              }`}
            >
              <i className={`fa-solid fa-check text-xs ${activeMetrics.cliques ? 'opacity-100' : 'opacity-0'}`}></i>
              Cliques
            </button>
            <button
              onClick={() => toggleMetric('leads')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-elevated text-sm font-medium focus-ring transition-all ${
                activeMetrics.leads 
                  ? 'border border-gold-primary text-gold-primary' 
                  : 'border border-border-subtle text-text-secondary hover:border-gold-primary hover:text-gold-primary'
              }`}
            >
              <i className={`fa-solid fa-check text-xs ${activeMetrics.leads ? 'opacity-100' : 'opacity-0'}`}></i>
              Leads
            </button>
          </div>
        </div>
        <div ref={chartRef} style={{ height: '450px' }}></div>
      </div>
    </section>
  );
}
