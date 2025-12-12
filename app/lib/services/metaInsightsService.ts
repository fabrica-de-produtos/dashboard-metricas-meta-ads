import type { 
  MetaInsightsParams, 
  MetaInsightsResponse, 
  MetaInsightData,
  MetaDatePreset,
  MetaTimeRange,
  MetaBreakdown,
  MetaInsightsLevel
} from '../types/meta-api';
import type { MetricsRequest, MetricPeriod } from '../types/metrics';

// ===================================================
// SERVIÇO DE INTEGRAÇÃO COM META MARKETING API
// ===================================================

/**
 * Versão da API do Graph Facebook/Meta
 */
const META_API_VERSION = 'v21.0';
const META_GRAPH_URL = 'https://graph.facebook.com';

/**
 * Campos padrão para buscar em todas as requisições
 * Inclui todos os campos necessários para o dashboard
 */
const BASE_FIELDS = [
  'campaign_id',
  'campaign_name',
  'adset_id',
  'adset_name',
  'ad_id',
  'ad_name',
  'impressions',
  'reach',
  'frequency',
  'clicks',
  'spend',
  'cpc',
  'cpm',
  'ctr',
  'actions',
  'cost_per_action_type',
];

/**
 * Campos para breakdowns de audiência
 */
const AUDIENCE_BREAKDOWNS: MetaBreakdown[] = ['age', 'gender'];

/**
 * Limite padrão de resultados
 */
const DEFAULT_LIMIT = 500;

/**
 * Período padrão: ano de 2024 inteiro
 */
const DEFAULT_TIME_RANGE: MetaTimeRange = {
  since: '2024-01-01',
  until: '2024-12-31',
};

/**
 * Mapeamento de período da nossa aplicação para date_preset da Meta
 * null = usar time_range customizado
 */
const PERIOD_TO_DATE_PRESET: Record<MetricPeriod, MetaDatePreset | null> = {
  'today': 'today',
  'yesterday': 'yesterday',
  'last7': 'last_7d',
  'last30': 'last_30d',
  'thisMonth': 'this_month',
  'lastMonth': 'last_month',
  'custom': null, // Usa time_range em vez de date_preset
};

/**
 * Mapeamento para calcular período anterior (para comparação)
 */
const COMPARISON_PERIODS: Record<MetricPeriod, { days: number } | 'special'> = {
  'today': { days: 1 },
  'yesterday': { days: 1 },
  'last7': { days: 7 },
  'last30': { days: 30 },
  'thisMonth': 'special',
  'lastMonth': 'special',
  'custom': 'special',
};

// ===================================================
// FUNÇÕES DE MAPEAMENTO
// ===================================================

/**
 * Converte o período da nossa aplicação para os parâmetros da Meta API
 * Por padrão usa o ano de 2024 inteiro, quando usuário seleciona período específico usa date_preset
 */
export function mapPeriodToMetaParams(
  period?: MetricPeriod,
  customPeriod?: { startDate: string; endDate: string }
): { datePreset?: MetaDatePreset; timeRange?: MetaTimeRange } {
  
  // Se não tiver período definido, usa 2024 inteiro
  if (!period) {
    return { timeRange: DEFAULT_TIME_RANGE };
  }
  
  // Período customizado
  if (period === 'custom' && customPeriod) {
    return {
      timeRange: {
        since: customPeriod.startDate,
        until: customPeriod.endDate,
      },
    };
  }
  
  // Mapear para date_preset da Meta
  const datePreset = PERIOD_TO_DATE_PRESET[period];
  
  if (datePreset) {
    return { datePreset };
  }
  
  // Fallback para 2024 inteiro se período inválido
  return { timeRange: DEFAULT_TIME_RANGE };
}

/**
 * Calcula o período anterior para comparação
 */
