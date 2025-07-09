// Módulo PIX - Funcionalidades de pagamento via PIX
const PixModule = {
    // Número PIX padrão
    pixNumber: '47991597258',
    
    // Função para gerar QR Code PIX
    generatePixQRCode: function(value, pixKey) {
        // Gerar payload PIX simplificado
        const payload = this.generatePixPayload(pixKey, value);
        
        // Usar API do QR Server para gerar QR Code
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`;
        
        return qrCodeUrl;
    },
    
    // Função para gerar payload PIX básico
    generatePixPayload: function(pixKey, value) {
        // Payload PIX simplificado para demonstração
        // Em produção, usar biblioteca específica para PIX
        const merchantName = "DOCE ENCANTO";
        const merchantCity = "SAO PAULO";
        const txid = this.generateTxId();
        
        // Formato básico do payload PIX
        let payload = "00020126";
        payload += "580014BR.GOV.BCB.PIX";
        payload += `01${pixKey.length.toString().padStart(2, '0')}${pixKey}`;
        payload += `52040000`;
        payload += `5303986`;
        payload += `54${value.toFixed(2).replace('.', '').padStart(10, '0')}`;
        payload += `5802BR`;
        payload += `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`;
        payload += `60${merchantCity.length.toString().padStart(2, '0')}${merchantCity}`;
        payload += `62${(4 + txid.length).toString().padStart(2, '0')}05${txid.length.toString().padStart(2, '0')}${txid}`;
        payload += "6304";
        
        // Calcular CRC16 (simplificado)
        const crc = this.calculateCRC16(payload);
        payload += crc;
        
        return payload;
    },
    
    // Função para gerar ID da transação
    generateTxId: function() {
        return Math.random().toString(36).substring(2, 15);
    },
    
    // Função simplificada para calcular CRC16
    calculateCRC16: function(data) {
        // Implementação simplificada do CRC16
        // Em produção, usar biblioteca específica
        let crc = 0xFFFF;
        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc = crc << 1;
                }
                crc &= 0xFFFF;
            }
        }
        return crc.toString(16).toUpperCase().padStart(4, '0');
    },
    
    // Função para mostrar modal PIX
    showPixModal: function(totalValue) {
        const qrCodeUrl = this.generatePixQRCode(totalValue, this.pixNumber);
        
        // Criar modal PIX
        const pixModalHtml = `
            <div class="modal fade" id="pixModal" tabindex="-1" aria-labelledby="pixModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="pixModalLabel">
                                <i class="fab fa-pix me-2"></i>Pagamento via PIX
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div class="pix-info mb-4">
                                <h6 class="text-primary">Valor a pagar:</h6>
                                <h4 class="text-success fw-bold">R$ ${totalValue.toFixed(2)}</h4>
                            </div>
                            
                            <div class="pix-qr-section mb-4">
                                <h6 class="mb-3">Escaneie o QR Code:</h6>
                                <div class="qr-code-container">
                                    <img src="${qrCodeUrl}" alt="QR Code PIX" class="img-fluid" style="max-width: 200px; border: 2px solid #dee2e6; border-radius: 10px;">
                                </div>
                            </div>
                            
                            <div class="pix-copy-section mb-4">
                                <h6 class="mb-2">Ou copie o código PIX:</h6>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="pixCode" value="${this.pixNumber}" readonly>
                                    <button class="btn btn-outline-primary" type="button" onclick="PixModule.copyPixCode()">
                                        <i class="fas fa-copy"></i> Copiar
                                    </button>
                                </div>
                            </div>
                            
                            <div class="pix-instructions">
                                <div class="alert alert-info">
                                    <h6 class="alert-heading">
                                        <i class="fas fa-info-circle"></i> Instruções:
                                    </h6>
                                    <ol class="mb-0 text-start">
                                        <li>Abra o app do seu banco</li>
                                        <li>Escaneie o QR Code ou cole o código PIX</li>
                                        <li>Confirme o pagamento</li>
                                        <li>Envie o comprovante via WhatsApp</li>
                                    </ol>
                                </div>
                            </div>
                            
                            <div class="whatsapp-section mt-3">
                                <button class="btn btn-success btn-lg w-100" onclick="PixModule.sendWhatsAppMessage()">
                                    <i class="fab fa-whatsapp me-2"></i>
                                    Enviar Comprovante via WhatsApp
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remover modal anterior se existir
        const existingModal = document.getElementById('pixModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Adicionar modal ao DOM
        document.body.insertAdjacentHTML('beforeend', pixModalHtml);
        
        // Mostrar modal
        const pixModal = new bootstrap.Modal(document.getElementById('pixModal'));
        pixModal.show();
        
        // Remover modal do DOM quando fechado
        document.getElementById('pixModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
    },
    
    // Função para copiar código PIX
    copyPixCode: function() {
        const pixCodeInput = document.getElementById('pixCode');
        pixCodeInput.select();
        pixCodeInput.setSelectionRange(0, 99999); // Para dispositivos móveis
        
        try {
            document.execCommand('copy');
            this.showNotification('Código PIX copiado!', 'success');
        } catch (err) {
            // Fallback para navegadores mais novos
            navigator.clipboard.writeText(this.pixNumber).then(() => {
                this.showNotification('Código PIX copiado!', 'success');
            }).catch(() => {
                this.showNotification('Erro ao copiar código', 'error');
            });
        }
    },
    
    // Função para enviar mensagem WhatsApp
    sendWhatsAppMessage: function() {
        const message = `🏪 *DOCE ENCANTO* 🏪\n\n` +
                       `💰 Realizei o pagamento via PIX no valor de R$ ${window.cartTotal.toFixed(2)}\n\n` +
                       `📱 Chave PIX: ${this.pixNumber}\n\n` +
                       `📄 Segue em anexo o comprovante de pagamento.\n\n` +
                       `⏰ Aguardo confirmação do pedido!`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/55${this.pixNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
    },
    
    // Função para mostrar notificações
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            max-width: 300px;
        `;
        
        notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
        
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
    }
};

// Exportar módulo para uso global
window.PixModule = PixModule;

