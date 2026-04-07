import axios from 'axios';

// Cria uma instância padrão do Axios
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/kipo_playground/', // Sua URL base
});

// 1. INTERCEPTOR DE REQUISIÇÃO (Envia o Token automaticamente)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
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