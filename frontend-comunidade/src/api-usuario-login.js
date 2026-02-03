import axios from 'axios';

// Configura o axios globalmente para verificar erros 401 (Não autorizado)
axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Se receber um erro 401 (Token inválido ou expirado)
        if (error.response && error.response.status === 401) {
            // Verifica se não é a própria tela de login (para evitar loop)
            if (!window.location.pathname.includes('/') && !window.location.pathname.includes('/register')) {
                localStorage.clear(); // Limpa dados
                window.location.href = '/'; // Força ir para o Login
                alert("Sua sessão expirou. Faça login novamente.");
            }
        }
        return Promise.reject(error);
    }
);