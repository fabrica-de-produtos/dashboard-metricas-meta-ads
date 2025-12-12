'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos' 
        : error.message);
      setIsLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError('Erro ao conectar com Google. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Floating Orbs */}
      <div className="floating-orb-1" style={{ top: '-200px', left: '-200px' }}></div>
      <div className="floating-orb-2" style={{ bottom: '-150px', right: '-150px' }}></div>
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-primary to-gold-secondary logo-glow mb-4">
            <i className="fa-solid fa-chart-line text-dark-primary text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Painel de Resultados</h1>
          <p className="text-sm text-text-secondary">Acesse suas campanhas e métricas</p>
        </div>

        {/* Login Card */}
        <div className="glass-effect rounded-3xl p-8 shadow-2xl">
          
          {/* Login Header */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Bem-vindo de volta</h2>
            <p className="text-sm text-text-secondary">Entre com suas credenciais para continuar</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error bg-opacity-10 border border-error rounded-xl">
              <p className="text-sm text-error flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-regular fa-envelope text-text-secondary"></i>
                </div>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-dark-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-secondary focus:border-gold-primary transition-all"
                  placeholder="seu@email.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-text-secondary"></i>
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  id="password" 
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-dark-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-secondary focus:border-gold-primary transition-all"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-gold-primary transition-colors"
                >
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="remember" 
                  name="remember"
                  className="w-4 h-4 rounded border-border-subtle bg-dark-elevated text-gold-primary focus:ring-2 focus:ring-gold-primary focus:ring-offset-0 cursor-pointer"
                />
                <span className="ml-2 text-sm text-text-secondary">Lembrar de mim</span>
              </label>
              <Link 
                href="/esqueci-senha" 
                className="text-sm text-gold-primary hover:text-gold-secondary transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 text-dark-primary font-semibold rounded-xl hover:shadow-lg hover:shadow-gold-primary/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              style={{ 
                background: 'linear-gradient(to right, #E4C27A, #C9A965)',
                color: '#050509'
              }}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  Entrando...
                </>
              ) : (
                'Entrar no Painel'
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-4 text-text-secondary" style={{ backgroundColor: 'rgba(15, 16, 24, 0.95)' }}>ou continue com</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3.5 bg-dark-elevated border border-border-subtle text-text-primary rounded-xl hover:border-gold-primary hover:bg-dark-surface transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <i className="fa-brands fa-google text-lg"></i>
              <span className="font-medium">Continuar com Google</span>
            </button>
          </div>

          {/* Signup Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-text-secondary">
              Ainda não tem uma conta?{' '}
              <Link 
                href="/cadastro" 
                className="text-gold-primary hover:text-gold-secondary font-medium transition-colors"
              >
                Criar conta gratuita
              </Link>
            </p>
          </div>

        </div>

        {/* Security Badges */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-shield-halved text-gold-primary"></i>
            <span className="text-xs text-text-secondary">Conexão segura</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-lock text-gold-primary"></i>
            <span className="text-xs text-text-secondary">Criptografia SSL</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-secondary">
            Desenvolvido por <span className="text-gold-primary font-medium">Sua Agência Digital</span>
          </p>
        </div>

      </div>

    </div>
  );
}

