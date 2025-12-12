'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase/client';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6 relative overflow-hidden">
        <div className="floating-orb-1" style={{ top: '-200px', left: '-200px' }}></div>
        <div className="floating-orb-2" style={{ bottom: '-150px', right: '-150px' }}></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="glass-effect rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-success bg-opacity-10 flex items-center justify-center mb-6">
              <i className="fa-solid fa-paper-plane text-success text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">E-mail enviado!</h2>
            <p className="text-text-secondary mb-6">
              Enviamos um link de redefinição de senha para{' '}
              <span className="text-gold-primary font-medium">{email}</span>
            </p>
            <p className="text-sm text-text-secondary mb-8">
              Verifique sua caixa de entrada e pasta de spam. O link expira em 1 hora.
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
            <i className="fa-solid fa-key text-dark-primary text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Esqueci minha senha</h1>
          <p className="text-sm text-text-secondary">Informe seu e-mail para recuperar sua conta</p>
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
              <p className="text-xs text-text-secondary mt-2">
                Enviaremos um link para você redefinir sua senha
              </p>
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
                  Enviando...
                </>
              ) : (
                'Enviar link de recuperação'
              )}
            </button>

          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="text-sm text-text-secondary hover:text-gold-primary transition-colors inline-flex items-center gap-2"
            >
              <i className="fa-solid fa-arrow-left"></i>
              Voltar para o login
            </Link>
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

