'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    // Verificar se há uma sessão válida de recuperação de senha
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsValidSession(true);
      }
      setCheckingSession(false);
    };

    checkSession();

    // Escutar eventos de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validação
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

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);

    // Redirecionar para login após 3 segundos
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-gold-primary text-4xl mb-4"></i>
          <p className="text-text-secondary">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession && !checkingSession) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
        <div className="floating-orb-1" style={{ top: '-200px', left: '-200px' }}></div>
        <div className="floating-orb-2" style={{ bottom: '-150px', right: '-150px' }}></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="glass-effect rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-error bg-opacity-10 flex items-center justify-center mb-6">
              <i className="fa-solid fa-link-slash text-error text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Link inválido ou expirado</h2>
            <p className="text-text-secondary mb-8">
              O link de redefinição de senha é inválido ou já expirou. 
              Solicite um novo link para redefinir sua senha.
            </p>
            <Link 
              href="/esqueci-senha"
              className="inline-block w-full py-4 text-center font-semibold rounded-xl hover:shadow-lg hover:shadow-gold-primary/20 transition-all"
              style={{ 
                background: 'linear-gradient(to right, #E4C27A, #C9A965)',
                color: '#050509'
              }}
            >
              Solicitar novo link
            </Link>
            <Link 
              href="/login"
              className="inline-block w-full mt-4 py-4 bg-dark-elevated border border-border-subtle text-text-primary font-semibold rounded-xl hover:border-gold-primary transition-all"
            >
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
        <div className="floating-orb-1" style={{ top: '-200px', left: '-200px' }}></div>
        <div className="floating-orb-2" style={{ bottom: '-150px', right: '-150px' }}></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="glass-effect rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-success bg-opacity-10 flex items-center justify-center mb-6">
              <i className="fa-solid fa-check-circle text-success text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Senha redefinida!</h2>
            <p className="text-text-secondary mb-6">
              Sua senha foi alterada com sucesso. Você será redirecionado para o login em instantes...
            </p>
            <div className="flex justify-center">
              <i className="fa-solid fa-spinner fa-spin text-gold-primary text-xl"></i>
            </div>
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
            <i className="fa-solid fa-lock text-dark-primary text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Redefinir senha</h1>
          <p className="text-sm text-text-secondary">Crie uma nova senha para sua conta</p>
        </div>

        {/* Form Card */}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-text-primary">Nova senha</label>
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">Confirmar nova senha</label>
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
                  placeholder="Repita a nova senha"
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
                  Redefinindo...
                </>
              ) : (
                'Redefinir senha'
              )}
            </button>

          </form>

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

