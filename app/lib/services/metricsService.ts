import type { 
  MetricsResponse, 
  MetricPeriod 
} from '../types/metrics';
import { transformWebhookResponse, MetaInsightItem } from './webhookResponseTransformer';

// ===================================================
// SERVIÇO DE BUSCA DE MÉTRICAS
// ===================================================

/**
 * URLs disponíveis para buscar métricas
 * - LOCAL: usa a API route interna que processa e chama a Meta API
 * - WEBHOOK: envia para o n8n que faz o processamento externo
 */
const ENDPOINTS = {
  // API local - processa internamente (requer adAccountId e accessToken no body)
  LOCAL: '/api/metrics',
  // Webhook n8n - processamento externo (n8n adiciona as credenciais)
  WEBHOOK: 'https://n8nultraintelligentv3webhook.ultraintelligentv3.com/webhook/buscar-metricas',
};

/**
 * Define qual endpoint usar
 * Por padrão usa o WEBHOOK do n8n (que adiciona as credenciais fixas)
 * Para usar a API local, defina NEXT_PUBLIC_USE_LOCAL_METRICS_API=true
 */
const USE_LOCAL_API = process.env.NEXT_PUBLIC_USE_LOCAL_METRICS_API === 'true';

/**
 * URL ativa para buscar métricas
 */
const METRICS_URL = USE_LOCAL_API ? ENDPOINTS.LOCAL : ENDPOINTS.WEBHOOK;

/**
 * Campos padrão para a Meta API
 */
const META_FIELDS = [
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
].join(',');

/**
 * Período padrão: ano de 2024 inteiro
 */
const DEFAULT_TIME_RANGE = {
  since: '2024-01-01',
  until: '2024-12-31',
};

/**
 * Mapeamento de período para date_preset da Meta
 */
const PERIOD_TO_DATE_PRESET: Record<MetricPeriod, string | null> = {
  'today': 'today',
  'yesterday': 'yesterday',
  'last7': 'last_7d',
  'last30': 'last_30d',
  'thisMonth': 'this_month',
  'lastMonth': 'last_month',
  'custom': null,
};

/**
 * Interface do body no formato da Meta API
 */
interface MetaApiRequestBody {
  level: string;
  fields: string;
  date_preset?: string;
  time_range?: { since: string; until: string };
  time_increment: number;
  breakdowns?: string;
  limit: number;
}

/**
 * Constrói o objeto de request no formato da Meta API
 */
export function buildMetricsRequest(
  userId: string,
  period?: MetricPeriod,
  options?: {
    customPeriod?: { startDate: string; endDate: string };
    includeAudience?: boolean;
  }
): MetaApiRequestBody {
  
  const request: MetaApiRequestBody = {
    level: 'campaign',
    fields: META_FIELDS,
    time_increment: 1,
    limit: 500,
  };
  
  // Definir período
  if (period && period !== 'custom') {
    const datePreset = PERIOD_TO_DATE_PRESET[period];
    if (datePreset) {
      request.date_preset = datePreset;
    }
  } else if (period === 'custom' && options?.customPeriod) {
    request.time_range = {
      since: options.customPeriod.startDate,
      until: options.customPeriod.endDate,
    };
  } else {
    // Padrão: 2024 inteiro
    request.time_range = DEFAULT_TIME_RANGE;
  }
  
  // Adicionar breakdowns se audiência solicitada
  if (options?.includeAudience) {
    request.breakdowns = 'age,gender';
  }
  
  return request;
}

/**
 * Exemplo de JSON padrão para referência
 * Este é o formato que será enviado no body do webhook (formato Meta API)
 */
export const EXAMPLE_REQUEST: MetaApiRequestBody = {
  level: "campaign",
  fields: "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,reach,frequency,clicks,spend,cpc,cpm,ctr,actions,cost_per_action_type",
  time_range: {
    since: "2024-01-01",
    until: "2024-12-31"
  },
  time_increment: 1,
  limit: 500
};

/**
 * Exemplo com filtro de período
 */
export const EXAMPLE_REQUEST_WITH_PERIOD: MetaApiRequestBody = {
  level: "campaign",
  fields: "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,reach,frequency,clicks,spend,cpc,cpm,ctr,actions,cost_per_action_type",
  date_preset: "last_7d",
  time_increment: 1,
  limit: 500
};

