// Módulo PIX - Funcionalidades de pagamento via PIX
const PixModule = {
    // Dados do recebedor PIX
    pixKey: '33dcc188-1549-49ec-8c5d-917a20d8242e',
    pixName: 'Doce Encanto',
    pixCity: 'JOINVILLE',
    
    // Função para gerar payload PIX completo
    // Função para gerar payload PIX completo (corrigida)
generatePixPayload: function(value) {
    function formatEMV(id, value) {
        const length = value.length.toString().padStart(2, '0');
        return `${id}${length}${value}`;
    }

    const merchantName = this.pixName.toUpperCase().slice(0, 25);
    const merchantCity = this.pixCity.toUpperCase().slice(0, 15);
    const txid = this.generateTxId();
    const amount = value.toFixed(2);

    const gui = formatEMV("00", "BR.GOV.BCB.PIX");
    const key = formatEMV("01", this.pixKey);
    const merchantAccountInfo = formatEMV("26", gui + key);

    let payload = '';
    payload += formatEMV("00", "01");        // Payload Format Indicator
    payload += formatEMV("01", "12");        // Point of Initiation Method (static)
    payload += merchantAccountInfo;          // Merchant Account Info
    payload += formatEMV("52", "0000");      // Merchant Category Code
    payload += formatEMV("53", "986");       // Transaction Currency (BRL)
    payload += formatEMV("54", amount);      // Transaction Amount
    payload += formatEMV("58", "BR");        // Country Code
    payload += formatEMV("59", merchantName); // Merchant Name
    payload += formatEMV("60", merchantCity); // Merchant City
    payload += formatEMV("62", formatEMV("05", txid)); // TXID

    // CRC16 (ID 63)
    const payloadForCRC = payload + '6304';

    const crc = this.calculateCRC16(payloadForCRC);
    payload += '6304' + crc;

    return payload;
},

    
    // Função para gerar ID da transação
    generateTxId: function() {
        // O txid deve ter entre 26 e 35 caracteres alfanuméricos (a-z, A-Z, 0-9)
        // Gerar um UUID v4 e remover os hífens para ter um txid válido
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return uuid.replace(/-/g, '').toUpperCase();
    },
    
    // Função para calcular CRC16
    calculateCRC16: function(data) {
        let crc = 0xFFFF;
        const polynomial = 0x1021;

        for (let i = 0; i < data.length; i++) {
            crc ^= (data.charCodeAt(i) << 8);
            for (let j = 0; j < 8; j++) {
                if ((crc & 0x8000) !== 0) {
                    crc = ((crc << 1) ^ polynomial);
                } else {
                    crc <<= 1;
                }
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
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
                                <h6 class="mb-3">Chave PIX (Copie e Cole):</h6>
                                <div class="input-group mb-2">
                                    <textarea class="form-control" id="pixPayload" rows="4" readonly style="font-family: monospace; font-size: 12px;">${pixPayload}</textarea>
                                    <button class="btn btn-outline-primary" type="button" onclick="PixModule.copyPixPayload()">
                                        <i class="fas fa-copy"></i> Copiar
                                    </button>
                                </div>
                                <p class="text-muted mt-2">
                                    <strong>Recebedor:</strong> ${this.pixName}<br>
                                    <strong>Chave:</strong> ${this.pixKey}
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
                                        <li>Confirme o pagamento de R$ ${totalValue.toFixed(2)}</li>
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
            document.execCommand("copy");
            this.showNotification("Código PIX copiado! Cole no seu app bancário.", "success");
        } catch (err) {
            // Fallback para navegadores mais novos
            navigator.clipboard.writeText(pixPayloadTextarea.value).then(() => {
                this.showNotification("Código PIX copiado! Cole no seu app bancário.", "success");
            }).catch(() => {
                this.showNotification("Erro ao copiar código", "error");
            });
        }
    },
    
    // Função para enviar mensagem WhatsApp
    sendWhatsAppMessage: function(orderData = null) {
        let message = `🏪 *DOCE ENCANTO* 🏪\n\n`;
        
        if (orderData && orderData.items && orderData.items.length > 0) {
            // Incluir informações do pedido
            message += `💰 Realizarei o pagamento via PIX no valor de R$ ${orderData.total.toFixed(2)}\n\n`;
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
            message += `💰 Realizarei o pagamento via PIX no valor de R$ ${window.cartTotal ? window.cartTotal.toFixed(2) : '0.00'}\n\n`;
        }
        
        message += `👤 Recebedor: ${this.pixName}\n`;
        message += `📱 Chave PIX: ${this.pixKey}\n\n`;
        message += `📄 Vou enviar o comprovante de pagamento.\n\n`;
        message += `⏰ Assim que enviar o anexo, Aguardo confirmação do pedido!`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/55${this.pixKey}?text=${encodedMessage}`;
        
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