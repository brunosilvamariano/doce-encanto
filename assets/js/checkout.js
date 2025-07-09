// Módulo de Checkout - Funcionalidades de finalização de pedido
const CheckoutModule = {
    // Função para abrir modal de checkout
    openCheckoutModal: function() {
        // Verificar se o restaurante está aberto
        if (window.StatusModule && !window.StatusModule.canOrder()) {
            window.StatusModule.showClosedAlert();
            return;
        }
        
        if (window.cart.length === 0) {
            alert("Seu carrinho está vazio!");
            return;
        }
        
        // Atualizar resumo do pedido no modal
        this.updateOrderSummary();
        
        // Abrir modal
        const checkoutModal = new bootstrap.Modal(document.getElementById("checkoutModal"));
        checkoutModal.show();
        
        // Fechar carrinho
        if (document.getElementById('cartSidebar').classList.contains("open")) {
            CartModule.toggleCart();
        }
    },
    
    // Função para atualizar resumo do pedido no modal
    updateOrderSummary: function() {
        const orderSummary = document.getElementById('orderSummary');
        const modalTotal = document.getElementById('modalTotal');
        
        if (window.cart.length === 0) {
            orderSummary.innerHTML = '<p class="text-muted">Nenhum item no carrinho</p>';
            modalTotal.textContent = '0.00';
            return;
        }
        
        orderSummary.innerHTML = window.cart.map(item => `
            <div class="order-item d-flex justify-content-between align-items-center mb-2">
                <div>
                    <strong>${CartModule.getItemDisplayName(item.name)}</strong>
                    <br>
                    <small class="text-muted">${item.quantity}x R$ ${item.price.toFixed(2)}</small>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <strong>R$ ${(item.price * item.quantity).toFixed(2)}</strong>
                    <button class="btn btn-sm btn-outline-danger" onclick="CheckoutModule.removeFromCartAndUpdateModal('${item.name}')" title="Remover item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        modalTotal.textContent = window.cartTotal.toFixed(2);
    },
    
    // Função para remover item do carrinho e atualizar modal
    removeFromCartAndUpdateModal: function(itemName) {
        CartModule.removeFromCart(itemName);
        this.updateOrderSummary();
        
        // Se o carrinho ficar vazio, fechar o modal
        if (window.cart.length === 0) {
            const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            if (checkoutModal) {
                checkoutModal.hide();
            }
            alert('Carrinho vazio! O modal foi fechado.');
        }
    },
    
    // Função para finalizar pedido
    finalizeOrder: function() {
        // Validar formulário
        const form = document.getElementById('checkoutForm');
        const name = document.getElementById('customerName').value.trim();
        const cep = document.getElementById('customerCep').value.trim();
        const street = document.getElementById('customerStreet').value.trim();
        const neighborhood = document.getElementById('customerNeighborhood').value.trim();
        const number = document.getElementById('customerNumber').value.trim();
        const city = document.getElementById('customerCity').value.trim();
        const state = document.getElementById('customerState').value.trim();
        const complement = document.getElementById('customerComplement').value.trim();
        const paymentMethod = document.getElementById('paymentMethod').value;
        
        // Verificar se todos os campos obrigatórios estão preenchidos
        if (!name || !cep || !street || !neighborhood || !number || !city || !state || !paymentMethod) {
            alert('Por favor, preencha todos os campos obrigatórios!');
            return;
        }
        
        // Validar CEP (formato básico)
        const cepRegex = /^\d{5}-?\d{3}$/;
        if (!cepRegex.test(cep)) {
            alert('Por favor, insira um CEP válido (formato: 12345-678)!');
            return;
        }
        
        // Criar endereço completo
        let enderecoCompleto = `${street}, ${number}`;
        if (complement) {
            enderecoCompleto += `, ${complement}`;
        }
        enderecoCompleto += `, ${neighborhood}, ${city} - ${state}, CEP: ${cep}`;
        
        // Salvar dados do pedido globalmente para uso no PIX
        window.orderData = {
            name,
            address: enderecoCompleto,
            paymentMethod,
            total: window.cartTotal,
            items: [...window.cart]
        };
        
        // Verificar se o pagamento é PIX
        if (paymentMethod === 'pix') {
            // Fechar modal de checkout
            const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            checkoutModal.hide();
            
            // Mostrar modal PIX
            setTimeout(() => {
                PixModule.showPixModal(window.cartTotal);
            }, 500);
            
            return;
        }
        
        // Para outros métodos de pagamento, continuar com o fluxo normal
        this.sendWhatsAppOrder(name, enderecoCompleto, paymentMethod);
        
        // Limpar carrinho e fechar modal
        CartModule.clearCart();
        
        // Fechar modal
        const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
        checkoutModal.hide();
        
        // Limpar formulário
        form.reset();
        
        // Mostrar mensagem de sucesso
        this.showSuccessMessage();
    },
    
    // Função para enviar pedido via WhatsApp
    sendWhatsAppOrder: function(name, address, paymentMethod) {
        // Criar mensagem do pedido para WhatsApp
        let message = '🍰 *NOVO PEDIDO - DOCE ENCANTO* 🍰\n\n';
        message += '📋 *ITENS DO PEDIDO:*\n';
        
        window.cart.forEach(item => {
            message += `• ${item.quantity}x ${CartModule.getItemDisplayName(item.name)} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
        });
        
        message += `\n💰 *TOTAL: R$ ${window.cartTotal.toFixed(2)}*\n\n`;
        message += '📍 *DADOS PARA ENTREGA:*\n';
        message += `👤 Nome: ${name}\n`;
        message += `🏠 Endereço: ${address}\n`;
        message += `💳 Pagamento: ${this.getPaymentMethodName(paymentMethod)}\n\n`;
        message += '⏰ Aguardando confirmação do pedido!';
        
        // Codificar mensagem para WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/5547991597258?text=${encodedMessage}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
    },
    
    // Função para obter nome da forma de pagamento
    getPaymentMethodName: function(method) {
        const methods = {
            'pix': 'PIX',
            'credito': 'Cartão de Crédito',
            'debito': 'Cartão de Débito'
        };
        return methods[method] || method;
    },
    
    // Função para mostrar mensagem de sucesso
    showSuccessMessage: function() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            max-width: 300px;
        `;
        notification.innerHTML = '<i class="fas fa-check-circle"></i> Pedido enviado com sucesso! Aguarde a confirmação via WhatsApp.';
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
};

// Funções globais para compatibilidade
function openCheckoutModal() {
    CheckoutModule.openCheckoutModal();
}

function finalizeOrder() {
    CheckoutModule.finalizeOrder();
}

function removeFromCartAndUpdateModal(itemName) {
    CheckoutModule.removeFromCartAndUpdateModal(itemName);
}

// Exportar módulo para uso global
window.CheckoutModule = CheckoutModule;

