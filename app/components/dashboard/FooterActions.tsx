'use client';

export default function FooterActions() {
  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-primary bg-opacity-10 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-download text-gold-primary text-xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Exportar Relatório Completo</h3>
              <p className="text-sm text-text-secondary mb-4">Baixe um relatório PDF detalhado com todas as métricas, gráficos e insights do período selecionado.</p>
              <button className="px-6 py-3 bg-gold-primary bg-opacity-10 border border-gold-primary text-gold-primary rounded-lg font-medium text-sm hover:bg-opacity-20 transition-all focus-ring">
                <i className="fa-solid fa-file-pdf mr-2"></i>
                Gerar Relatório PDF
              </button>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-primary bg-opacity-10 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-envelope text-gold-primary text-xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Agendar Relatórios Automáticos</h3>
              <p className="text-sm text-text-secondary mb-4">Configure o envio automático de relatórios semanais ou mensais diretamente no seu e-mail.</p>
              <button className="px-6 py-3 bg-dark-elevated border border-border-subtle text-text-primary rounded-lg font-medium text-sm hover:border-gold-primary hover:text-gold-primary transition-all focus-ring">
                <i className="fa-solid fa-gear mr-2"></i>
                Configurar Envios
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

