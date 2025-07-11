// modal.js - Sistema de Modais Modernos

const ModalSystem = {
    // Função para mostrar notificação
    showNotification: function(type, title, message, callback = null) {
        const modal = document.getElementById("notificationModal");
        const modalElement = modal.querySelector(".modal-content");
        const titleElement = document.getElementById("notificationModalLabel");
        const iconElement = document.getElementById("notificationIcon");
        const messageElement = document.getElementById("notificationMessage");
        const okButton = document.getElementById("notificationOkBtn");
        
        // Remover classes anteriores
        modal.classList.remove("notification-success", "notification-error", "notification-info", "notification-warning");
        iconElement.className = "notification-icon";
        
        // Adicionar classe do tipo
        modal.classList.add(`notification-${type}`);
        
        // Configurar ícone baseado no tipo
        switch(type) {
            case "success":
                iconElement.classList.add("fas", "fa-check-circle");
                break;
            case "error":
                iconElement.classList.add("fas", "fa-times-circle");
                break;
            case "info":
                iconElement.classList.add("fas", "fa-info-circle");
                break;
            case "warning":
                iconElement.classList.add("fas", "fa-exclamation-triangle");
                break;
        }
        
        // Definir conteúdo
        titleElement.textContent = title;
        messageElement.textContent = message;
        
        // Configurar callback do botão OK
        okButton.onclick = function() {
            if (callback) callback();
        };
        
        // Mostrar modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        return bootstrapModal;
    },
    
    // Função para mostrar modal de login requerido
    showLoginRequired: function() {
        const modal = document.getElementById("loginRequiredModal");
        const loginButton = document.getElementById("loginRequiredLoginBtn");
        
        // Configurar ação do botão de login
        loginButton.onclick = function() {
            // Fechar modal atual
            const currentModal = bootstrap.Modal.getInstance(modal);
            currentModal.hide();
            
            // Abrir modal de login
            setTimeout(() => {
                const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
                loginModal.show();
            }, 300);
        };
        
        // Mostrar modal
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        return bootstrapModal;
    },
    
    // Função para mostrar modal de confirmação genérico
    confirm: function(title, message, confirmCallback, cancelCallback = null) {
        const modal = document.getElementById("confirmationModal");
        const titleElement = document.getElementById("confirmationModalLabel");
        const messageElement = document.getElementById("confirmationMessage");
        const confirmButton = document.getElementById("confirmActionButton");
        const cancelButton = modal.querySelector(".btn-secondary");

        titleElement.textContent = title;
        messageElement.textContent = message;

        confirmButton.onclick = function() {
            const currentModal = bootstrap.Modal.getInstance(modal);
            currentModal.hide();
            if (confirmCallback) confirmCallback();
        };

        cancelButton.onclick = function() {
            const currentModal = bootstrap.Modal.getInstance(modal);
            currentModal.hide();
            if (cancelCallback) cancelCallback();
        };

        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();

        return bootstrapModal;
    },
    
    // Funções de conveniência para diferentes tipos de notificação
    success: function(title, message, callback = null) {
        return this.showNotification("success", title, message, callback);
    },
    
    error: function(title, message, callback = null) {
        return this.showNotification("error", title, message, callback);
    },
    
    info: function(title, message, callback = null) {
        return this.showNotification("info", title, message, callback);
    },
    
    warning: function(title, message, callback = null) {
        return this.showNotification("warning", title, message, callback);
    }
};

// Sistema de Dropdown do Usuário (não será mais usado para logout, mas mantido para outras funcionalidades se houver)
const UserDropdown = {
    isOpen: false,
    
    init: function() {
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        const overlay = document.getElementById("dropdownOverlay");
        
        // Fechar dropdown ao clicar no overlay
        overlay.addEventListener("click", () => {
            this.close();
        });
        
        // Fechar dropdown ao pressionar ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isOpen) {
                this.close();
            }
        });
    },
    
    toggle: function(userEmail) {
        if (this.isOpen) {
            this.close();
        } else {
            this.open(userEmail);
        }
    },
    
    open: function(userEmail) {
        const button = document.querySelector(".user-dropdown-toggle");
        if (!button) return;
        
        // Criar dropdown se não existir
        let dropdown = document.querySelector(".user-dropdown");
        if (!dropdown) {
            dropdown = this.createDropdown(button, userEmail);
        } else {
            // Atualizar email se já existir
            const emailElement = dropdown.querySelector(".user-email");
            if (emailElement) {
                emailElement.textContent = userEmail;
            }
        }
        
        // Mostrar dropdown
        dropdown.classList.add("show");
        document.getElementById("dropdownOverlay").classList.add("show");
        this.isOpen = true;
    },
    
    close: function() {
        const dropdown = document.querySelector(".user-dropdown");
        if (dropdown) {
            dropdown.classList.remove("show");
        }
        document.getElementById("dropdownOverlay").classList.remove("show");
        this.isOpen = false;
    },
    
    createDropdown: function(button, userEmail) {
        // Criar container do dropdown
        const dropdown = document.createElement("div");
        dropdown.className = "user-dropdown";
        
        // Criar menu do dropdown
        const menu = document.createElement("div");
        menu.className = "user-dropdown-menu";
        
        // Email do usuário
        const emailDiv = document.createElement("div");
        emailDiv.className = "user-email";
        emailDiv.textContent = userEmail;
        menu.appendChild(emailDiv);
        
        // Opção de logout
        const logoutItem = document.createElement("a");
        logoutItem.className = "user-dropdown-item";
        logoutItem.innerHTML = "<i class=\"fas fa-sign-out-alt\"></i> Sair";
        logoutItem.onclick = (e) => {
            e.preventDefault();
            this.close();
            // Chamar a função de logout do AuthModule diretamente
            if (window.AuthModule) {
                window.AuthModule.logout();
            }
        };
        menu.appendChild(logoutItem);
        
        dropdown.appendChild(menu);
        
        // Inserir dropdown após o botão
        button.parentNode.insertBefore(dropdown, button.nextSibling);
        
        return dropdown;
    },
    
    handleLogout: function() {
        // Esta função não será mais usada diretamente, pois o logout será tratado pelo AuthModule
    }
};

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
    UserDropdown.init();
});

// Exportar para uso global
window.ModalSystem = ModalSystem;
window.UserDropdown = UserDropdown;


