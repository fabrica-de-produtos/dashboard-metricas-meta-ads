'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { useMetrics } from '@/app/lib/contexts';
import type { MetricPeriod } from '@/app/lib/types/metrics';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  clientName?: string;
  subtitle?: string;
}

const periodFilters: { id: MetricPeriod; label: string; icon?: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: 'yesterday', label: 'Ontem' },
  { id: 'last7', label: 'Últimos 7 dias' },
  { id: 'last30', label: 'Últimos 30 dias' },
  { id: 'thisMonth', label: 'Este mês' },
  { id: 'lastMonth', label: 'Mês passado' },
  { id: 'custom', label: 'Personalizado', icon: 'fa-regular fa-calendar' },
];

export default function Header({ 
  clientName = 'Dashboard de Métricas',
  subtitle = 'Painel de Campanhas'
}: HeaderProps) {
  const { metrics } = useMetrics();

  // Gerar lista de campanhas a partir dos dados reais (sem duplicatas)
  const uniqueCampaigns = new Map<string, { id: string; name: string }>();
  metrics?.data?.ads?.forEach(ad => {
    if (!uniqueCampaigns.has(ad.id)) {
      uniqueCampaigns.set(ad.id, {
        id: ad.id,
        name: ad.name.length > 30 ? ad.name.substring(0, 30) + '...' : ad.name,
      });
    }
  });
  
  const campaigns = [
    { id: 'all', name: 'Todas as campanhas' },
    ...Array.from(uniqueCampaigns.values()).slice(0, 5)
  ];
  const router = useRouter();
  const { currentPeriod, setPeriod, isLoading: isLoadingMetrics } = useMetrics();
  
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0].name);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const getUserName = () => {
    if (!user) return '';
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
  };

  const getUserInitials = () => {
    const name = getUserName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="glass-effect-light sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-8 py-5">
        <div className="flex items-center justify-between gap-8">
          <div className="flex-shrink-0">
            <h1 className="text-lg font-semibold text-text-primary">{clientName}</h1>
            <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <select 
                className="w-full bg-dark-elevated border border-border-subtle rounded-lg px-4 py-3 text-text-primary text-sm focus-ring appearance-none cursor-pointer disabled:opacity-50"
                value={selectedCampaign}
                onChange={(e) => {
                  setSelectedCampaign(e.target.value);
                  // TODO: Filtro de campanha será implementado depois
                }}
                disabled={isLoadingMetrics}
                style={{ backgroundColor: '#151621', color: '#F5F5F5' }}
              >
                {campaigns.map((campaign, index) => (
                  <option 
                    key={campaign.id || `campaign-${index}`} 
                    value={campaign.name}
                    className="bg-dark-elevated text-text-primary py-2"
                    style={{ backgroundColor: '#151621', color: '#F5F5F5' }}
                  >
                    {campaign.name}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"></i>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {periodFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setPeriod(filter.id)}
                disabled={isLoadingMetrics}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all focus-ring disabled:opacity-50 ${
                  currentPeriod === filter.id
                    ? 'chip-active text-gold-primary'
                    : 'text-text-secondary border border-border-subtle hover:border-gold-primary hover:text-gold-primary'
                }`}
              >
                {isLoadingMetrics && currentPeriod === filter.id ? (
                  <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                ) : filter.icon ? (
                  <i className={`${filter.icon} mr-1`}></i>
                ) : null}
                {filter.label}
              </button>
            ))}
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-dark-elevated border border-border-subtle hover:border-gold-primary transition-all focus-ring"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-primary to-gold-secondary flex items-center justify-center">
                  <span className="text-xs font-bold text-dark-primary">{getUserInitials()}</span>
                </div>
                <span className="text-sm text-text-primary font-medium hidden lg:block">{getUserName()}</span>
                <i className={`fa-solid fa-chevron-down text-text-secondary text-xs transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
              </button>

              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  <div className="absolute right-0 top-full mt-2 w-64 glass-effect rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-border-subtle">
                      <p className="text-sm font-medium text-text-primary">{getUserName()}</p>
                      <p className="text-xs text-text-secondary mt-1">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:text-error hover:bg-error hover:bg-opacity-10 rounded-lg transition-all disabled:opacity-50"
                      >
                        {isLoggingOut ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fa-solid fa-right-from-bracket"></i>
                        )}
                        <span>{isLoggingOut ? 'Saindo...' : 'Sair da conta'}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