export function calculatePreviousPeriod(
  period: MetricPeriod,
  customPeriod?: { startDate: string; endDate: string }
): MetaTimeRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  switch (period) {
    case 'today': {
      // Comparação: ontem
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { since: formatDate(yesterday), until: formatDate(yesterday) };
    }
    
    case 'yesterday': {
      // Comparação: anteontem
      const dayBefore = new Date(today);
      dayBefore.setDate(dayBefore.getDate() - 2);
      return { since: formatDate(dayBefore), until: formatDate(dayBefore) };
    }
    
    case 'last7': {
      // Comparação: 7 dias anteriores aos últimos 7
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() - 8); // Dia antes dos últimos 7
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6); // 7 dias antes
      return { since: formatDate(startDate), until: formatDate(endDate) };
    }
    
    case 'last30': {
      // Comparação: 30 dias anteriores aos últimos 30
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() - 31);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 29);
      return { since: formatDate(startDate), until: formatDate(endDate) };
    }
    
    case 'thisMonth': {
      // Comparação: mês anterior
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return { since: formatDate(lastMonth), until: formatDate(lastMonthEnd) };
    }
    
    case 'lastMonth': {
      // Comparação: 2 meses atrás
      const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      const twoMonthsAgoEnd = new Date(today.getFullYear(), today.getMonth() - 1, 0);
      return { since: formatDate(twoMonthsAgo), until: formatDate(twoMonthsAgoEnd) };
    }
    
    case 'custom': {
      if (customPeriod) {
        const start = new Date(customPeriod.startDate);
        const end = new Date(customPeriod.endDate);
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        const prevEnd = new Date(start);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - diffDays);
        
        return { since: formatDate(prevStart), until: formatDate(prevEnd) };
      }
      // Fallback
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { since: formatDate(yesterday), until: formatDate(yesterday) };
    }
    
    default:
      const yesterdayDefault = new Date(today);
      yesterdayDefault.setDate(yesterdayDefault.getDate() - 1);
      return { since: formatDate(yesterdayDefault), until: formatDate(yesterdayDefault) };
  }
}

/**
 * Constrói os parâmetros completos para a chamada à Meta Insights API
 * a partir do body recebido do nosso webhook
 * 
 * Formato de saída compatível com a Meta API:
 * {
 *   "level": "campaign",
 *   "fields": "campaign_id,campaign_name,...",
 *   "date_preset": "last_7d" | "time_range": {"since":"2024-01-01","until":"2024-12-31"},
 *   "time_increment": 1,
 *   "breakdowns": "age,gender",
 *   "limit": 500
 * }
 */
export function buildMetaInsightsParams(
  body: MetricsRequest,
  adAccountId: string,
  accessToken: string,
  options?: {
    level?: MetaInsightsLevel;
    includeAudienceBreakdowns?: boolean;
  }
): MetaInsightsParams {
  
  const level = options?.level || 'campaign';
  
  // Usar todos os campos padrão (já inclui ad_id, adset_id, etc.)
  const fields = [...BASE_FIELDS];
  
  // Mapear período (padrão: 2024 inteiro)
  const periodParams = mapPeriodToMetaParams(body.period, body.customPeriod);
  
  // Breakdowns para audiência
  const breakdowns = options?.includeAudienceBreakdowns ? AUDIENCE_BREAKDOWNS : undefined;
  
  return {
    adAccountId,
    accessToken,
    level,
    fields,
    breakdowns,
    timeIncrement: 1, // Dados diários para gráficos
    limit: DEFAULT_LIMIT,
    ...periodParams,
  };
}

/**
 * Gera o objeto de parâmetros no formato exato que a Meta API espera
 * Útil para usar diretamente no n8n ou em chamadas HTTP
 */
export function buildMetaRequestBody(
  period?: MetricPeriod,
  customPeriod?: { startDate: string; endDate: string },
  includeAudience?: boolean
): Record<string, unknown> {
  
  const periodParams = mapPeriodToMetaParams(period, customPeriod);
  
  const params: Record<string, unknown> = {
    level: 'campaign',
    fields: BASE_FIELDS.join(','),
    time_increment: 1,
    limit: DEFAULT_LIMIT,
  };
  
  // Adicionar período
  if (periodParams.datePreset) {
    params.date_preset = periodParams.datePreset;
  } else if (periodParams.timeRange) {
    params.time_range = periodParams.timeRange;
  }
  
  // Adicionar breakdowns se audiência solicitada
  if (includeAudience) {
    params.breakdowns = AUDIENCE_BREAKDOWNS.join(',');
  }
  
  return params;
}

// ===================================================
// FUNÇÕES DE CHAMADA À API
// ===================================================

/**
 * Monta a URL de chamada para a Meta Insights API
 */
function buildInsightsUrl(params: MetaInsightsParams): string {
  const { adAccountId, accessToken, level, fields, datePreset, timeRange, timeIncrement, breakdowns, limit } = params;
  
  const baseUrl = `${META_GRAPH_URL}/${META_API_VERSION}/act_${adAccountId}/insights`;
  
  const queryParams = new URLSearchParams();
  queryParams.set('access_token', accessToken);
  queryParams.set('level', level);
  queryParams.set('fields', fields.join(','));
  
  // Período: usar datePreset OU timeRange, nunca ambos
  if (timeRange) {
    queryParams.set('time_range', JSON.stringify(timeRange));
  } else if (datePreset) {
    queryParams.set('date_preset', datePreset);
  }
  
  if (timeIncrement) {
    queryParams.set('time_increment', String(timeIncrement));
  }
  
  if (breakdowns && breakdowns.length > 0) {
    queryParams.set('breakdowns', breakdowns.join(','));
  }
  
  if (limit) {
    queryParams.set('limit', String(limit));
  }
  
  return `${baseUrl}?${queryParams.toString()}`;
}

