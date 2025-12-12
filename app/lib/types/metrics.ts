// ===================================================
// TIPOS PARA O WEBHOOK DE BUSCA DE MÉTRICAS
// ===================================================

/**
 * Períodos disponíveis para filtragem de métricas
 */
export type MetricPeriod = 
  | 'today'       // Hoje
  | 'yesterday'   // Ontem
  | 'last7'       // Últimos 7 dias
  | 'last30'      // Últimos 30 dias
  | 'thisMonth'   // Este mês
  | 'lastMonth'   // Mês passado
  | 'custom';     // Período personalizado

/**
 * Plataformas de anúncios suportadas
 */
export type AdPlatform = 
  | 'meta'        // Facebook/Instagram Ads
  | 'google'      // Google Ads
  | 'tiktok';     // TikTok Ads

/**
 * Estrutura para período personalizado
 */
export interface CustomPeriod {
  startDate: string; // Formato: YYYY-MM-DD
  endDate: string;   // Formato: YYYY-MM-DD
}

/**
 * Estrutura do corpo da requisição para buscar métricas
 * Este é o JSON padrão enviado no body do webhook
 */
export interface MetricsRequest {
  // === IDENTIFICAÇÃO ===
  userId: string;          // ID do usuário no Supabase
  accountId?: string;      // ID da conta de anúncios (opcional, para múltiplas contas)
  
  // === CREDENCIAIS META (temporário - depois virá do banco) ===
  adAccountId?: string;    // ID da conta Meta Ads (ex: "123456789", sem prefixo act_)
  accessToken?: string;    // Token de acesso da Meta API
  
  // === FILTROS DE PERÍODO ===
  period: MetricPeriod;    // Período selecionado
  customPeriod?: CustomPeriod; // Obrigatório quando period = 'custom'
  
  // === FILTROS DE CAMPANHA ===
  campaignId?: string;     // ID da campanha específica (null = todas)
  campaignName?: string;   // Nome da campanha para filtro
  
  // === FILTROS DE PLATAFORMA ===
  platform?: AdPlatform;   // Plataforma de anúncios (null = todas)
  
  // === OPÇÕES DE DADOS ===
  includeAds?: boolean;        // Incluir dados detalhados dos anúncios
  includeInsights?: boolean;   // Incluir insights/recomendações
  includeAudience?: boolean;   // Incluir dados de audiência
  includeComparison?: boolean; // Incluir comparativo com período anterior
  
  // === METADADOS ===
  timezone?: string;       // Timezone do usuário (ex: 'America/Sao_Paulo')
  requestedAt?: string;    // Timestamp da requisição (ISO 8601)
}

/**
 * Estrutura de um KPI individual na resposta
 */
export interface KPIData {
  label: string;           // Nome do KPI
  value: number | string;  // Valor atual
  formattedValue: string;  // Valor formatado (ex: "R$ 2.345")
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;         // Ex: "+12%"
    label?: string;        // Ex: "vs período anterior"
  };
  subtitle?: string;       // Informação adicional
}

/**
 * Estrutura de um anúncio na resposta
 */
export interface AdData {
  id: string;
  name: string;
  placement: string;       // Ex: "Feed + Stories"
  status: 'active' | 'paused' | 'ended';
  investment: number;
  investmentFormatted: string;
  clicks: number;
  impressions: number;
  leads: number;
  cpl: number;             // Custo por Lead
  cplFormatted: string;
  ctr: number;             // Click-Through Rate (%)
  ctrFormatted: string;
  conversions?: number;
  thumbnailUrl?: string;
}

/**
 * Dados de performance por período (para gráficos)
 */
export interface PerformanceData {
  date: string;            // Formato: DD/MM ou YYYY-MM-DD
  investment: number;
  clicks: number;
  leads: number;
  impressions: number;
  ctr: number;
  cpl: number;
}

/**
 * Dados do funil de conversão
 */
export interface FunnelData {
  impressions: number;
  clicks: number;
  leads: number;
  appointments: number;    // Agendamentos
  conversions: number;     // Vendas/Conversões finais
}

/**
 * Insight/Recomendação gerada
 */
export interface InsightData {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  icon: string;
  title: string;
  description: string;
  priority?: number;       // 1 = mais importante
}

/**
 * Dados de audiência
 */
export interface AudienceData {
  demographics: {
    gender: { male: number; female: number; other: number };
    ageRanges: Array<{ range: string; percentage: number }>;
    locations: Array<{ name: string; percentage: number }>;
  };
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  bestHours: Array<{ hour: string; performance: number }>;
  bestDays: Array<{ day: string; performance: number }>;
}

/**
 * Estrutura completa da resposta do webhook
 */
export interface MetricsResponse {
  success: boolean;
  message?: string;
  
  // Dados principais
  data?: {
    // KPIs resumidos
    kpis: {
      investment: KPIData;
      clicks: KPIData;
      leads: KPIData;
      cpl: KPIData;
      appointments: KPIData;
      roas: KPIData;
    };
    
    // Performance ao longo do tempo
    performance: PerformanceData[];
    
    // Lista de anúncios
    ads: AdData[];
    
    // Funil de conversão
    funnel: FunnelData;
    
    // Insights e recomendações (se solicitado)
    insights?: InsightData[];
    
    // Dados de audiência (se solicitado)
    audience?: AudienceData;
    
    // Comparativo com período anterior (se solicitado)
    comparison?: {
      investmentChange: number;  // Percentual
      clicksChange: number;
      leadsChange: number;
      cplChange: number;
    };
  };
  
  // Metadados da resposta
  meta?: {
    periodStart: string;
    periodEnd: string;
    totalCampaigns: number;
    totalAds: number;
    generatedAt: string;
  };
  
  // Erro (se houver)
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

