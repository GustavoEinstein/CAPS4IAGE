import axios from 'axios';

// Cria uma instância padrão do Axios
const api = axios.create({
    baseURL: 'https://teia.cic.unb.br/kipo_playground/', // Sua URL base
});

// 1. INTERCEPTOR DE REQUISIÇÃO (Envia o Token automaticamente)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Se o erro vier de um arquivo de mídia, não desloga o usuário
            if (error.config.url.includes('/media/')) {
                return Promise.reject(error);
            }
            
            localStorage.clear();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// 2. INTERCEPTOR DE RESPOSTA (Trata o erro 401)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Evita loop infinito se já estiver no login
            if (!window.location.pathname.includes('/') && !window.location.pathname.includes('/register')) {
                localStorage.clear(); // Limpa token velho
                alert("Sua sessão expirou. Por favor, faça login novamente.");
                window.location.href = '/'; // Redireciona para login
            }
        }
        return Promise.reject(error);
    }
);

export default api;