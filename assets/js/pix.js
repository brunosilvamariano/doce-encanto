const PixModule = {
  pixKey: '33dcc188-1549-49ec-8c5d-917a20d8242e',
  pixName: 'Doce Encanto',
  pixCity: 'JOINVILLE',

  generatePixPayload: function(value) {
    const merchantName = this.pixName.toUpperCase();
    const merchantCity = this.pixCity.toUpperCase();
    const txid = this.generateTxId();

    let payload = '';
    payload += '000201';

    const gui = '0014BR.GOV.BCB.PIX';
    const pixKeyId = '01';
    const pixKeyLength = this.pixKey.length.toString().padStart(2, '0');
    const pixKeyData = `${pixKeyId}${pixKeyLength}${this.pixKey}`;
    const merchantAccountInformation = `${gui}${pixKeyData}`;
    const merchantAccountInformationLength = merchantAccountInformation.length.toString().padStart(2, '0');
    payload += `26${merchantAccountInformationLength}${merchantAccountInformation}`;

    payload += '52040000';
    payload += '5303986';

    const amount = value.toFixed(2);
    payload += '54' + amount.length.toString().padStart(2, '0') + amount;

    payload += '5802BR';
    payload += '59' + merchantName.length.toString().padStart(2, '0') + merchantName;
    payload += '60' + merchantCity.length.toString().padStart(2, '0') + merchantCity;

    const additionalData = '05' + txid.length.toString().padStart(2, '0') + txid;
    payload += '62' + additionalData.length.toString().padStart(2, '0') + additionalData;

    const payloadForCRC = payload + '6304';
    const crc = this.calculateCRC16(payloadForCRC);
    payload += '6304' + crc;

    return payload;
  },

  generateTxId: function() {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    return uuid.replace(/-/g, '').toUpperCase();
  },

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

              <div id="qrcode" class="mb-4"></div>

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

    const existingModal = document.getElementById("pixModal");
    if (existingModal) existingModal.remove();

    document.body.insertAdjacentHTML("beforeend", pixModalHtml);

    const pixModal = new bootstrap.Modal(document.getElementById("pixModal"));
    pixModal.show();

    // Gerar QR Code após modal aparecer
    pixModal._element.addEventListener('shown.bs.modal', () => {
      // Limpar se já existia QR Code
      const qrCodeDiv = document.getElementById("qrcode");
      qrCodeDiv.innerHTML = '';

      new QRCode(qrCodeDiv, {
        text: pixPayload,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });
    });

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
    } catch (err) {
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
    message += `📱 Chave PIX: ${this.pixKey}\n\n`;
    message += `📄 Vou enviar o comprovante de pagamento.\n\n`;
    message += `⏰ Assim que enviar o anexo, Aguardo confirmação do pedido!`;

    const encodedMessage = encodeURIComponent(message);
    // Para WhatsApp você deve usar número de telefone, não a chave PIX aqui.  
    // Ajuste para o número fixo do WhatsApp (exemplo abaixo, mude para seu número sem símbolos)
    const whatsappPhone = '5547999999999'; // **ATENÇÃO: substitua pelo número correto**
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;

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

    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

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
