const PixModule = {
    // Chave para pagamento PIX (ex: CPF, telefone, e-mail, ou EVP)
    pixPaymentKey: '22801230880',
    
    // Dados do recebedor
    pixName: 'Bruno Mariano Silva',
    pixCity: 'Joinville',
    
    // Número para WhatsApp (usar para enviar comprovante)
    whatsappNumber: '47991597258',
    
    // Função para gerar payload PIX completo para pagamento
    generatePixPayload: function(value) {
        const merchantName = this.pixName.toUpperCase();
        const merchantCity = this.pixCity.toUpperCase();
        const txid = this.generateTxId();
        const amount = value.toFixed(2);

        const emv = (id, val) => id + val.length.toString().padStart(2, '0') + val;

        // Merchant Account Information (ID 26)
        const gui = emv("00", "BR.GOV.BCB.PIX");
        const key = emv("01", this.pixPaymentKey);
        const description = emv("02", "Pagamento"); // Opcional
        const merchantAccountInfo = gui + key + description;
        const field26 = emv("26", merchantAccountInfo);

        // Payload completo
        const payload =
            emv("00", "01") + // Payload Format Indicator
            field26 +
            emv("52", "0000") + // Merchant Category Code (sem categoria)
            emv("53", "986") +  // Moeda BRL
            emv("54", amount) + // Valor
            emv("58", "BR") +   // País
            emv("59", merchantName) +
            emv("60", merchantCity) +
            emv("62", emv("05", txid)); // Dados adicionais com txid

        // CRC16 (ID 63)
        const fullPayload = payload + "6304";
        const crc = this.calculateCRC16(fullPayload);
        return fullPayload + crc;
    },
    
    generateTxId: function() {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return uuid.replace(/-/g, '').toUpperCase();
    },
    
    calculateCRC16: function(data) {
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
    
    showPixModal: function(totalValue, orderData = null) {
        const pixPayload = this.generatePixPayload(totalValue);
        
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
                                    <strong>Chave:</strong> ${this.pixPaymentKey}
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
        
        const existingModal = document.getElementById("pixModal");
        if (existingModal) existingModal.remove();
        
        document.body.insertAdjacentHTML("beforeend", pixModalHtml);
        
        const pixModal = new bootstrap.Modal(document.getElementById("pixModal"));
        pixModal.show();
        
        document.getElementById("pixModal").addEventListener("hidden.bs.modal", function () {
            this.remove();
        });
    },
    
    copyPixPayload: function() {
        const pixPayloadTextarea = document.getElementById("pixPayload");
        pixPayloadTextarea.select();
        pixPayloadTextarea.setSelectionRange(0, 99999);
        try {
            document.execCommand("copy");
            this.showNotification("Código PIX copiado! Cole no seu app bancário.", "success");
        } catch {
            navigator.clipboard.writeText(pixPayloadTextarea.value).then(() => {
                this.showNotification("Código PIX copiado! Cole no seu app bancário.", "success");
            }).catch(() => {
                this.showNotification("Erro ao copiar código", "error");
            });
        }
    },
    
    sendWhatsAppMessage: function(orderData = null) {
        let message = `🏪 *DOCE ENCANTO* 🏪\n\n`;
        
        if (orderData && orderData.items && orderData.items.length > 0) {
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
            message += `💰 Realizarei o pagamento via PIX no valor de R$ ${window.cartTotal ? window.cartTotal.toFixed(2) : '0.00'}\n\n`;
        }
        
        message += `👤 Recebedor: ${this.pixName}\n`;
        message += `📱 Chave PIX: ${this.pixPaymentKey}\n\n`;
        message += `📄 Segue em anexo o comprovante de pagamento.\n\n`;
        message += `⏰ Aguardo confirmação do pedido!`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/55${this.whatsappNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, "_blank");
    },
    
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
        setTimeout(() => { notification.style.transform = "translateX(0)"; }, 100);
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

window.PixModule = PixModule;
