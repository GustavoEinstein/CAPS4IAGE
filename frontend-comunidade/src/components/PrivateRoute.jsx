import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    // 1. Tenta pegar o token do armazenamento local
    const token = localStorage.getItem('access_token');

    // 2. Se o token existir, renderiza o conteúdo da rota (Outlet)
    // 3. Se não existir, redireciona para o Login (Navigate to="/")
    return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;