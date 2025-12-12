import type { 
  MetricsResponse, 
  KPIData, 
  AdData, 
  PerformanceData, 
  FunnelData,
  AudienceData 
} from '../types/metrics';

// ===================================================
// TRANSFORMADOR DA RESPOSTA DO WEBHOOK (Meta API)
// ===================================================

/**
 * Estrutura de cada item retornado pela Meta API com breakdowns
 */
export interface MetaInsightItem {
  campaign_id: string;
  campaign_name: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  impressions: string;
  reach?: string;
  frequency?: string;
  clicks: string;
  spend: string;
  cpc?: string;
  cpm?: string;
  ctr: string;
  actions?: Array<{ action_type: string; value: string }>;
  cost_per_action_type?: Array<{ action_type: string; value: string }>;
  date_start: string;
  date_stop: string;
  age?: string;
  gender?: string;
}

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
  return `${value.toFixed(1).replace('.', ',')}%`;
}

/**
 * Formata data para DD/MM
 */
function formatDateBR(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

/**
 * Extrai leads do array de actions
 */
function extractLeads(actions?: Array<{ action_type: string; value: string }>): number {
  if (!actions) return 0;
  
  const leadTypes = [
    'lead',
    'leadgen_grouped',
    'onsite_conversion.lead_grouped',
    'onsite_conversion.messaging_conversation_started_7d',
    'onsite_conversion.messaging_first_reply',
  ];
  
  let total = 0;
  for (const action of actions) {
    if (leadTypes.includes(action.action_type)) {
      total += parseInt(action.value, 10) || 0;
    }
  }
  
  return total;
}

/**
 * Transforma o array da Meta API no formato do dashboard
 */
export function transformWebhookResponse(data: MetaInsightItem[]): MetricsResponse {
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      success: false,
      error: {
        code: 'NO_DATA',
        message: 'Nenhum dado retornado da API',
      },
    };
  }
  
  // ========================================
  // 1. AGREGAR TOTAIS PARA KPIs
  // ========================================
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalSpend = 0;
  let totalLeads = 0;
  
  // Agrupar por campanha para não duplicar
  const campaignTotals = new Map<string, {
    impressions: number;
    clicks: number;
    spend: number;
    leads: number;
    name: string;
  }>();
  
  // Agrupar por data para gráficos
  const dailyTotals = new Map<string, {
    impressions: number;
    clicks: number;
    spend: number;
    leads: number;
  }>();
  
  // Agrupar por idade para audiência
  const ageTotals = new Map<string, number>();
  
  // Agrupar por gênero para audiência
  const genderTotals = { male: 0, female: 0, unknown: 0 };
  
  // Processar cada item
  for (const item of data) {
    const impressions = parseInt(item.impressions, 10) || 0;
    const clicks = parseInt(item.clicks, 10) || 0;
    const spend = parseFloat(item.spend) || 0;
    const leads = extractLeads(item.actions);
    
    // Totais gerais
    totalImpressions += impressions;
    totalClicks += clicks;
    totalSpend += spend;
    totalLeads += leads;
    
    // Por campanha
    const campaignKey = item.campaign_id;
    if (!campaignTotals.has(campaignKey)) {
      campaignTotals.set(campaignKey, {
        impressions: 0,
        clicks: 0,
        spend: 0,
        leads: 0,
        name: item.campaign_name,
      });
    }
    const campaign = campaignTotals.get(campaignKey)!;
    campaign.impressions += impressions;
    campaign.clicks += clicks;
    campaign.spend += spend;
    campaign.leads += leads;
    
    // Por data
    const dateKey = item.date_start;
    if (!dailyTotals.has(dateKey)) {
      dailyTotals.set(dateKey, {
        impressions: 0,
        clicks: 0,
        spend: 0,
        leads: 0,
      });
    }
    const daily = dailyTotals.get(dateKey)!;
    daily.impressions += impressions;
    daily.clicks += clicks;
    daily.spend += spend;
    daily.leads += leads;
    
    // Por idade
    if (item.age) {
      const currentAge = ageTotals.get(item.age) || 0;
      ageTotals.set(item.age, currentAge + impressions);
    }
    
    // Por gênero
    if (item.gender === 'male') {
      genderTotals.male += impressions;
    } else if (item.gender === 'female') {
      genderTotals.female += impressions;
    } else {
      genderTotals.unknown += impressions;
    }
  }
  
  // ========================================
  // 2. MONTAR KPIs
  // ========================================
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const appointments = Math.round(totalLeads * 0.4); // Estimativa
  const roas = totalSpend > 0 ? 4.2 : 0; // Placeholder
  
  const kpis: MetricsResponse['data']['kpis'] = {
    investment: {
      label: 'Investimento',
      value: totalSpend,
      formattedValue: formatCurrency(totalSpend),
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
    },
  };
  
  // ========================================
  // 3. MONTAR PERFORMANCE (dados diários)
  // ========================================
  const performance: PerformanceData[] = Array.from(dailyTotals.entries())
    .map(([date, totals]) => ({
      date: formatDateBR(date),
      investment: totals.spend,
      clicks: totals.clicks,
      leads: totals.leads,
      impressions: totals.impressions,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      cpl: totals.leads > 0 ? totals.spend / totals.leads : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // ========================================
  // 4. MONTAR TABELA DE CAMPANHAS/ADS
  // ========================================
  const ads: AdData[] = Array.from(campaignTotals.entries())
    .map(([id, totals]) => {
      const adCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
      const adCpl = totals.leads > 0 ? totals.spend / totals.leads : 0;
      
      return {
        id,
        name: totals.name,
        placement: 'Feed + Stories',
        status: 'active' as const,
        investment: totals.spend,
        investmentFormatted: formatCurrency(totals.spend),
        clicks: totals.clicks,
        impressions: totals.impressions,
        leads: totals.leads,
        cpl: adCpl,
        cplFormatted: formatCurrency(adCpl),
        ctr: adCtr,
        ctrFormatted: formatPercent(adCtr),
      };
    })
    .sort((a, b) => b.investment - a.investment); // Ordenar por investimento
  
  // ========================================
  // 5. MONTAR FUNIL
  // ========================================
  const funnel: FunnelData = {
    impressions: totalImpressions,
    clicks: totalClicks,
    leads: totalLeads,
    appointments,
    conversions: Math.round(appointments * 0.3),
  };
  
  // ========================================
  // 6. MONTAR AUDIÊNCIA
  // ========================================
  const totalGender = genderTotals.male + genderTotals.female + genderTotals.unknown;
  const totalAge = Array.from(ageTotals.values()).reduce((a, b) => a + b, 0);
  
  const audience: AudienceData = {
    demographics: {
      gender: {
        male: totalGender > 0 ? (genderTotals.male / totalGender) * 100 : 0,
        female: totalGender > 0 ? (genderTotals.female / totalGender) * 100 : 0,
        other: totalGender > 0 ? (genderTotals.unknown / totalGender) * 100 : 0,
      },
      ageRanges: Array.from(ageTotals.entries())
        .map(([range, count]) => ({
          range,
          percentage: totalAge > 0 ? (count / totalAge) * 100 : 0,
        }))
        .sort((a, b) => {
          // Ordenar por faixa etária
          const getStartAge = (r: string) => parseInt(r.split('-')[0]) || 0;
          return getStartAge(a.range) - getStartAge(b.range);
        }),
      locations: [],
    },
    devices: {
      mobile: 70,
      desktop: 25,
      tablet: 5,
    },
    bestHours: [],
    bestDays: [],
  };
  
  // ========================================
  // 7. MONTAR RESPOSTA FINAL
  // ========================================
  
  // Encontrar período
  const dates = data.map(d => d.date_start).filter(Boolean).sort();
  const periodStart = dates[0] || '';
  const periodEnd = dates[dates.length - 1] || '';
  
  return {
    success: true,
    data: {
      kpis,
      performance,
      ads,
      funnel,
      audience,
      insights: [
        {
          id: 'total-campaigns',
          type: 'info',
          icon: 'fa-solid fa-bullhorn',
          title: `${campaignTotals.size} campanhas ativas`,
          description: `Analisando dados de ${formatDateBR(periodStart)} a ${formatDateBR(periodEnd)}`,
        },
      ],
    },
    meta: {
      periodStart,
      periodEnd,
      totalCampaigns: campaignTotals.size,
      totalAds: ads.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

