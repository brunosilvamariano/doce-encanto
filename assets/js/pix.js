// Módulo PIX - Funcionalidades de pagamento via PIX
const PixModule = {
    // Dados do recebedor PIX
    pixKey: '33dcc188-1549-49ec-8c5d-917a20d8242e',
    pixName: 'Doce Encanto',
    pixCity: 'JOINVILLE',
    
    // Função para gerar payload PIX completo
    generatePixPayload: function(value) {
        const merchantName = this.pixName.toUpperCase();
        const merchantCity = this.pixCity.toUpperCase();
        const txid = this.generateTxId();
        
        // Construir payload PIX seguindo o padrão EMV QR Code
        let payload = '';
        
        // Payload Format Indicator (ID 00)
        payload += '000201';
        
        // Point of Initiation Method (ID 01) - Static QR Code
        payload += '010212';
        
        // Merchant Account Information (ID 26) - PIX
        const pixData = this.buildPixData();
        payload += `26${pixData.length.toString().padStart(2, '0')}${pixData}`;
        
        // Merchant Category Code (ID 52)
        payload += '52040000';
        
        // Transaction Currency (ID 53) - BRL (986)
        payload += '5303986';
        
        // Transaction Amount (ID 54)
        const amount = value.toFixed(2);
        payload += `54${amount.length.toString().padStart(2, '0')}${amount}`;
        
        // Country Code (ID 58)
        payload += '5802BR';
        
        // Merchant Name (ID 59)
        payload += `59${merchantName.length.toString().padStart(2, '0')}${merchantName}`;
        
        // Merchant City (ID 60)
        payload += `60${merchantCity.length.toString().padStart(2, '0')}${merchantCity}`;
        
        // Additional Data Field Template (ID 62)
        const additionalData = `05${txid.length.toString().padStart(2, '0')}${txid}`;
        payload += `62${additionalData.length.toString().padStart(2, '0')}${additionalData}`;
        
        // CRC16 (ID 63)
        const payloadForCRC = payload + '6304';
        const crc = this.calculateCRC16(payloadForCRC);
        payload += `6304${crc}`;
        
        return payload;
    },
    
    // Função para construir dados PIX
    buildPixData: function() {
        // GUI (Globally Unique Identifier) para PIX
        const gui = '0014BR.GOV.BCB.PIX';
        
        // Chave PIX (ID 01)
        const pixKeyData = `01${this.pixKey.length.toString().padStart(2, '0')}${this.pixKey}`;
        
        return gui + pixKeyData;
    },
    
    // Função para gerar ID da transação
    generateTxId: function() {
        // Gerar um ID de transação de 25 caracteres (padrão PIX)
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 25; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    // Função para calcular CRC16 (CCITT)
    calculateCRC16: function(data) {
        let crc = 0xFFFF;
        const polynomial = 0x1021;

        for (let i = 0; i < data.length; i++) {
            crc ^= (data.charCodeAt(i) << 8);
            for (let j = 0; j < 8; j++) {
                if ((crc & 0x8000) !== 0) {
                    crc = ((crc << 1) ^ polynomial) & 0xFFFF;
                } else {
                    crc = (crc << 1) & 0xFFFF;
                }
            }
        }
        return crc.toString(16).toUpperCase().padStart(4, '0');
    },
    
    // Função para mostrar modal PIX
    showPixModal: function(totalValue, orderData = null) {
        const pixPayload = this.generatePixPayload(totalValue);
        
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
                            
                            <div class="pix-key-section mb-4">
                                <h6 class="mb-3">Código PIX (Copie e Cole):</h6>
                                <div class="input-group mb-2">
                                    <textarea class="form-control" id="pixPayload" rows="4" readonly style="font-family: monospace; font-size: 12px; word-break: break-all;">${pixPayload}</textarea>
                                    <button class="btn btn-outline-primary" type="button" onclick="PixModule.copyPixPayload()">
                                        <i class="fas fa-copy"></i> Copiar
                                    </button>
                                </div>
                                <p class="text-muted mt-2">
                                    <strong>Recebedor:</strong> ${this.pixName}<br>
                                    <strong>Chave PIX:</strong> ${this.pixKey}
                                </p>
                            </div>
                            
                            <div class="pix-instructions">
                                <div class="alert alert-info">
                                    <h6 class="alert-heading">
                                        <i class="fas fa-info-circle"></i> Instruções:
                                    </h6>
                                    <ol class="mb-0 text-start">
                                        <li>Abra o app do seu banco</li>
                                        <li>Escolha a opção "PIX Copia e Cola"</li>
                                        <li>Cole o código PIX copiado acima</li>
                                        <li>Confirme os dados e o valor de R$ ${totalValue.toFixed(2)}</li>
                                        <li>Finalize o pagamento</li>
                                        <li>Envie o comprovante via WhatsApp</li>
                                    </ol>
                                </div>
                            </div>
                            
                            <div class="whatsapp-section mt-3">
                                <button class="btn btn-success btn-lg w-100" onclick="PixModule.sendWhatsAppMessage(${JSON.stringify(orderData).replace(/"/g, '&quot;')})">
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
        const existingModal = document.getElementById("pixModal");
        if (existingModal) {
            existingModal.remove();
        }
        
        // Adicionar modal ao DOM
        document.body.insertAdjacentHTML("beforeend", pixModalHtml);
        
        // Mostrar modal
        const pixModal = new bootstrap.Modal(document.getElementById("pixModal"));
        pixModal.show();
        
        // Remover modal do DOM quando fechado
        document.getElementById("pixModal").addEventListener("hidden.bs.modal", function () {
            this.remove();
        });
    },
    
    // Função para copiar payload PIX
    copyPixPayload: function() {
        const pixPayloadTextarea = document.getElementById("pixPayload");
        pixPayloadTextarea.select();
        pixPayloadTextarea.setSelectionRange(0, 99999); // Para dispositivos móveis
        
        try {
            // Tentar usar a API moderna primeiro
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(pixPayloadTextarea.value).then(() => {
                    this.showNotification("Código PIX copiado! Cole no seu app bancário.", "success");
                }).catch(() => {
                    // Fallback para método antigo
                    this.fallbackCopy(pixPayloadTextarea);
                });
            } else {
                // Fallback para método antigo
                this.fallbackCopy(pixPayloadTextarea);
            }
        } catch (err) {
            this.showNotification("Erro ao copiar código", "error");
        }
    },
    
    // Função fallback para copiar
    fallbackCopy: function(element) {
        try {
            document.execCommand("copy");
            this.showNotification("Código PIX copiado! Cole no seu app bancário.", "success");
        } catch (err) {
            this.showNotification("Erro ao copiar código", "error");
        }
    },
    
    // Função para enviar mensagem WhatsApp
    sendWhatsAppMessage: function(orderData = null) {
        let message = `🏪 *DOCE ENCANTO* 🏪\n\n`;
        
        if (orderData && orderData.items && orderData.items.length > 0) {
            // Incluir informações do pedido
            message += `💰 Realizei o pagamento via PIX no valor de R$ ${orderData.total.toFixed(2)}\n\n`;
            message += `📋 *ITENS DO PEDIDO:*\n`;
            
            orderData.items.forEach(item => {
                const itemName = window.CartModule ? window.CartModule.getItemDisplayName(item.name) : item.name;
                message += `• ${item.quantity}x ${itemName} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
            });
            
            message += `\n📍 *DADOS PARA ENTREGA:*\n`;
            message += `👤 Nome: ${orderData.name}\n`;
            message += `🏠 Endereço: ${orderData.address}\n`;
            message += `💳 Pagamento: PIX\n\n`;
        } else {
            // Mensagem padrão (fallback)
            message += `💰 Realizei o pagamento via PIX no valor de R$ ${window.cartTotal ? window.cartTotal.toFixed(2) : '0.00'}\n\n`;
        }
        
        message += `👤 Recebedor: ${this.pixName}\n`;
        message += `📱 Chave PIX: ${this.pixKey}\n\n`;
        message += `📄 Segue em anexo o comprovante de pagamento.\n\n`;
        message += `⏰ Aguardo confirmação do pedido!`;
        
        const encodedMessage = encodeURIComponent(message);
        // Usar número de telefone genérico para WhatsApp
        const whatsappUrl = `https://wa.me/5547991597258?text=${encodedMessage}`;
        
        window.open(whatsappUrl, "_blank");
    },
    
    // Função para mostrar notificações
    showNotification: function(message, type = "info") {
        const notification = document.createElement("div");
        const bgColor = type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#17a2b8";
        
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
        
        notification.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i> ${message}`;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = "translateX(0)";
        }, 100);
        
        // Remover após 4 segundos
        setTimeout(() => {
            notification.style.transform = "translateX(400px)";
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
};

// Exportar módulo para uso global
window.PixModule = PixModule;