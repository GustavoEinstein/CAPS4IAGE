import './PainelComunidade.css';

function PainelComunidade() {
  // Dados fictícios
  const producoesPublicadas = [
    {
      id: 1,
      titulo: 'Sequência didática sobre educação ambiental',
      area: 'Ciências',
      nivel: 'Ensino Fundamental II',
      data: '05/01/2026'
    },
    {
      id: 2,
      titulo: 'Projeto interdisciplinar: Matemática e Música',
      area: 'Interdisciplinar',
      nivel: 'Ensino Médio',
      data: '22/12/2025'
    },
    {
      id: 3,
      titulo: 'Plano de aula sobre leitura crítica',
      area: 'Língua Portuguesa',
      nivel: 'Ensino Fundamental I',
      data: '10/12/2025'
    }
  ];

  return (
    <div className="painel-container">
      <h2>Painel de produções didáticas da comunidade</h2>

      <p className="painel-descricao">
        Consulte abaixo as produções didáticas publicadas na comunidade de professores.
      </p>

      <div className="painel-lista">
        {producoesPublicadas.map((producao) => (
          <div key={producao.id} className="painel-card">
            <h3 className="painel-titulo">{producao.titulo}</h3>

            <p><strong>Área:</strong> {producao.area}</p>
            <p><strong>Nível:</strong> {producao.nivel}</p>
            <p><strong>Publicado em:</strong> {producao.data}</p>

            <button className="painel-botao">
              Detalhar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PainelComunidade;
