'use client';

import { useEffect, useRef } from 'react';

interface AdDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Plotly: typeof import('plotly.js-dist-min');
  }
}

export default function AdDetailsModal({ isOpen, onClose }: AdDetailsModalProps) {
  const performanceChartRef = useRef<HTMLDivElement>(null);
  const engagementChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const renderCharts = () => {
      if (typeof window === 'undefined' || !window.Plotly) return;

      // Performance Chart
      if (performanceChartRef.current) {
        const performanceData = [
          {
            type: 'scatter' as const,
            mode: 'lines' as const,
            name: 'Investimento (R$)',
            x: ['15/12', '16/12', '17/12', '18/12', '19/12', '20/12', '21/12', '22/12', '23/12', '24/12', '25/12', '26/12', '27/12', '28/12'],
            y: [45, 52, 58, 62, 65, 68, 71, 64, 59, 63, 67, 72, 76, 68],
            line: { color: '#E4C27A', width: 3 }
          },
          {
            type: 'scatter' as const,
            mode: 'lines' as const,
            name: 'Cliques',
            x: ['15/12', '16/12', '17/12', '18/12', '19/12', '20/12', '21/12', '22/12', '23/12', '24/12', '25/12', '26/12', '27/12', '28/12'],
            y: [24, 29, 34, 36, 38, 41, 43, 38, 32, 35, 39, 44, 48, 42],
            line: { color: '#A0A3B1', width: 3 }
          },
          {
            type: 'scatter' as const,
            mode: 'lines' as const,
            name: 'Leads',
            x: ['15/12', '16/12', '17/12', '18/12', '19/12', '20/12', '21/12', '22/12', '23/12', '24/12', '25/12', '26/12', '27/12', '28/12'],
            y: [1, 2, 2, 3, 2, 3, 4, 2, 2, 3, 3, 4, 5, 3],
            line: { color: '#4ADE80', width: 3 }
          }
        ];

        const performanceLayout = {
          plot_bgcolor: '#050509',
          paper_bgcolor: '#050509',
          font: { family: 'Inter, sans-serif', color: '#F5F5F5' },
          xaxis: { gridcolor: '#262837', color: '#A0A3B1' },
          yaxis: { gridcolor: '#262837', color: '#A0A3B1' },
          margin: { t: 20, r: 20, b: 50, l: 60 },
          showlegend: true,
          legend: { orientation: 'h' as const, x: 0, y: -0.15, font: { color: '#F5F5F5' } }
        };

        window.Plotly.newPlot(performanceChartRef.current, performanceData, performanceLayout, { responsive: true, displayModeBar: false });
      }

      // Engagement Chart
      if (engagementChartRef.current) {
        const engagementData = [{
          type: 'pie' as const,
          labels: ['Reações', 'Comentários', 'Compartilhamentos', 'Salvamentos'],
          values: [45, 25, 18, 12],
          marker: { colors: ['#E4C27A', '#C9A965', '#A0A3B1', '#262837'] },
          textinfo: 'label+percent' as const,
          textfont: { color: '#F5F5F5' }
        }];

        const engagementLayout = {
          plot_bgcolor: '#050509',
          paper_bgcolor: '#050509',
          font: { family: 'Inter, sans-serif', color: '#F5F5F5' },
          margin: { t: 20, r: 20, b: 20, l: 20 },
          showlegend: true,
          legend: { orientation: 'v' as const, x: 1, y: 0.5, font: { color: '#F5F5F5' } }
        };

        window.Plotly.newPlot(engagementChartRef.current, engagementData, engagementLayout, { responsive: true, displayModeBar: false });
      }
    };

    const checkAndRender = () => {
      if (window.Plotly) {
        setTimeout(renderCharts, 100);
      } else {
        setTimeout(checkAndRender, 100);
      }
    };

    checkAndRender();

    return () => {
      if (performanceChartRef.current && window.Plotly) {
        window.Plotly.purge(performanceChartRef.current);
      }
      if (engagementChartRef.current && window.Plotly) {
        window.Plotly.purge(engagementChartRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-6">
      <div className="glass-effect rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto custom-scrollbar">
        
        {/* Modal Header */}
        <div className="sticky top-0 glass-effect-light border-b border-border-subtle z-10 rounded-t-2xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg bg-dark-elevated hover:bg-border-subtle flex items-center justify-center transition-all focus-ring"
                >
                  <i className="fa-solid fa-arrow-left text-text-primary"></i>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-text-primary">Harmonização Facial - Promoção</h1>
                  <p className="text-sm text-text-secondary mt-1">ID: AD-2024-001 • Feed + Stories • Campanha Ativa</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg bg-dark-elevated hover:bg-border-subtle flex items-center justify-center transition-all focus-ring"
                >
                  <i className="fa-solid fa-xmark text-text-primary text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="px-8 py-8">
          
          {/* Overview Section */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Ad Preview */}
              <div className="lg:col-span-1">
                <div className="glass-effect-light rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">Preview do Anúncio</h3>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success bg-opacity-10 text-success text-xs font-medium">
                      <i className="fa-solid fa-circle text-[6px]"></i>
                      Ativo
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="h-64 overflow-hidden rounded-lg bg-dark-elevated flex items-center justify-center">
                      <div className="text-center">
                        <i className="fa-solid fa-image text-gold-primary text-4xl mb-2"></i>
                        <p className="text-xs text-text-secondary">Preview da imagem</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Título Principal</p>
                      <p className="text-sm font-medium text-text-primary">Harmonização Facial com 30% OFF</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Descrição</p>
                      <p className="text-sm text-text-primary leading-relaxed">Transforme seu rosto com técnicas avançadas de harmonização facial. Agende sua avaliação gratuita hoje!</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Call to Action</p>
                      <button className="w-full py-2.5 bg-gold-primary bg-opacity-20 border border-gold-primary text-gold-primary rounded-lg text-sm font-medium">
                        Agendar Avaliação
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: 'fa-wallet', label: 'Investimento', value: 'R$ 845', highlight: true, trend: '+18%' },
                    { icon: 'fa-eye', label: 'Impressões', value: '12.4K', subtitle: 'Alcance único' },
                    { icon: 'fa-mouse-pointer', label: 'Cliques', value: '456', subtitle: 'CTR 3.8%' },
                    { icon: 'fa-user-plus', label: 'Leads', value: '32', subtitle: 'Taxa 7.0%' },
                    { icon: 'fa-dollar-sign', label: 'CPL', value: 'R$ 26,41', trend: '-12%' },
                    { icon: 'fa-hand-pointer', label: 'CPC', value: 'R$ 1,85', subtitle: 'Média' },
                    { icon: 'fa-calendar-check', label: 'Agendamentos', value: '14', subtitle: 'Taxa 43.8%' },
                    { icon: 'fa-chart-line', label: 'ROAS', value: '4.8', trend: 'Acima da meta' },
                  ].map((metric, index) => (
                    <div key={index} className="glass-effect-light rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-elevated flex items-center justify-center">
                          <i className={`fa-solid ${metric.icon} text-gold-primary`}></i>
                        </div>
                      </div>
                      <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-1">{metric.label}</p>
                      <p className={`text-2xl font-bold ${metric.highlight ? 'text-gold-primary' : 'text-text-primary'}`}>{metric.value}</p>
                      {metric.trend && (
                        <div className="flex items-center gap-1 mt-2">
                          <i className={`fa-solid fa-arrow-${metric.trend.startsWith('+') || metric.trend.startsWith('-') ? (metric.trend.startsWith('+') ? 'up' : 'down') : 'up'} text-success text-xs`}></i>
                          <span className="text-xs text-success font-medium">{metric.trend}</span>
                        </div>
                      )}
                      {metric.subtitle && !metric.trend && (
                        <span className="text-xs text-text-secondary">{metric.subtitle}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Ad Settings */}
                <div className="glass-effect-light rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">Configurações do Anúncio</h3>
                      <p className="text-sm text-text-secondary mt-1">Detalhes técnicos e segmentação</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-2">Posicionamentos</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 bg-dark-elevated rounded-full text-xs font-medium text-text-primary border border-gold-primary">
                            <i className="fa-brands fa-instagram mr-1"></i>
                            Feed
                          </span>
                          <span className="px-3 py-1.5 bg-dark-elevated rounded-full text-xs font-medium text-text-primary border border-gold-primary">
                            <i className="fa-brands fa-instagram mr-1"></i>
                            Stories
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-2">Público-Alvo</p>
                        <div className="space-y-2">
                          {[
                            { label: 'Idade', value: '25-45 anos' },
                            { label: 'Gênero', value: 'Todos' },
                            { label: 'Localização', value: 'São Paulo, SP' },
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2 px-3 bg-dark-elevated rounded-lg">
                              <span className="text-sm text-text-primary">{item.label}</span>
                              <span className="text-sm font-medium text-gold-primary">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-2">Interesses</p>
                        <div className="flex flex-wrap gap-2">
                          {['Estética', 'Beleza', 'Saúde', 'Bem-estar'].map((interest, index) => (
                            <span key={index} className="px-3 py-1.5 bg-dark-elevated rounded-full text-xs text-text-primary">{interest}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-4">
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-2">Orçamento</p>
                        <div className="space-y-2">
                          {[
                            { label: 'Tipo', value: 'Diário' },
                            { label: 'Valor', value: 'R$ 60,00/dia' },
                            { label: 'Gasto Atual', value: 'R$ 845,00' },
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2 px-3 bg-dark-elevated rounded-lg">
                              <span className="text-sm text-text-primary">{item.label}</span>
                              <span className={`text-sm font-medium ${item.label === 'Gasto Atual' ? 'text-text-primary' : 'text-gold-primary'}`}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-2">Programação</p>
                        <div className="space-y-2">
                          {[
                            { label: 'Data Início', value: '15/12/2024' },
                            { label: 'Data Fim', value: 'Contínuo' },
                            { label: 'Dias Ativos', value: '14 dias' },
                          ].map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2 px-3 bg-dark-elevated rounded-lg">
                              <span className="text-sm text-text-primary">{item.label}</span>
                              <span className={`text-sm font-medium ${item.label === 'Dias Ativos' ? 'text-text-primary' : 'text-gold-primary'}`}>{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide mb-2">Objetivo</p>
                        <div className="py-2 px-3 bg-dark-elevated rounded-lg">
                          <span className="text-sm font-medium text-gold-primary">Geração de Leads</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Performance Chart */}
          <section className="mb-8">
            <div className="glass-effect-light rounded-xl p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-1">Performance ao Longo do Tempo</h3>
                <p className="text-sm text-text-secondary">Evolução diária das principais métricas do anúncio</p>
              </div>
              <div ref={performanceChartRef} style={{ height: '400px' }}></div>
            </div>
          </section>

          {/* Engagement and Placement Charts */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="glass-effect-light rounded-xl p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">Engajamento por Tipo</h3>
                  <p className="text-sm text-text-secondary">Distribuição das interações dos usuários</p>
                </div>
                <div ref={engagementChartRef} style={{ height: '350px' }}></div>
              </div>

              <div className="glass-effect-light rounded-xl p-8">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">Performance por Posicionamento</h3>
                  <p className="text-sm text-text-secondary">Comparativo entre Feed e Stories</p>
                </div>
                
                <div className="space-y-6">
                  {/* Feed */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gold-primary bg-opacity-10 flex items-center justify-center">
                          <i className="fa-brands fa-instagram text-gold-primary"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">Feed</p>
                          <p className="text-xs text-text-secondary">58% do investimento</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-gold-primary">R$ 490</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Impressões', value: '7.2K' },
                        { label: 'Cliques', value: '265' },
                        { label: 'Leads', value: '19' },
                      ].map((item, index) => (
                        <div key={index} className="bg-dark-elevated rounded-lg p-3">
                          <p className="text-xs text-text-secondary mb-1">{item.label}</p>
                          <p className="text-lg font-semibold text-text-primary">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-text-secondary">CTR:</span>
                      <span className="text-xs font-medium text-gold-primary">3.7%</span>
                      <span className="text-xs text-text-secondary">•</span>
                      <span className="text-xs text-text-secondary">CPL:</span>
                      <span className="text-xs font-medium text-gold-primary">R$ 25,79</span>
                    </div>
                  </div>

                  {/* Stories */}
                  <div className="border-t border-border-subtle pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-text-secondary bg-opacity-10 flex items-center justify-center">
                          <i className="fa-brands fa-instagram text-text-secondary"></i>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">Stories</p>
                          <p className="text-xs text-text-secondary">42% do investimento</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-text-primary">R$ 355</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Impressões', value: '5.2K' },
                        { label: 'Cliques', value: '191' },
                        { label: 'Leads', value: '13' },
                      ].map((item, index) => (
                        <div key={index} className="bg-dark-elevated rounded-lg p-3">
                          <p className="text-xs text-text-secondary mb-1">{item.label}</p>
                          <p className="text-lg font-semibold text-text-primary">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-text-secondary">CTR:</span>
                      <span className="text-xs font-medium text-text-primary">3.7%</span>
                      <span className="text-xs text-text-secondary">•</span>
                      <span className="text-xs text-text-secondary">CPL:</span>
                      <span className="text-xs font-medium text-text-primary">R$ 27,31</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Demographic Breakdown */}
          <section className="mb-8">
            <div className="glass-effect-light rounded-xl p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-1">Análise Demográfica Detalhada</h3>
                <p className="text-sm text-text-secondary">Perfil completo dos usuários que interagiram com o anúncio</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: 'fa-venus-mars',
                    title: 'Gênero',
                    items: [
                      { label: 'Feminino', value: '72%', percentage: 72 },
                      { label: 'Masculino', value: '28%', percentage: 28 }
                    ]
                  },
                  {
                    icon: 'fa-cake-candles',
                    title: 'Faixa Etária',
                    items: [
                      { label: '25-34 anos', value: '48%', percentage: 48 },
                      { label: '35-44 anos', value: '35%', percentage: 35 },
                      { label: '45+ anos', value: '17%', percentage: 17 }
                    ]
                  },
                  {
                    icon: 'fa-mobile-screen-button',
                    title: 'Dispositivo',
                    items: [
                      { label: 'Mobile', value: '91%', percentage: 91 },
                      { label: 'Desktop', value: '9%', percentage: 9 }
                    ]
                  },
                  {
                    icon: 'fa-clock',
                    title: 'Horário Pico',
                    items: [
                      { label: '19h-21h', value: '52%', percentage: 52 },
                      { label: '12h-14h', value: '31%', percentage: 31 },
                      { label: 'Outros', value: '17%', percentage: 17 }
                    ]
                  }
                ].map((category, catIndex) => (
                  <div key={catIndex} className="bg-dark-elevated rounded-xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-sm font-semibold text-text-primary">{category.title}</h4>
                      <i className={`fa-solid ${category.icon} text-gold-primary`}></i>
                    </div>
                    <div className="space-y-4">
                      {category.items.map((item, itemIndex) => (
                        <div key={itemIndex}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-text-primary">{item.label}</span>
                            <span className={`text-sm font-semibold ${itemIndex === 0 ? 'text-gold-primary' : 'text-text-primary'}`}>{item.value}</span>
                          </div>
                          <div className="w-full bg-border-subtle rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${itemIndex === 0 ? 'bg-gold-primary' : 'bg-text-secondary'}`} 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Conversion Funnel Detail */}
          <section className="mb-8">
            <div className="glass-effect-light rounded-xl p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-1">Funil de Conversão Detalhado</h3>
                <p className="text-sm text-text-secondary">Jornada completa do usuário desde a visualização até o agendamento</p>
              </div>
              
              <div className="space-y-5">
                {[
                  { icon: 'fa-eye', iconBg: 'bg-gold-primary', title: 'Impressões', subtitle: 'Usuários que visualizaram o anúncio', value: '12.4K', conversionLabel: '100% do funil', percentage: 100 },
                  { icon: 'fa-mouse-pointer', iconBg: 'bg-gold-primary', title: 'Cliques no Anúncio', subtitle: 'Usuários que clicaram para saber mais', value: '456', conversionLabel: '3,8% de conversão', percentage: 88 },
                  { icon: 'fa-file-lines', iconBg: 'bg-gold-primary', title: 'Landing Page', subtitle: 'Acessos à página de captura', value: '389', conversionLabel: '85,3% dos cliques', percentage: 75 },
                  { icon: 'fa-pen-to-square', iconBg: 'bg-gold-primary', title: 'Formulário Iniciado', subtitle: 'Usuários que começaram a preencher', value: '78', conversionLabel: '20,1% das visualizações', percentage: 50 },
                  { icon: 'fa-user-plus', iconBg: 'bg-success', title: 'Lead Gerado', subtitle: 'Formulários completados', value: '32', conversionLabel: '41,0% de conclusão', percentage: 35, barColor: 'bg-success' },
                  { icon: 'fa-calendar-check', iconBg: 'bg-success', title: 'Agendamento Confirmado', subtitle: 'Consultas efetivamente marcadas', value: '14', conversionLabel: '43,8% dos leads', percentage: 25, barColor: 'bg-success' },
                ].map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${step.iconBg} bg-opacity-10 flex items-center justify-center`}>
                          <i className={`fa-solid ${step.icon} ${step.iconBg === 'bg-success' ? 'text-success' : 'text-gold-primary'} text-lg`}></i>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-text-primary">{step.title}</p>
                          <p className="text-xs text-text-secondary">{step.subtitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-text-primary">{step.value}</p>
                        <p className={`text-xs ${step.barColor ? 'text-success' : 'text-text-secondary'}`}>{step.conversionLabel}</p>
                      </div>
                    </div>
                    <div className="w-full bg-dark-elevated rounded-full h-4">
                      <div 
                        className={`${step.barColor || 'bg-gold-primary'} h-4 rounded-full`} 
                        style={{ width: `${step.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-8 pt-6 border-t border-border-subtle">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: 'fa-percentage', label: 'Taxa Global', value: '0,11%', subtitle: 'Impressões → Agendamentos' },
                    { icon: 'fa-funnel-dollar', label: 'Custo por Agendamento', value: 'R$ 60,36', subtitle: 'Investimento total / agendamentos' },
                    { icon: 'fa-chart-line', iconColor: 'text-success', label: 'Eficiência', value: 'Excelente', valueColor: 'text-success', subtitle: '18% acima da meta' },
                  ].map((stat, index) => (
                    <div key={index} className="bg-dark-elevated rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <i className={`fa-solid ${stat.icon} ${stat.iconColor || 'text-gold-primary'} text-xl`}></i>
                        <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">{stat.label}</p>
                      </div>
                      <p className={`text-3xl font-bold ${stat.valueColor || 'text-gold-primary'} mb-1`}>{stat.value}</p>
                      <p className="text-xs text-text-secondary">{stat.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Activity Log */}
          <section className="mb-8">
            <div className="glass-effect-light rounded-xl p-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-text-primary mb-1">Histórico de Atividades</h3>
                <p className="text-sm text-text-secondary">Registro de alterações e eventos importantes</p>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: 'fa-check', iconBg: 'bg-success', title: 'Anúncio Ativado', time: 'Há 14 dias', description: 'O anúncio foi publicado e iniciou a veiculação com orçamento de R$ 60/dia' },
                  { icon: 'fa-edit', iconBg: 'bg-gold-primary', title: 'Orçamento Ajustado', time: 'Há 7 dias', description: 'Orçamento aumentado de R$ 50 para R$ 60/dia devido à boa performance' },
                  { icon: 'fa-image', iconBg: 'bg-gold-primary', title: 'Criativo Atualizado', time: 'Há 5 dias', description: 'Nova imagem principal adicionada com foco em resultados naturais' },
                  { icon: 'fa-trophy', iconBg: 'bg-success', title: 'Meta de ROAS Atingida', time: 'Há 2 dias', description: 'Anúncio superou a meta de ROAS em 18%, tornando-se o melhor da campanha', isLast: true },
                ].map((activity, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full ${activity.iconBg} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                        <i className={`fa-solid ${activity.icon} ${activity.iconBg === 'bg-success' ? 'text-success' : 'text-gold-primary'} text-sm`}></i>
                      </div>
                      {!activity.isLast && <div className="w-0.5 h-full bg-border-subtle mt-2"></div>}
                    </div>
                    <div className={`flex-1 ${!activity.isLast ? 'pb-6' : ''}`}>
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-text-primary">{activity.title}</p>
                        <span className="text-xs text-text-secondary">{activity.time}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 glass-effect-light border-t border-border-subtle rounded-b-2xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 bg-dark-elevated border border-border-subtle text-text-primary rounded-lg font-medium text-sm hover:border-gold-primary hover:text-gold-primary transition-all focus-ring">
                  <i className="fa-solid fa-download mr-2"></i>
                  Exportar Dados
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={onClose}
                  className="px-5 py-2.5 bg-dark-elevated border border-border-subtle text-text-primary rounded-lg font-medium text-sm hover:border-gold-primary hover:text-gold-primary transition-all focus-ring"
                >
                  Voltar ao Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