/**
 * Faz uma chamada à Meta Insights API
 */
async function callMetaInsightsApi(params: MetaInsightsParams): Promise<MetaInsightsResponse> {
  const url = buildInsightsUrl(params);
  
  console.log('📊 [Meta API] Chamando:', url.replace(params.accessToken, '***TOKEN***'));
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data: MetaInsightsResponse = await response.json();
    
    if (data.error) {
      console.error('❌ [Meta API] Erro:', data.error);
      throw new Error(`Meta API Error: ${data.error.message}`);
    }
    
    console.log('✅ [Meta API] Sucesso:', data.data?.length || 0, 'registros');
    
    return data;
    
  } catch (error) {
    console.error('❌ [Meta API] Erro na requisição:', error);
    throw error;
  }
}

/**
 * Busca todas as páginas de resultados (paginação)
 */
async function fetchAllPages(params: MetaInsightsParams): Promise<MetaInsightData[]> {
  const allData: MetaInsightData[] = [];
  let nextUrl: string | undefined = buildInsightsUrl(params);
  
  while (nextUrl) {
    const response = await fetch(nextUrl);
    const data: MetaInsightsResponse = await response.json();
    
    if (data.error) {
      throw new Error(`Meta API Error: ${data.error.message}`);
    }
    
    if (data.data) {
      allData.push(...data.data);
    }
    
    nextUrl = data.paging?.next;
  }
  
  return allData;
}

// ===================================================
// FUNÇÃO PRINCIPAL DE BUSCA DE MÉTRICAS
// ===================================================

export interface ProcessedMetrics {
  current: {
    campaigns: MetaInsightData[];
    ads?: MetaInsightData[];
    audience?: MetaInsightData[];
  };
  previous?: {
    campaigns: MetaInsightData[];
    ads?: MetaInsightData[];
  };
  comparison?: {
    impressionsChange: number;
    clicksChange: number;
    spendChange: number;
    ctrChange: number;
    cpcChange: number;
  };
  meta: {
    periodStart: string;
    periodEnd: string;
    generatedAt: string;
    totalCampaigns: number;
    totalAds: number;
  };
}

/**
 * Processa o request do nosso webhook e busca dados da Meta API
 * Esta é a função principal que deve ser chamada pelo webhook
 */
export async function fetchMetaInsights(
  body: MetricsRequest,
  adAccountId: string,
  accessToken: string
): Promise<ProcessedMetrics> {
  
  const { period, customPeriod, includeAds, includeAudience, includeComparison } = body;
  
  // Verificar se deve buscar insights
  if (body.includeInsights === false) {
    throw new Error('includeInsights está desabilitado');
  }
  
  const result: ProcessedMetrics = {
    current: {
      campaigns: [],
    },
    meta: {
      periodStart: '',
      periodEnd: '',
      generatedAt: new Date().toISOString(),
      totalCampaigns: 0,
      totalAds: 0,
    },
  };
  
  // 1. Buscar dados de campanhas (nível campaign)
  const campaignParams = buildMetaInsightsParams(body, adAccountId, accessToken, {
    level: 'campaign',
  });
  
  const campaignResponse = await callMetaInsightsApi(campaignParams);
  result.current.campaigns = campaignResponse.data || [];
  result.meta.totalCampaigns = result.current.campaigns.length;
  
  // Extrair período
  if (result.current.campaigns.length > 0) {
    const firstRecord = result.current.campaigns[0];
    result.meta.periodStart = firstRecord.date_start || '';
    result.meta.periodEnd = firstRecord.date_stop || '';
  }
  
  // 2. Buscar dados de anúncios (nível ad) se solicitado
  if (includeAds) {
    const adParams = buildMetaInsightsParams(body, adAccountId, accessToken, {
      level: 'ad',
    });
    
    const adResponse = await callMetaInsightsApi(adParams);
    result.current.ads = adResponse.data || [];
    result.meta.totalAds = result.current.ads.length;
  }
  
  // 3. Buscar dados de audiência (com breakdowns) se solicitado
  if (includeAudience) {
    const audienceParams = buildMetaInsightsParams(body, adAccountId, accessToken, {
      level: 'campaign',
      includeAudienceBreakdowns: true,
    });
    
    // Remover time_increment para audiência (não faz sentido diário com breakdowns)
    delete (audienceParams as Record<string, unknown>).timeIncrement;
    
    const audienceResponse = await callMetaInsightsApi(audienceParams);
    result.current.audience = audienceResponse.data || [];
  }
  
  // 4. Buscar dados do período anterior para comparação
  if (includeComparison) {
    const previousPeriod = calculatePreviousPeriod(period, customPeriod);
    
    // Campanhas do período anterior
    const prevCampaignParams: MetaInsightsParams = {
      adAccountId,
      accessToken,
      level: 'campaign',
      fields: BASE_FIELDS,
      timeRange: previousPeriod,
    };
    
    const prevCampaignResponse = await callMetaInsightsApi(prevCampaignParams);
    result.previous = {
      campaigns: prevCampaignResponse.data || [],
    };
    
    // Anúncios do período anterior (se solicitado)
    if (includeAds) {
      const prevAdParams: MetaInsightsParams = {
        adAccountId,
        accessToken,
        level: 'ad',
        fields: BASE_FIELDS,
        timeRange: previousPeriod,
        limit: DEFAULT_LIMIT,
      };
      
      const prevAdResponse = await callMetaInsightsApi(prevAdParams);
      result.previous.ads = prevAdResponse.data || [];
    }
    
    // Calcular variações
    result.comparison = calculateComparison(
      result.current.campaigns,
      result.previous.campaigns
    );
  }
  
  return result;
}

