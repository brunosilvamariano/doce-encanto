// auth.js - Sistema de Autenticação

const AuthModule = {
    // Estado do usuário
    isUserLoggedIn: false,
    currentUser: null,
    
    // Inicializar módulo
    init: function() {
        this.loadUserSession();
        this.setupEventListeners();
        this.updateLoginButton();
    },
    
    // Configurar event listeners
    setupEventListeners: function() {
        const loginForm = document.getElementById("loginForm");
        const registerForm = document.getElementById("registerForm");
        const showRegisterBtn = document.getElementById("showRegister");
        const showLoginBtn = document.getElementById("showLogin");
        
        if (loginForm) {
            loginForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (registerForm) {
            registerForm.addEventListener("submit", (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        if (showRegisterBtn) {
            showRegisterBtn.addEventListener("click", () => {
                this.showRegisterSection();
            });
        }

        if (showLoginBtn) {
            showLoginBtn.addEventListener("click", () => {
                this.showLoginSection();
            });
        }
    },
    
    // Função para verificar se o usuário está logado
    isLoggedIn: function() {
        return this.isUserLoggedIn;
    },
    
    // Função para fazer login
    handleLogin: function() {
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        
        if (email && password) {
            // Simular login (em produção, validar com backend)
            this.isUserLoggedIn = true;
            this.currentUser = { email: email };
            this.saveUserSession();
            this.updateLoginButton();
            
            const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
            loginModal.hide();
            
            // Usar modal moderno em vez de alert
            if (window.ModalSystem) {
                window.ModalSystem.success("Login Realizado", "Bem-vindo! Você foi conectado com sucesso.");
            }
            
            // Limpar formulário
            document.getElementById("loginForm").reset();
        }
    },
    
    // Função para fazer cadastro
    handleRegister: function() {
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        
        if (password !== confirmPassword) {
            if (window.ModalSystem) {
                window.ModalSystem.error("Erro no Cadastro", "As senhas não coincidem!");
            }
            return;
        }
        
        if (email && password && password.length >= 6) {
            // Simular cadastro (em produção, enviar para backend)
            this.isUserLoggedIn = true;
            this.currentUser = { email: email };
            this.saveUserSession();
            this.updateLoginButton();
            
            const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
            loginModal.hide();
            
            // Usar modal moderno em vez de alert
            if (window.ModalSystem) {
                window.ModalSystem.success("Cadastro Realizado", "Sua conta foi criada com sucesso! Você já está logado.");
            }
            
            // Limpar formulários
            document.getElementById("registerForm").reset();
        } else {
            if (window.ModalSystem) {
                window.ModalSystem.error("Erro no Cadastro", "Por favor, preencha todos os campos corretamente. A senha deve ter pelo menos 6 caracteres.");
            }
        }
    },
    
    // Função para fazer logout
    logout: function() {
        // Mostrar modal de confirmação de logout
        if (window.ModalSystem) {
            window.ModalSystem.confirm(
                "Confirmar Logout",
                "Tem certeza que deseja sair da sua conta?",
                () => {
                    // Ação de logout confirmada
                    this.isUserLoggedIn = false;
                    this.currentUser = null;
                    this.clearUserSession();
                    this.updateLoginButton();
                    
                    // Remover dropdown se existir
                    const dropdown = document.querySelector(".user-dropdown");
                    if (dropdown) {
                        dropdown.remove();
                    }
                    
                    // Recarregar página
                    window.location.reload();
                }
            );
        } else {
            // Fallback para alert se o sistema de modais não estiver disponível
            if (confirm("Tem certeza que deseja sair da sua conta?")) {
                this.isUserLoggedIn = false;
                this.currentUser = null;
                this.clearUserSession();
                this.updateLoginButton();
                
                const dropdown = document.querySelector(".user-dropdown");
                if (dropdown) {
                    dropdown.remove();
                }
                window.location.reload();
            }
        }
    },
    
    // Função para mostrar seção de cadastro
    showRegisterSection: function() {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("registerSection").style.display = "block";
        document.getElementById("loginModalLabel").textContent = "Criar Conta";
    },
    
    // Função para mostrar seção de login
    showLoginSection: function() {
        document.getElementById("loginSection").style.display = "block";
        document.getElementById("registerSection").style.display = "none";
        document.getElementById("loginModalLabel").textContent = "Entrar";
    },
    
    // Função para atualizar o botão de login
    updateLoginButton: function() {
        const loginButton = document.querySelector("[data-bs-target=\"#loginModal\"]");
        if (!loginButton) return;
        
        if (this.isUserLoggedIn) {
            // Transformar em dropdown
            loginButton.innerHTML = `<i class=\"fas fa-user\"></i> ${this.currentUser.email} <i class=\"fas fa-chevron-down ms-1\"></i>`;
            loginButton.className = "btn btn-primary mt-3 user-dropdown-toggle";
            loginButton.onclick = (e) => {
                e.preventDefault();
                // Chamar a função de logout diretamente ao clicar no botão de usuário logado
                this.logout();
            };
            loginButton.removeAttribute("data-bs-toggle");
            loginButton.removeAttribute("data-bs-target");
        } else {
            // Voltar ao estado original
            loginButton.innerHTML = "<i class=\"fas fa-user\"></i> Entrar";
            loginButton.className = "btn btn-primary mt-3";
            loginButton.onclick = null;
            loginButton.setAttribute("data-bs-toggle", "modal");
            loginButton.setAttribute("data-bs-target", "#loginModal");
            
            // Remover dropdown se existir
            const dropdown = document.querySelector(".user-dropdown");
            if (dropdown) {
                dropdown.remove();
            }
        }
    },
    
    // Função para salvar sessão do usuário
    saveUserSession: function() {
        localStorage.setItem("user_session", JSON.stringify({
            isLoggedIn: this.isUserLoggedIn,
            user: this.currentUser
        }));
    },
    
    // Função para carregar sessão do usuário
    loadUserSession: function() {
        const session = localStorage.getItem("user_session");
        if (session) {
            const sessionData = JSON.parse(session);
            this.isUserLoggedIn = sessionData.isLoggedIn || false;
            this.currentUser = sessionData.user || null;
        }
    },
    
    // Função para limpar sessão do usuário
    clearUserSession: function() {
        localStorage.removeItem("user_session");
    },
    
    // Função para mostrar alerta de login necessário
    showLoginRequiredAlert: function() {
        if (window.ModalSystem) {
            window.ModalSystem.showLoginRequired();
        } else {
            // Fallback para alert se o sistema de modais não estiver disponível
            alert("Você precisa fazer login para adicionar itens ao carrinho!");
            const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
            loginModal.show();
        }
    }
};

// Função global para alternar a visibilidade da senha
window.togglePasswordVisibility = function(inputId) {
    const passwordInput = document.getElementById(inputId);
    const icon = document.getElementById(inputId + "-icon");
    
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
};

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
    AuthModule.init();
});

// Exportar módulo para uso global
window.AuthModule = AuthModule;


