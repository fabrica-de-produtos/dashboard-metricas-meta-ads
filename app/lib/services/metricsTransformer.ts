import type { 
  MetricsResponse, 
  KPIData, 
  AdData, 
  PerformanceData, 
  FunnelData,
  InsightData,
  AudienceData 
} from '../types/metrics';
import type { MetaInsightData } from '../types/meta-api';
import { 
  ProcessedMetrics, 
  extractLeadsFromActions, 
  extractCostPerLead 
} from './metaInsightsService';

// ===================================================
// TRANSFORMADOR DE DADOS DA META API PARA NOSSO FORMATO
// ===================================================

/**
 * Formata valor monetário em BRL
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata número com separador de milhar
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(Math.round(value));
}

/**
 * Formata percentual
 */
function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Soma uma métrica de todos os registros
 */
function sumMetric(data: MetaInsightData[], field: keyof MetaInsightData): number {
  return data.reduce((sum, item) => {
    const value = item[field];
    return sum + (typeof value === 'string' ? parseFloat(value) || 0 : 0);
  }, 0);
}

/**
 * Soma leads de todos os registros
 */
function sumLeads(data: MetaInsightData[]): number {
  return data.reduce((sum, item) => sum + extractLeadsFromActions(item.actions), 0);
}

/**
 * Transforma os dados da Meta API no formato de KPIs do nosso dashboard
 */
function transformToKPIs(
  metaData: ProcessedMetrics
): MetricsResponse['data']['kpis'] {
  
  const campaigns = metaData.current.campaigns;
  const comparison = metaData.comparison;
  
  // Calcular totais
  const totalSpend = sumMetric(campaigns, 'spend');
  const totalClicks = sumMetric(campaigns, 'clicks');
  const totalImpressions = sumMetric(campaigns, 'impressions');
  const totalReach = sumMetric(campaigns, 'reach');
  const totalLeads = sumLeads(campaigns);
  
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  
  // Calcular agendamentos (assumindo que é uma ação específica)
  // Por enquanto, estimamos como 40% dos leads
  const appointments = Math.round(totalLeads * 0.4);
  
  // Calcular ROAS (precisa de dados de valor de conversão)
  // Por enquanto, usamos um placeholder
  const roas = totalSpend > 0 ? 4.2 : 0;
  
  return {
    investment: {
      label: 'Investimento',
      value: totalSpend,
      formattedValue: formatCurrency(totalSpend),
      trend: comparison ? {
        direction: comparison.spendChange >= 0 ? 'up' : 'down',
        value: `${comparison.spendChange >= 0 ? '+' : ''}${comparison.spendChange.toFixed(0)}%`,
        label: 'vs período anterior',
      } : undefined,
    },
    clicks: {
      label: 'Cliques',
      value: totalClicks,
      formattedValue: formatNumber(totalClicks),
      subtitle: `CTR ${formatPercent(ctr)}`,
    },
    leads: {
      label: 'Leads',
      value: totalLeads,
      formattedValue: formatNumber(totalLeads),
      subtitle: 'Form + WhatsApp',
    },
    cpl: {
      label: 'Custo por Lead',
      value: cpl,
      formattedValue: formatCurrency(cpl),
      trend: comparison ? {
        direction: comparison.cpcChange <= 0 ? 'down' : 'up', // Menor CPL é melhor
        value: `${comparison.cpcChange <= 0 ? '' : '+'}${comparison.cpcChange.toFixed(0)}%`,
        label: 'vs anterior',
      } : undefined,
    },
    appointments: {
      label: 'Agendamentos',
      value: appointments,
      formattedValue: formatNumber(appointments),
      subtitle: `Taxa ${totalLeads > 0 ? Math.round((appointments / totalLeads) * 100) : 0}%`,
    },
    roas: {
      label: 'ROAS',
      value: roas,
      formattedValue: roas.toFixed(1),
      trend: {
        direction: 'up',
        value: 'Acima da meta',
      },
    },
  };
}