/**
 * Exemplo com breakdowns de audiência
 */
export const EXAMPLE_REQUEST_WITH_AUDIENCE: MetaApiRequestBody = {
  level: "campaign",
  fields: "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,impressions,reach,frequency,clicks,spend,cpc,cpm,ctr,actions,cost_per_action_type",
  time_range: {
    since: "2024-01-01",
    until: "2024-12-31"
  },
  time_increment: 1,
  breakdowns: "age,gender",
  limit: 500
};

/**
 * Busca métricas do webhook n8n
 * 
 * @param request - Objeto com os parâmetros no formato da Meta API
 * @returns Promise com a resposta do webhook
 * 
 * @example
 * const request = buildMetricsRequest(userId, 'last7');
 * const response = await fetchMetrics(request);
 */
export async function fetchMetrics(request: MetaApiRequestBody): Promise<MetricsResponse> {
  try {
    console.log(`📊 [Metrics] Buscando de: ${USE_LOCAL_API ? 'API Local' : 'Webhook N8N'}`);
    console.log('📤 [Metrics] Body enviado:', JSON.stringify(request, null, 2));
    
    const response = await fetch(METRICS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();
    
    // ========================================
    // 📥 LOG DA RESPOSTA DO WEBHOOK
    // ========================================
    console.log('📥 [Metrics] Resposta bruta do webhook:', rawData);
    console.log('📥 [Metrics] Total de itens:', Array.isArray(rawData) ? rawData.length : 'N/A');
    // ========================================
    
    // Transformar dados da Meta API para o formato do dashboard
    let transformedData: MetricsResponse;
    
    if (Array.isArray(rawData)) {
      // Resposta é um array direto da Meta API
      console.log('🔄 [Metrics] Transformando array da Meta API...');
      transformedData = transformWebhookResponse(rawData as MetaInsightItem[]);
    } else if (rawData.data && Array.isArray(rawData.data)) {
      // Resposta tem estrutura { data: [...] }
      console.log('🔄 [Metrics] Transformando resposta com data array...');
      transformedData = transformWebhookResponse(rawData.data as MetaInsightItem[]);
    } else if (rawData.success !== undefined) {
      // Já está no formato correto
      console.log('✅ [Metrics] Resposta já no formato correto');
      transformedData = rawData;
    } else {
      // Formato desconhecido
      console.error('❌ [Metrics] Formato de resposta desconhecido:', rawData);
      transformedData = {
        success: false,
        error: {
          code: 'UNKNOWN_FORMAT',
          message: 'Formato de resposta desconhecido',
        },
      };
    }
    
    console.log('✅ [Metrics] Dados transformados:', transformedData);
    
    return transformedData;
    
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    
    return {
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Não foi possível conectar ao servidor de métricas',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
    };
  }
}

/**
 * Busca métricas com parâmetros simplificados
 * 
 * @example
 * const response = await getMetrics('last7');
 */
export async function getMetrics(
  period?: MetricPeriod,
  includeAudience?: boolean
): Promise<MetricsResponse> {
  const request = buildMetricsRequest('', period, { includeAudience });
  return fetchMetrics(request);
}

/**
 * Busca métricas de hoje
 */
export async function getTodayMetrics(): Promise<MetricsResponse> {
  return getMetrics('today');
}

/**
 * Busca métricas dos últimos 7 dias
 */
export async function getWeekMetrics(): Promise<MetricsResponse> {
  return getMetrics('last7');
}

/**
 * Busca métricas dos últimos 30 dias
 */
export async function getMonthMetrics(): Promise<MetricsResponse> {
  return getMetrics('last30');
}

/**
 * Busca métricas de 2024 inteiro (padrão)
 */
export async function getYearMetrics(): Promise<MetricsResponse> {
  return getMetrics(); // Sem período = 2024 inteiro
}

/**
 * Busca métricas de período customizado
 */
export async function getCustomPeriodMetrics(
  startDate: string,
  endDate: string,
  includeAudience?: boolean
): Promise<MetricsResponse> {
  const request = buildMetricsRequest('', 'custom', {
    customPeriod: { startDate, endDate },
    includeAudience,
  });
  
  return fetchMetrics(request);
}

