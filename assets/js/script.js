// Script principal - Doce Encanto
// Arquivo principal que inicializa todos os módulos

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar módulo do carrinho
    CartModule.init();
    
    // Inicializar módulo de status (deve vir após o carrinho)
    StatusModule.init();
    
    // Mostrar categoria inicial (brigadeiros)
    UtilsModule.showCategory('brigadeiros');
    
    // Animar cards
    UtilsModule.animateCards();
    
    // Adicionar efeitos de hover nos cards
    UtilsModule.addCardHoverEffects();
    
    // Configurar handler para clique fora do carrinho
    UtilsModule.setupOutsideClickHandler();
    
    // Animação de loading inicial
    UtilsModule.initLoadingAnimation();
    
    // Event listeners globais
    document.addEventListener('keydown', UtilsModule.handleKeyPress);
    window.addEventListener('resize', CartModule.handleResize);
    
    // Formatação automática do CEP e consulta
    const cepInput = document.getElementById('customerCep');
    if (cepInput) {
        cepInput.addEventListener('input', function() {
            UtilsModule.formatCep(this);
        });
        
        cepInput.addEventListener('blur', function() {
            UtilsModule.pesquisaCep(this.value);
        });
    }
    
    // Atualizar resumo do pedido quando o modal for aberto
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.addEventListener('show.bs.modal', function () {
            CheckoutModule.updateOrderSummary();
        });
    }
    
    console.log('🍰 Doce Encanto - Sistema inicializado com sucesso!');
});

