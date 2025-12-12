'use client';

interface FooterProps {
  agencyName?: string;
}

export default function Footer({ agencyName = 'Sua Agência Digital' }: FooterProps) {
  return (
    <footer className="glass-effect-light border-t border-border-subtle mt-16">
      <div className="max-w-[1920px] mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Desenvolvido por <span className="text-gold-primary font-medium">{agencyName}</span>
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-text-secondary hover:text-gold-primary transition-colors focus-ring">
              Suporte
            </a>
            <a href="#" className="text-sm text-text-secondary hover:text-gold-primary transition-colors focus-ring">
              Documentação
            </a>
            <a href="#" className="text-sm text-text-secondary hover:text-gold-primary transition-colors focus-ring">
              Privacidade
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

