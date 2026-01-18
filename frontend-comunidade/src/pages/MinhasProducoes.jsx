import './MinhasProducoes.css';

function MinhasProducoes() {
  // dados fake (simula banco de dados)
  const producoes = [
    {
      id: 1,
      titulo: 'Plano de aula – Frações',
      area: 'Matemática',
      data: '10/01/2026',
      status: 'Publicado'
    },
    {
      id: 2,
      titulo: 'Sequência didática – Leitura',
      area: 'Língua Portuguesa',
      data: '05/01/2026',
      status: 'Em revisão'
    }
  ];

  return (
    <div className="producoes-container">
      <h2>Minhas produções didáticas catalogadas</h2>

      {producoes.length === 0 ? (
        <p>Você ainda não possui produções catalogadas.</p>
      ) : (
        <ul className="producoes-lista">
          {producoes.map((producao) => (
            <li key={producao.id} className="producao-card">
              <div className="linha">
                <span className="label">Título</span>
                <span className="valor">{producao.titulo}</span>
              </div>

              <div className="linha">
                <span className="label">Área</span>
                <span className="valor">{producao.area}</span>
              </div>

              <div className="linha">
                <span className="label">Data</span>
                <span className="valor">{producao.data}</span>
              </div>

              <div className="linha">
                <span className="label">Status</span>
                <span className={`status ${producao.status.toLowerCase().replace(' ', '-')}`}>
                  {producao.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MinhasProducoes;
