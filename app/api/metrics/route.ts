import { NextRequest, NextResponse } from 'next/server';
import { fetchMetaInsights } from '@/app/lib/services/metaInsightsService';
import { transformMetaDataToResponse } from '@/app/lib/services/metricsTransformer';
import type { MetricsRequest, MetricsResponse } from '@/app/lib/types/metrics';

// ===================================================
// API ROUTE: /api/metrics
// Recebe o JSON da nossa aplicação e busca dados da Meta API
// ===================================================

/**
 * POST /api/metrics
 * 
 * Recebe o body no formato da nossa aplicação e retorna métricas
 * formatadas para o dashboard.
 * 
 * Body esperado:
 * {
 *   "userId": "uuid-do-usuario",
 *   "adAccountId": "123456789",        // ID da conta Meta (sem prefixo act_)
 *   "accessToken": "token-da-meta",    // Token de acesso
 *   "period": "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth" | "custom",
 *   "customPeriod": { "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" },
 *   "campaignId": "opcional",
 *   "platform": "meta",
 *   "includeAds": true,
 *   "includeInsights": true,
 *   "includeAudience": true,
 *   "includeComparison": true,
 *   "timezone": "America/Sao_Paulo"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse do body
    const body: MetricsRequest = await request.json();
    
    console.log('📨 [API Metrics] Requisição recebida:', {
      userId: body.userId,
      adAccountId: body.adAccountId ? '***' : 'não informado',
      period: body.period,
      includeAds: body.includeAds,
      includeAudience: body.includeAudience,
      includeComparison: body.includeComparison,
    });
    
    // 2. Validar campos obrigatórios
    if (!body.userId) {
      return NextResponse.json<MetricsResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: 'userId é obrigatório',
          },
        },
        { status: 400 }
      );
    }
    
    if (!body.period) {
      return NextResponse.json<MetricsResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_PERIOD',
            message: 'period é obrigatório',
          },
        },
        { status: 400 }
      );
    }
    
    // 3. Validar credenciais da Meta (vem direto do body por enquanto)
    if (!body.adAccountId) {
      return NextResponse.json<MetricsResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_AD_ACCOUNT_ID',
            message: 'adAccountId é obrigatório',
            details: 'Informe o ID da conta de anúncios da Meta.',
          },
        },
        { status: 400 }
      );
    }
    
    if (!body.accessToken) {
      return NextResponse.json<MetricsResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_ACCESS_TOKEN',
            message: 'accessToken é obrigatório',
            details: 'Informe o token de acesso da Meta API.',
          },
        },
        { status: 400 }
      );
    }
    
    // 4. Buscar métricas da Meta API
    console.log('🔄 [API Metrics] Buscando dados da Meta API...');
    
    const metaData = await fetchMetaInsights(
      body,
      body.adAccountId,
      body.accessToken
    );
    
    // 5. Transformar dados para o formato do dashboard
    const response = transformMetaDataToResponse(metaData);
    
    console.log('✅ [API Metrics] Dados processados com sucesso');
    
    return NextResponse.json<MetricsResponse>(response);
    
  } catch (error) {
    console.error('❌ [API Metrics] Erro:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json<MetricsResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao processar requisição',
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/metrics
 * 
 * Endpoint para verificar se a API está funcionando
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API de métricas funcionando',
    usage: {
      method: 'POST',
      body: {
        userId: 'string (obrigatório)',
        adAccountId: 'string (obrigatório) - ID da conta Meta sem prefixo act_',
        accessToken: 'string (obrigatório) - Token de acesso da Meta API',
        period: 'today | yesterday | last7 | last30 | thisMonth | lastMonth | custom',
        customPeriod: '{ startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" } - apenas se period = custom',
        includeAds: 'boolean (default: true)',
        includeInsights: 'boolean (default: true)',
        includeAudience: 'boolean (default: false)',
        includeComparison: 'boolean (default: true)',
      },
    },
  });
}