/**
 * Calcula as variações entre período atual e anterior
 */
function calculateComparison(
  current: MetaInsightData[],
  previous: MetaInsightData[]
): ProcessedMetrics['comparison'] {
  
  const sumMetric = (data: MetaInsightData[], field: keyof MetaInsightData): number => {
    return data.reduce((sum, item) => {
      const value = item[field];
      return sum + (typeof value === 'string' ? parseFloat(value) || 0 : 0);
    }, 0);
  };
  
  const calcChange = (currentVal: number, previousVal: number): number => {
    if (previousVal === 0) return currentVal > 0 ? 100 : 0;
    return ((currentVal - previousVal) / previousVal) * 100;
  };
  
  const currentImpressions = sumMetric(current, 'impressions');
  const previousImpressions = sumMetric(previous, 'impressions');
  
  const currentClicks = sumMetric(current, 'clicks');
  const previousClicks = sumMetric(previous, 'clicks');
  
  const currentSpend = sumMetric(current, 'spend');
  const previousSpend = sumMetric(previous, 'spend');
  
  const currentCtr = currentImpressions > 0 ? (currentClicks / currentImpressions) * 100 : 0;
  const previousCtr = previousImpressions > 0 ? (previousClicks / previousImpressions) * 100 : 0;
  
  const currentCpc = currentClicks > 0 ? currentSpend / currentClicks : 0;
  const previousCpc = previousClicks > 0 ? previousSpend / previousClicks : 0;
  
  return {
    impressionsChange: calcChange(currentImpressions, previousImpressions),
    clicksChange: calcChange(currentClicks, previousClicks),
    spendChange: calcChange(currentSpend, previousSpend),
    ctrChange: calcChange(currentCtr, previousCtr),
    cpcChange: calcChange(currentCpc, previousCpc),
  };
}

/**
 * Extrai leads e conversões do array de actions
 */
export function extractLeadsFromActions(actions?: MetaAction[]): number {
  if (!actions) return 0;
  
  const leadAction = actions.find(a => 
    a.action_type === 'lead' || 
    a.action_type === 'leadgen_grouped' ||
    a.action_type === 'onsite_conversion.lead_grouped'
  );
  
  return leadAction ? parseInt(leadAction.value, 10) || 0 : 0;
}

/**
 * Extrai custo por lead do array de cost_per_action_type
 */
export function extractCostPerLead(costPerAction?: MetaCostPerAction[]): number {
  if (!costPerAction) return 0;
  
  const cplAction = costPerAction.find(a => 
    a.action_type === 'lead' || 
    a.action_type === 'leadgen_grouped' ||
    a.action_type === 'onsite_conversion.lead_grouped'
  );
  
  return cplAction ? parseFloat(cplAction.value) || 0 : 0;
}

// Re-export types para facilitar importação
export type { MetaAction, MetaCostPerAction } from '../types/meta-api';

