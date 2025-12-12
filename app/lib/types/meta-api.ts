// ===================================================
// TIPOS PARA A META MARKETING API (Insights)
// ===================================================

/**
 * Valores válidos para date_preset da Meta API
 * @see https://developers.facebook.com/docs/marketing-api/insights/parameters
 */
export type MetaDatePreset = 
  | 'today'
  | 'yesterday'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'maximum'
  | 'last_3d'
  | 'last_7d'
  | 'last_14d'
  | 'last_28d'
  | 'last_30d'
  | 'last_90d';

/**
 * Níveis de agregação disponíveis
 */
export type MetaInsightsLevel = 'account' | 'campaign' | 'adset' | 'ad';

/**
 * Breakdowns disponíveis para audiência
 */
export type MetaBreakdown = 
  | 'age'
  | 'gender'
  | 'country'
  | 'region'
  | 'dma'
  | 'impression_device'
  | 'device_platform'
  | 'platform_position'
  | 'publisher_platform';

/**
 * Time range para período customizado
 */
export interface MetaTimeRange {
  since: string; // Formato: YYYY-MM-DD
  until: string; // Formato: YYYY-MM-DD
}

/**
 * Parâmetros para a chamada à Meta Insights API
 */
export interface MetaInsightsParams {
  // Identificação
  adAccountId: string;
  accessToken: string;
  
  // Período (usar apenas um dos dois)
  datePreset?: MetaDatePreset;
  timeRange?: MetaTimeRange;
  
  // Configurações
  level: MetaInsightsLevel;
  fields: string[];
  
  // Opcionais
  timeIncrement?: string | number; // '1' para diário, '7' para semanal, 'monthly', 'all_days'
  breakdowns?: MetaBreakdown[];
  filtering?: MetaFilter[];
  limit?: number;
}

/**
 * Filtro para a API
 */
export interface MetaFilter {
  field: string;
  operator: 'EQUAL' | 'NOT_EQUAL' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'CONTAIN' | 'NOT_CONTAIN';
  value: string | number | string[];
}

/**
 * Ação retornada pela API (leads, conversões, etc.)
 */
export interface MetaAction {
  action_type: string;
  value: string;
}

/**
 * Custo por tipo de ação
 */
export interface MetaCostPerAction {
  action_type: string;
  value: string;
}

/**
 * Dados de insight retornados pela Meta API
 */
export interface MetaInsightData {
  // Identificadores
  account_id?: string;
  account_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  
  // Métricas principais
  impressions?: string;
  reach?: string;
  frequency?: string;
  clicks?: string;
  unique_clicks?: string;
  spend?: string;
  
  // Taxas e custos
  cpc?: string;
  cpm?: string;
  cpp?: string;
  ctr?: string;
  unique_ctr?: string;
  
  // Ações e conversões
  actions?: MetaAction[];
  conversions?: MetaAction[];
  cost_per_action_type?: MetaCostPerAction[];
  cost_per_conversion?: MetaCostPerAction[];
  
  // Vídeo
  video_p25_watched_actions?: MetaAction[];
  video_p50_watched_actions?: MetaAction[];
  video_p75_watched_actions?: MetaAction[];
  video_p100_watched_actions?: MetaAction[];
  
  // Período
  date_start?: string;
  date_stop?: string;
  
  // Breakdowns (quando solicitados)
  age?: string;
  gender?: string;
  country?: string;
  region?: string;
  device_platform?: string;
  publisher_platform?: string;
}

/**
 * Resposta da Meta Insights API
 */
export interface MetaInsightsResponse {
  data: MetaInsightData[];
  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
    next?: string;
    previous?: string;
  };
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

/**
 * Configuração da conta de anúncios do usuário
 */
export interface UserAdAccount {
  userId: string;
  platform: 'meta' | 'google' | 'tiktok';
  adAccountId: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  accountName?: string;
  isActive: boolean;
}

