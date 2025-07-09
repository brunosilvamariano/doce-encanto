// Módulo PIX - Funcionalidades de pagamento via PIX
const PixModule = {
    // Dados do recebedor PIX
    pixKey: '33dcc188-1549-49ec-8c5d-917a20d8242e', // sua chave (UUID)
    pixName: 'Doce Encanto',
    pixCity: 'JOINVILLE',

    // Função para gerar payload PIX completo
    generatePixPayload: function (value) {
        const merchantName = this.pixName.toUpperCase();
        const merchantCity = this.pixCity.toUpperCase();
        const txid = this.generateTxId();

        let payload = '';

        // Payload Format Indicator (ID 00)
        payload += '000201';

        // Merchant Account Information (ID 26)
        const gui = '00' + '14' + 'BR.GOV.BCB.PIX';
        const pixKeyData = '01' + this.pixKey.length.toString().padStart(2, '0') + this.pixKey;
        const merchantAccountInformation = gui + pixKeyData;
        const maiLength = merchantAccountInformation.length.toString().padStart(2, '0');
        payload += '26' + maiLength + merchantAccountInformation;

        // Merchant Category Code (ID 52) - padrão: 0000
        payload += '52040000';

        // Transaction Currency (ID 53) - 986 = BRL
        payload += '5303986';

        // Transaction Amount (ID 54)
        const amount = value.toFixed(2);
        payload += '54' + amount.length.toString().padStart(2, '0') + amount;

        // Country Code (ID 58)
        payload += '5802BR';

        // Merchant Name (ID 59)
        payload += '59' + merchantName.length.toString().padStart(2, '0') + merchantName;

        // Merchant City (ID 60)
        payload += '60' + merchantCity.length.toString().padStart(2, '0') + merchantCity;

        // Additional Data Field Template (ID 62) - TXID
        const additionalData = '05' + txid.length.toString().padStart(2, '0') + txid;
        payload += '62' + additionalData.length.toString().padStart(2, '0') + additionalData;

        // CRC16 (ID 63)
        const payloadForCRC = payload + '6304';
        const crc = this.calculateCRC16(payloadForCRC);
        payload += '6304' + crc;

        return payload;
    },

    // Geração de TXID válido
    generateTxId: function () {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return uuid.replace(/-/g, '').toUpperCase();
    },

    // Cálculo do CRC16-CCITT (XModem)
    calculateCRC16: function (data) {
        let crc = 0xFFFF;
        const polynomial = 0x1021;

        for (let i = 0; i < data.length; i++) {
            crc ^= (data.charCodeAt(i) << 8);
            for (let j = 0; j < 8; j++) {
                crc = (crc & 0x8000) ? ((crc << 1) ^ polynomial) : (crc << 1);
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    },

    // Função para copiar payload PIX
    copyPixPayload: function () {
        const pixPayloadTextarea = document.getElementById("pixPayload");
        pixPayloadTextarea.select();
        pixPayloadTextarea.setSelectionRange(0, 99999); // Para dispositivos móveis

        try {
            document.execCommand("copy");
            this.showNotification("Código PIX copiado! Cole no seu app bancário.", "success");
        } catch (err) {
            navigator.clipboard.writeText(pixPayloadTextarea.value).then(() => {
                this.showNotification("Código PIX copiado! Cole no seu app bancário.", "success");
            }).catch(() => {
                this.showNotification("Erro ao copiar código", "error");
            });
        }
    },

    // Função para exibir modal com QR Code / payload
    showPixModal: function (totalValue, orderData = null) {
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
        if (existingModal) existingModal.remove();

        document.body.insertAdjacentHTML("beforeend", pixModalHtml);
        const pixModal = new bootstrap.Modal(document.getElementById("pixModal"));
        pixModal.show();
        document.getElementById("pixModal").addEventListener("hidden.bs.modal", function () {
            this.remove();
        });
    },

    // Enviar mensagem no WhatsApp
    sendWhatsAppMessage: function (orderData = null) {
        let message = `🏪 *${this.pixName.toUpperCase()}* 🏪\n\n`;
        if (orderData && orderData.items) {
            message += `💰 Valor via PIX: R$ ${orderData.total.toFixed(2)}\n\n📋 *PEDIDO:*\n`;
            orderData.items.forEach(item => {
                message += `• ${item.quantity}x ${item.name} - R$ ${(item.quantity * item.price).toFixed(2)}\n`;
            });
            message += `\n📍 *ENTREGA:*\n👤 Nome: ${orderData.name}\n🏠 Endereço: ${orderData.address}\n💳 Pagamento: PIX\n\n`;
        }
        message += `👤 Recebedor: ${this.pixName}\n🔑 Chave PIX: ${this.pixKey}\n📎 Enviarei o comprovante!\n`;
        const url = `https://wa.me/55${this.pixKey}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
    },

    // Notificações simples na tela
    showNotification: function (message, type = "info") {
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
            setTimeout(() => { if (notification) document.body.removeChild(notification); }, 300);
        }, 4000);
    }
};

// Exportar para uso global
window.PixModule = PixModule;
