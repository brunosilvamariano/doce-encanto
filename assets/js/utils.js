// Módulo de Utilitários - Funções auxiliares e utilitárias
const UtilsModule = {
    // Função para mostrar categoria
    showCategory: function(categoryId) {
        // Esconder todas as categorias
        const categories = document.querySelectorAll('.menu-section');
        categories.forEach(category => {
            category.style.display = 'none';
        });
        
        // Mostrar categoria selecionada
        const selectedCategory = document.getElementById(categoryId);
        if (selectedCategory) {
            selectedCategory.style.display = 'block';
        }
        
        // Atualizar botões de categoria
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Adicionar classe active ao botão clicado
        const activeButton = document.querySelector(`[onclick="showCategory('${categoryId}')"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    },
    
    // Função para limpar formulário de CEP
    limpaFormularioCep: function() {
        document.getElementById('customerStreet').value = '';
        document.getElementById('customerNeighborhood').value = '';
        document.getElementById('customerCity').value = '';
        document.getElementById('customerState').value = '';
    },
    
    // Função para pesquisar CEP
    pesquisaCep: function(valor) {
        // Nova variável "cep" somente com dígitos
        var cep = valor.replace(/\D/g, '');
        
        // Verifica se campo cep possui valor informado
        if (cep != "") {
            // Expressão regular para validar o CEP
            var validacep = /^[0-9]{8}$/;
            
            // Valida o formato do CEP
            if(validacep.test(cep)) {
                // Preenche os campos com "..." enquanto consulta webservice
                document.getElementById('customerStreet').value = "...";
                document.getElementById('customerNeighborhood').value = "...";
                document.getElementById('customerCity').value = "...";
                document.getElementById('customerState').value = "...";
                
                // Usar fetch API para consultar o CEP
                fetch(`https://viacep.com.br/ws/${cep}/json/`)
                    .then(response => response.json())
                    .then(data => {
                        if (!data.erro) {
                            document.getElementById('customerStreet').value = data.logradouro;
                            document.getElementById('customerNeighborhood').value = data.bairro;
                            document.getElementById('customerCity').value = data.localidade;
                            document.getElementById('customerState').value = data.uf;
                        } else {
                            this.limpaFormularioCep();
                            alert("CEP não encontrado.");
                        }
                    })
                    .catch(error => {
                        this.limpaFormularioCep();
                        alert("Erro ao consultar CEP. Tente novamente.");
                    });
            } else {
                // CEP é inválido
                this.limpaFormularioCep();
                alert("Formato de CEP inválido.");
            }
        } else {
            // CEP sem valor, limpa formulário
            this.limpaFormularioCep();
        }
    },
    
    // Função para formatar CEP automaticamente
    formatCep: function(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length > 5) {
            value = value.substring(0, 5) + '-' + value.substring(5, 8);
        }
        input.value = value;
    },
    
    // Função para scroll suave
    smoothScroll: function(target) {
        document.querySelector(target).scrollIntoView({
            behavior: 'smooth'
        });
    },
    
    // Função para animação de entrada dos cards
    animateCards: function() {
        const cards = document.querySelectorAll('.menu-item-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });
        
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    },
    
    // Função para fechar carrinho com ESC
    handleKeyPress: function(event) {
        if (event.key === 'Escape' && document.getElementById('cartSidebar').classList.contains('open')) {
            CartModule.toggleCart();
        }
    },
    
    // Função para adicionar efeitos de hover nos cards
    addCardHoverEffects: function() {
        const cards = document.querySelectorAll('.menu-item-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    },
    
    // Função para fechar carrinho ao clicar fora (desktop)
    setupOutsideClickHandler: function() {
        document.addEventListener('click', function(event) {
            const cartSidebar = document.getElementById('cartSidebar');
            if (window.innerWidth > 768 && 
                cartSidebar.classList.contains('open') && 
                !cartSidebar.contains(event.target) && 
                !event.target.closest('.cart-button') &&
                !event.target.closest('.btn-add-to-cart') &&
                !event.target.closest('.header-cart-button')) {
                CartModule.toggleCart();
            }
        });
    },
    
    // Função para animação de loading inicial
    initLoadingAnimation: function() {
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease';
            document.body.style.opacity = '1';
        }, 100);
    }
};

// Funções globais para compatibilidade
function showCategory(categoryId) {
    UtilsModule.showCategory(categoryId);
}

function limpaFormularioCep() {
    UtilsModule.limpaFormularioCep();
}

function pesquisaCep(valor) {
    UtilsModule.pesquisaCep(valor);
}

function formatCep(input) {
    UtilsModule.formatCep(input);
}

function smoothScroll(target) {
    UtilsModule.smoothScroll(target);
}

// Exportar módulo para uso global
window.UtilsModule = UtilsModule;

