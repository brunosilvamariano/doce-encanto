// Módulo de Status - Funcionalidade para exibir status de funcionamento em tempo real
const StatusModule = {
    // Configuração dos horários de funcionamento
    openingHours: {
        // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
        0: { open: '10:00', close: '17:00' }, // Domingo
        1: { open: '09:00', close: '18:00' }, // Segunda
        2: { open: '09:00', close: '18:00' }, // Terça
        3: { open: '09:00', close: '18:00' }, // Quarta
        4: { open: '09:00', close: '18:00' }, // Quinta
        5: { open: '09:00', close: '19:00' }, // Sexta
        6: { open: '09:00', close: '19:00' }  // Sábado
    },
    
    // Função para converter horário string em minutos
    timeToMinutes: function(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    },
    
    // Função para verificar se está aberto
    isOpen: function() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const todayHours = this.openingHours[dayOfWeek];
        const openTime = this.timeToMinutes(todayHours.open);
        const closeTime = this.timeToMinutes(todayHours.close);
        
        return currentTime >= openTime && currentTime < closeTime;
    },
    
    // Função para obter próximo horário de abertura
    getNextOpenTime: function() {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        // Verificar se ainda vai abrir hoje
        const todayHours = this.openingHours[currentDay];
        const todayOpenTime = this.timeToMinutes(todayHours.open);
        const todayCloseTime = this.timeToMinutes(todayHours.close);
        
        // Se for madrugada (antes das 6:00), considerar como próximo dia
        const isMidnight = now.getHours() < 6;
        
        // Se ainda não passou do horário de abertura de hoje E não é madrugada
        if (currentTime < todayOpenTime && !isMidnight) {
            return {
                day: 'hoje',
                time: todayHours.open,
                isToday: true
            };
        }
        
        // Se já passou do horário de fechamento de hoje OU é madrugada, procurar próximo dia
        if (currentTime >= todayCloseTime || isMidnight) {
            // Procurar próximo dia de abertura (amanhã)
            const nextDay = (currentDay + 1) % 7;
            const nextDayHours = this.openingHours[nextDay];
            
            return {
                day: 'amanhã',
                time: nextDayHours.open,
                isToday: false,
                dayName: this.getDayName(nextDay)
            };
        }
        
        // Caso padrão (não deveria chegar aqui se a lógica estiver correta)
        const nextDay = (currentDay + 1) % 7;
        const nextDayHours = this.openingHours[nextDay];
        
        return {
            day: 'amanhã',
            time: nextDayHours.open,
            isToday: false,
            dayName: this.getDayName(nextDay)
        };
    },
    
    // Função para obter horário de fechamento de hoje
    getTodayCloseTime: function() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        return this.openingHours[dayOfWeek].close;
    },
    
    // Função para obter nome do dia
    getDayName: function(dayIndex) {
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return days[dayIndex];
    },
    
    // Função para atualizar o status na interface
    updateStatusDisplay: function() {
        const statusElement = document.getElementById('restaurantStatus');
        const statusBadge = document.getElementById('statusBadge');
        const statusText = document.getElementById('statusText');
        const statusDetails = document.getElementById('statusDetails');
        
        if (!statusElement) return;
        
        const isCurrentlyOpen = this.isOpen();
        
        if (isCurrentlyOpen) {
            // Restaurante aberto
            statusBadge.className = 'status-badge open';
            statusBadge.innerHTML = '<i class="fas fa-circle"></i> ABERTO';
            statusText.textContent = 'Estamos abertos! Faça seu pedido agora.';
            
            const closeTime = this.getTodayCloseTime();
            statusDetails.innerHTML = `<i class="fas fa-clock"></i> Fechamos às ${closeTime}`;
            
            // Habilitar botões de pedido
            this.enableOrderButtons(true);
        } else {
            // Restaurante fechado
            statusBadge.className = 'status-badge closed';
            statusBadge.innerHTML = '<i class="fas fa-circle"></i> FECHADO';
            statusText.textContent = 'Estamos fechados no momento.';
            
            const nextOpen = this.getNextOpenTime();
            statusDetails.innerHTML = `<i class="fas fa-clock"></i> Abrimos ${nextOpen.day} às ${nextOpen.time}`;
            
            // Se for amanhã, adicionar o nome do dia
            if (!nextOpen.isToday && nextOpen.dayName) {
                statusDetails.innerHTML = `<i class="fas fa-clock"></i> Abrimos ${nextOpen.day} (${nextOpen.dayName}) às ${nextOpen.time}`;
            }
            
            // Desabilitar botões de pedido
            this.enableOrderButtons(false);
        }
        
        // Adicionar animação de entrada
        statusElement.style.opacity = '0';
        statusElement.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            statusElement.style.transition = 'all 0.3s ease';
            statusElement.style.opacity = '1';
            statusElement.style.transform = 'translateY(0)';
        }, 100);
    },
    
    // Função para habilitar/desabilitar botões de pedido
    enableOrderButtons: function(enable) {
        const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
        const cartButton = document.querySelector('.header-cart-button');
        const checkoutButton = document.querySelector('.checkout-btn');
        
        addToCartButtons.forEach(button => {
            if (enable) {
                button.disabled = false;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
                button.title = '';
            } else {
                button.disabled = true;
                button.style.opacity = '0.5';
                button.style.cursor = 'not-allowed';
                button.title = 'Restaurante fechado';
            }
        });
        
        if (cartButton) {
            if (enable) {
                cartButton.style.opacity = '1';
                cartButton.style.cursor = 'pointer';
            } else {
                cartButton.style.opacity = '0.8';
                cartButton.style.cursor = 'default';
            }
        }
        
        if (checkoutButton) {
            if (enable) {
                checkoutButton.disabled = false;
                checkoutButton.style.opacity = '1';
            } else {
                checkoutButton.disabled = true;
                checkoutButton.style.opacity = '0.5';
            }
        }
    },
    
    // Função para verificar se pode fazer pedido
    canOrder: function() {
        return this.isOpen();
    },
    
    // Função para mostrar alerta quando tentar fazer pedido fechado
    showClosedAlert: function() {
        const nextOpen = this.getNextOpenTime();
        let alertText = `Abrimos ${nextOpen.day} às ${nextOpen.time}`;
        
        // Se for amanhã, adicionar o nome do dia
        if (!nextOpen.isToday && nextOpen.dayName) {
            alertText = `Abrimos ${nextOpen.day} (${nextOpen.dayName}) às ${nextOpen.time}`;
        }
        
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
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
        alertDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                <i class="fas fa-clock"></i>
                <strong>Restaurante Fechado</strong>
            </div>
            <div style="font-size: 0.9em; opacity: 0.9;">
                ${alertText}
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        // Animar entrada
        setTimeout(() => {
            alertDiv.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após 4 segundos
        setTimeout(() => {
            alertDiv.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (document.body.contains(alertDiv)) {
                    document.body.removeChild(alertDiv);
                }
            }, 300);
        }, 4000);
    },
    
    // Função para inicializar o módulo
    init: function() {
        // Atualizar status imediatamente
        this.updateStatusDisplay();
        
        // Atualizar status a cada minuto
        setInterval(() => {
            this.updateStatusDisplay();
        }, 60000); // 60 segundos
        
        // Interceptar cliques nos botões de adicionar ao carrinho
        document.addEventListener('click', (event) => {
            if (event.target.closest('.btn-add-to-cart') && !this.canOrder()) {
                event.preventDefault();
                event.stopPropagation();
                this.showClosedAlert();
                return false;
            }
            
            if (event.target.closest('.header-cart-button') && !this.canOrder()) {
                event.preventDefault();
                event.stopPropagation();
                this.showClosedAlert();
                return false;
            }
        }, true);
        
        console.log('🕒 Módulo de Status inicializado - Monitoramento em tempo real ativo');
    }
};

// Exportar módulo para uso global
window.StatusModule = StatusModule;

