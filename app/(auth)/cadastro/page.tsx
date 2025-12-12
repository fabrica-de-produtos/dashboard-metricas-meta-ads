'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validação de senha
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nome,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este e-mail já está cadastrado');
      } else {
        setError(error.message);
      }
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  const handleGoogleSignup = async () => {
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

  if (success) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
        <div className="floating-orb-1" style={{ top: '-200px', left: '-200px' }}></div>
        <div className="floating-orb-2" style={{ bottom: '-150px', right: '-150px' }}></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="glass-effect rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-success bg-opacity-10 flex items-center justify-center mb-6">
              <i className="fa-solid fa-envelope-circle-check text-success text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Verifique seu e-mail</h2>
            <p className="text-text-secondary mb-6">
              Enviamos um link de confirmação para <span className="text-gold-primary font-medium">{email}</span>. 
              Clique no link para ativar sua conta.
            </p>
            <p className="text-sm text-text-secondary mb-8">
              Não recebeu o e-mail? Verifique sua pasta de spam ou{' '}
              <button 
                onClick={() => setSuccess(false)} 
                className="text-gold-primary hover:text-gold-secondary transition-colors"
              >
                tente novamente
              </button>
            </p>
            <Link 
              href="/login"
              className="inline-block w-full py-4 text-center font-semibold rounded-xl hover:shadow-lg hover:shadow-gold-primary/20 transition-all"
              style={{ 
                background: 'linear-gradient(to right, #E4C27A, #C9A965)',
                color: '#050509'
              }}
            >
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-text-primary mb-2">Criar Conta</h1>
          <p className="text-sm text-text-secondary">Cadastre-se para acessar o painel</p>
        </div>

        {/* Signup Card */}
        <div className="glass-effect rounded-3xl p-8 shadow-2xl">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error bg-opacity-10 border border-error rounded-xl">
              <p className="text-sm text-error flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nome Field */}
            <div className="space-y-2">
              <label htmlFor="nome" className="block text-sm font-medium text-text-primary">Nome completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-regular fa-user text-text-secondary"></i>
                </div>
                <input 
                  type="text" 
                  id="nome" 
                  name="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-dark-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-secondary focus:border-gold-primary transition-all"
                  placeholder="Seu nome"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

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
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">Confirmar senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-text-secondary"></i>
                </div>
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword" 
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-dark-elevated border border-border-subtle rounded-xl text-text-primary placeholder-text-secondary focus:border-gold-primary transition-all"
                  placeholder="Repita a senha"
                  required
                  disabled={isLoading}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-secondary hover:text-gold-primary transition-colors"
                >
                  <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="terms" 
                name="terms"
                required
                className="w-4 h-4 mt-1 rounded border-border-subtle bg-dark-elevated text-gold-primary focus:ring-2 focus:ring-gold-primary focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-text-secondary">
                Concordo com os{' '}
                <a href="#" className="text-gold-primary hover:text-gold-secondary transition-colors">
                  Termos de Uso
                </a>{' '}
                e{' '}
                <a href="#" className="text-gold-primary hover:text-gold-secondary transition-colors">
                  Política de Privacidade
                </a>
              </label>
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
                  Criando conta...
                </>
              ) : (
                'Criar minha conta'
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-4 text-text-secondary" style={{ backgroundColor: 'rgba(15, 16, 24, 0.95)' }}>ou cadastre-se com</span>
            </div>
          </div>

          {/* Social Login */}
          <button 
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full py-3.5 bg-dark-elevated border border-border-subtle text-text-primary rounded-xl hover:border-gold-primary hover:bg-dark-surface transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <i className="fa-brands fa-google text-lg"></i>
            <span className="font-medium">Continuar com Google</span>
          </button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              Já tem uma conta?{' '}
              <Link 
                href="/login" 
                className="text-gold-primary hover:text-gold-secondary font-medium transition-colors"
              >
                Fazer login
              </Link>
            </p>
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

