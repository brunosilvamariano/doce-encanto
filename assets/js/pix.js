// Módulo PIX - Funcionalidades de pagamento via PIX
const PixModule = {
    // Dados do recebedor PIX
    pixKey: '33dcc188-1549-49ec-8c5d-917a20d8242e',
    pixName: 'Doce Encanto',
    pixCity: 'JOINVILLE',

    // Função para gerar payload PIX completo (corrigida)
    generatePixPayload: function (value) {
        const formatEMV = (id, value) => {
            const length = value.length.toString().padStart(2, '0');
            return `${id}${length}${value}`;
        };

        const merchantName = this.pixName.toUpperCase().slice(0, 25);
        const merchantCity = this.pixCity.toUpperCase().slice(0, 15);
        const amount = value.toFixed(2);
        const txid = this.generateTxId();

        // Merchant Account Information - campo 26
        const gui = formatEMV("00", "BR.GOV.BCB.PIX");
        const key = formatEMV("01", this.pixKey);
        const merchantAccount = formatEMV("26", gui + key);

        let payload = '';
        payload += formatEMV("00", "01");             // Payload Format Indicator
        payload += formatEMV("01", "12");             // Initiation Method
        payload += merchantAccount;                   // Merchant Account
        payload += formatEMV("52", "0000");           // Merchant Category Code
        payload += formatEMV("53", "986");            // Currency (BRL)
        payload += formatEMV("54", amount);           // Transaction Amount
        payload += formatEMV("58", "BR");             // Country
        payload += formatEMV("59", merchantName);     // Merchant Name
        payload += formatEMV("60", merchantCity);     // Merchant City
        payload += formatEMV("62", formatEMV("05", txid)); // Additional data (TXID)

        const payloadForCRC = payload + '6304';
        const crc = this.calculateCRC16(payloadForCRC);
        payload += '6304' + crc;

        return payload;
    },

    // Função para gerar ID da transação
    generateTxId: function () {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return uuid.replace(/-/g, '').toUpperCase().slice(0, 25);
    },

    // Função para calcular CRC16
    calculateCRC16: function (data) {
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

    // (demais funções continuam iguais)
    // ... [ showPixModal, copyPixPayload, sendWhatsAppMessage, showNotification ]

    // As demais funções do seu módulo já estão funcionando e não precisam ser alteradas.
};

// Exportar módulo para uso global
window.PixModule = PixModule;