/**
 * Transforma dados de anúncios da Meta para nosso formato
 */
function transformToAds(metaData: ProcessedMetrics): AdData[] {
  const ads = metaData.current.ads || [];
  
  return ads.map(ad => {
    const spend = parseFloat(ad.spend || '0');
    const clicks = parseInt(ad.clicks || '0', 10);
    const impressions = parseInt(ad.impressions || '0', 10);
    const leads = extractLeadsFromActions(ad.actions);
    const cpl = leads > 0 ? spend / leads : 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    
    return {
      id: ad.ad_id || '',
      name: ad.ad_name || 'Sem nome',
      placement: 'Feed + Stories', // Meta não retorna diretamente, precisaria de breakdown
      status: 'active' as const, // Precisaria verificar status real
      investment: spend,
      investmentFormatted: formatCurrency(spend),
      clicks,
      impressions,
      leads,
      cpl,
      cplFormatted: formatCurrency(cpl),
      ctr,
      ctrFormatted: formatPercent(ctr),
    };
  });
}

/**
 * Transforma dados para formato de performance (gráficos)
 */
function transformToPerformance(metaData: ProcessedMetrics): PerformanceData[] {
  // Agregar dados diários
  const campaigns = metaData.current.campaigns;
  
  // Agrupar por data
  const byDate = new Map<string, MetaInsightData[]>();
  
  campaigns.forEach(campaign => {
    const date = campaign.date_start || '';
    if (!byDate.has(date)) {
      byDate.set(date, []);
    }
    byDate.get(date)!.push(campaign);
  });
  
  return Array.from(byDate.entries())
    .map(([date, data]) => {
      const spend = sumMetric(data, 'spend');
      const clicks = sumMetric(data, 'clicks');
      const impressions = sumMetric(data, 'impressions');
      const leads = sumLeads(data);
      
      return {
        date: formatDateBR(date),
        investment: spend,
        clicks,
        leads,
        impressions,
        ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
        cpl: leads > 0 ? spend / leads : 0,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Formata data para formato brasileiro
 */
function formatDateBR(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

/**
 * Transforma dados de audiência
 */
function transformToAudience(metaData: ProcessedMetrics): AudienceData | undefined {
  const audienceData = metaData.current.audience;
  if (!audienceData || audienceData.length === 0) return undefined;
  
  // Agrupar por gênero
  const genderTotals = { male: 0, female: 0, other: 0 };
  const ageTotals = new Map<string, number>();
  
  audienceData.forEach(item => {
    const impressions = parseInt(item.impressions || '0', 10);
    
    // Gênero
    if (item.gender === 'male') genderTotals.male += impressions;
    else if (item.gender === 'female') genderTotals.female += impressions;
    else genderTotals.other += impressions;
    
    // Idade
    if (item.age) {
      const current = ageTotals.get(item.age) || 0;
      ageTotals.set(item.age, current + impressions);
    }
  });
  
  const totalGender = genderTotals.male + genderTotals.female + genderTotals.other;
  const totalAge = Array.from(ageTotals.values()).reduce((a, b) => a + b, 0);
  
  return {
    demographics: {
      gender: {
        male: totalGender > 0 ? (genderTotals.male / totalGender) * 100 : 0,
        female: totalGender > 0 ? (genderTotals.female / totalGender) * 100 : 0,
        other: totalGender > 0 ? (genderTotals.other / totalGender) * 100 : 0,
      },
      ageRanges: Array.from(ageTotals.entries()).map(([range, count]) => ({
        range,
        percentage: totalAge > 0 ? (count / totalAge) * 100 : 0,
      })),
      locations: [], // Precisaria de breakdown por região
    },
    devices: {
      mobile: 70, // Placeholder - precisaria de breakdown
      desktop: 25,
      tablet: 5,
    },
    bestHours: [], // Precisaria de breakdown por hora
    bestDays: [],  // Precisaria de breakdown por dia da semana
  };
}

/**
 * Cria dados do funil de conversão
 */
function transformToFunnel(metaData: ProcessedMetrics): FunnelData {
  const campaigns = metaData.current.campaigns;
  
  const impressions = sumMetric(campaigns, 'impressions');
  const clicks = sumMetric(campaigns, 'clicks');
  const leads = sumLeads(campaigns);
  const appointments = Math.round(leads * 0.4);
  const conversions = Math.round(appointments * 0.3);
  
  return {
    impressions,
    clicks,
    leads,
    appointments,
    conversions,
  };
}

/**
 * Gera insights baseados nos dados
 */
function generateInsights(metaData: ProcessedMetrics): InsightData[] {
  const insights: InsightData[] = [];
  const comparison = metaData.comparison;
  
  if (comparison) {
    // Insight sobre CTR
    if (comparison.ctrChange > 10) {
      insights.push({
        id: 'ctr-up',
        type: 'success',
        icon: 'fa-solid fa-arrow-trend-up',
        title: 'CTR em alta!',
        description: `Sua taxa de cliques aumentou ${comparison.ctrChange.toFixed(0)}% em relação ao período anterior.`,
        priority: 1,
      });
    } else if (comparison.ctrChange < -10) {
      insights.push({
        id: 'ctr-down',
        type: 'warning',
        icon: 'fa-solid fa-arrow-trend-down',
        title: 'CTR em queda',
        description: `Sua taxa de cliques caiu ${Math.abs(comparison.ctrChange).toFixed(0)}%. Considere revisar os criativos.`,
        priority: 1,
      });
    }
    
    // Insight sobre CPC
    if (comparison.cpcChange < -10) {
      insights.push({
        id: 'cpc-down',
        type: 'success',
        icon: 'fa-solid fa-coins',
        title: 'Custo por clique reduzido',
        description: `Seu CPC diminuiu ${Math.abs(comparison.cpcChange).toFixed(0)}%, ótima eficiência!`,
        priority: 2,
      });
    }
    
    // Insight sobre investimento
    if (comparison.spendChange > 20) {
      insights.push({
        id: 'spend-up',
        type: 'info',
        icon: 'fa-solid fa-chart-line',
        title: 'Investimento aumentado',
        description: `O investimento cresceu ${comparison.spendChange.toFixed(0)}% neste período.`,
        priority: 3,
      });
    }
  }
  
  // Insight padrão se não houver outros
  if (insights.length === 0) {
    insights.push({
      id: 'default',
      type: 'tip',
      icon: 'fa-solid fa-lightbulb',
      title: 'Continue monitorando',
      description: 'Acompanhe suas métricas diariamente para identificar oportunidades de otimização.',
      priority: 5,
    });
  }
  
  return insights.sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

/**
 * Função principal: transforma dados da Meta API no formato do nosso dashboard
 */
export function transformMetaDataToResponse(
  metaData: ProcessedMetrics
): MetricsResponse {
  
  return {
    success: true,
    data: {
      kpis: transformToKPIs(metaData),
      performance: transformToPerformance(metaData),
      ads: transformToAds(metaData),
      funnel: transformToFunnel(metaData),
      insights: generateInsights(metaData),
      audience: transformToAudience(metaData),
      comparison: metaData.comparison ? {
        investmentChange: metaData.comparison.spendChange,
        clicksChange: metaData.comparison.clicksChange,
        leadsChange: 0, // Precisaria calcular
        cplChange: metaData.comparison.cpcChange,
      } : undefined,
    },
    meta: {
      periodStart: metaData.meta.periodStart,
      periodEnd: metaData.meta.periodEnd,
      totalCampaigns: metaData.meta.totalCampaigns,
      totalAds: metaData.meta.totalAds,
      generatedAt: metaData.meta.generatedAt,
    },
  };
}

