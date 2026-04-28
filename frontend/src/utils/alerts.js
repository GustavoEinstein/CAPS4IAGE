import Swal from 'sweetalert2';

// Objeto que concentra todos os pop-ups do sistema T.E.I.A
export const Alert = {
    
    // 1. POP-UP DE SUCESSO (Verdinho/Azul, some sozinho)
    sucesso: (titulo, texto) => {
        return Swal.fire({
            icon: 'success',
            title: titulo,
            text: texto,
            confirmButtonColor: '#2563EB', // Azul padrão do T.E.I.A
            timer: 2500 // Fecha sozinho após 2.5 segundos
        });
    },

    // 2. POP-UP DE ERRO (Vermelho)
    erro: (titulo = 'Ops...', texto = 'Ocorreu um erro inesperado.') => {
        return Swal.fire({
            icon: 'error',
            title: titulo,
            text: texto,
            confirmButtonColor: '#2563EB'
        });
    },

    // 3. POP-UP DE AVISO/ATENÇÃO (Laranja)
    aviso: (titulo, texto) => {
        return Swal.fire({
            icon: 'warning',
            title: titulo,
            text: texto,
            confirmButtonColor: '#F59E0B' // Laranja
        });
    },

    // 4. CONFIRMAÇÃO DE AÇÃO POSITIVA (Ex: Aprovar, Resolver, Enviar)
    confirmarAcao: async (titulo, texto, textoBotao = 'Sim, continuar') => {
        const result = await Swal.fire({
            title: titulo,
            text: texto,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669', // Verde
            cancelButtonColor: '#94A3B8',  // Cinza
            confirmButtonText: textoBotao,
            cancelButtonText: 'Cancelar'
        });
        return result.isConfirmed; // Retorna true ou false
    },

    // 5. CONFIRMAÇÃO DE EXCLUSÃO/REJEIÇÃO (Ex: Excluir, Rejeitar Produção)
    confirmarExclusao: async (titulo, texto) => {
        const result = await Swal.fire({
            title: titulo || 'Você tem certeza?',
            text: texto || "Esta ação não pode ser desfeita!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626', // Vermelho Perigo
            cancelButtonColor: '#94A3B8',
            confirmButtonText: 'Sim, excluir!',
            cancelButtonText: 'Cancelar'
        });
        return result.isConfirmed; // Retorna true ou false
    }
};