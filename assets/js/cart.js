// Módulo do Carrinho - Funcionalidades do carrinho de compras
const CartModule = {
    // Variáveis do carrinho
    cart: [],
    cartTotal: 0,
    
    // Elementos DOM
    cartSidebar: null,
    cartContent: null,
    cartCount: null,
    cartTotalElement: null,
    
    // Inicializar módulo
    init: function() {
        this.cartSidebar = document.getElementById('cartSidebar');
        this.cartContent = document.getElementById('cartContent');
        this.cartCount = document.getElementById('headerCartCount');
        this.cartTotalElement = document.getElementById('cartTotal');
        
        this.loadCart();
        this.updateCart();
    },
    
    // Função para adicionar item ao carrinho
    addToCart: function(itemName, price) {
        // Verificar se o restaurante está aberto
        if (window.StatusModule && !window.StatusModule.canOrder()) {
            window.StatusModule.showClosedAlert();
            return;
        }
        
        // Verificar se o item já existe no carrinho
        const existingItem = this.cart.find(item => item.name === itemName);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                name: itemName,
                price: price,
                quantity: 1
            });
        }
        
        this.updateCart();
        this.showAddedToCartAnimation();
        this.saveCart();
    },
    
    // Função para remover item do carrinho
    removeFromCart: function(itemName) {
        const itemIndex = this.cart.findIndex(item => item.name === itemName);
        if (itemIndex > -1) {
            this.cart.splice(itemIndex, 1);
            this.updateCart();
            this.saveCart();
        }
    },
    
    // Função para alterar quantidade do item
    changeQuantity: function(itemName, change) {
        const item = this.cart.find(item => item.name === itemName);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(itemName);
            } else {
                this.updateCart();
                this.saveCart();
            }
        }
    },
    
    // Função para atualizar o carrinho
    updateCart: function() {
        // Atualizar contador
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount.textContent = totalItems;
        
        // Mostrar/esconder contador do carrinho
        if (totalItems > 0) {
            this.cartCount.classList.add('show');
        } else {
            this.cartCount.classList.remove('show');
        }
        
        // Atualizar total
        this.cartTotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        this.cartTotalElement.textContent = this.cartTotal.toFixed(2);
        
        // Atualizar total global para uso em outros módulos
        window.cartTotal = this.cartTotal;
        window.cart = [...this.cart];
        
        // Atualizar conteúdo do carrinho
        if (this.cart.length === 0) {
            this.cartContent.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
        } else {
            this.cartContent.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${this.getItemDisplayName(item.name)}</h4>
                        <p>R$ ${item.price.toFixed(2)}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button class="btn-quantity" onclick="CartModule.changeQuantity('${item.name}', -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="btn-quantity" onclick="CartModule.changeQuantity('${item.name}', 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn-remove" onclick="CartModule.removeFromCart('${item.name}')" title="Remover item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    },
    
    // Função para obter nome de exibição do item
    getItemDisplayName: function(itemName) {
        const displayNames = {
            // Brigadeiros
            'brigadeiro-tradicional': 'Brigadeiro Tradicional',
            'brigadeiro-coco': 'Brigadeiro de Coco (Beijinho)',
            'brigadeiro-churros': 'Brigadeiro de Churros',
            'brigadeiro-limao': 'Brigadeiro de Limão',
            
            // Bolos de Pote
            'bolo-pote-chocolate': 'Bolo de Pote de Chocolate',
            'bolo-pote-morango': 'Bolo de Pote de Morango',
            'bolo-pote-doce-leite': 'Bolo de Pote de Doce de Leite',
            'bolo-pote-limao': 'Bolo de Pote de Limão'
        };
        return displayNames[itemName] || itemName;
    },
    
    // Função para alternar carrinho
    toggleCart: function() {
        this.cartSidebar.classList.toggle('open');
        
        // Adicionar overlay em dispositivos móveis
        if (window.innerWidth <= 768) {
            if (this.cartSidebar.classList.contains('open')) {
                this.createCartOverlay();
            } else {
                this.removeCartOverlay();
            }
        }
    },
    
    // Função para criar overlay do carrinho
    createCartOverlay: function() {
        const overlay = document.createElement('div');
        overlay.className = 'cart-overlay active';
        overlay.onclick = () => this.toggleCart();
        document.body.appendChild(overlay);
    },
    
    // Função para remover overlay do carrinho
    removeCartOverlay: function() {
        const overlay = document.querySelector('.cart-overlay');
        if (overlay) {
            overlay.remove();
        }
    },
    
    // Função para limpar carrinho
    clearCart: function() {
        this.cart = [];
        this.updateCart();
        this.saveCart();
    },
    
    // Função para animação de item adicionado
    showAddedToCartAnimation: function() {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
        `;
        notification.innerHTML = '<i class="fas fa-check-circle"></i> Item adicionado ao carrinho!';
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },
    
    // Função para salvar carrinho no localStorage
    saveCart: function() {
        localStorage.setItem('restaurante_cart', JSON.stringify(this.cart));
    },
    
    // Função para carregar carrinho do localStorage
    loadCart: function() {
        const savedCart = localStorage.getItem('restaurante_cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
        }
    },
    
    // Função para redimensionamento da janela
    handleResize: function() {
        if (window.innerWidth > 768) {
            this.removeCartOverlay();
        }
    }
};

// Funções globais para compatibilidade
function addToCart(itemName, price) {
    CartModule.addToCart(itemName, price);
}

function toggleCart() {
    CartModule.toggleCart();
}

// Exportar módulo para uso global
window.CartModule = CartModule;

