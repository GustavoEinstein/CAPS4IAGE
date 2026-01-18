import './RevisaoDuploCego.css';

function RevisaoDuploCego() {
  // dados fake simulando produções para revisão
  const producoesParaRevisao = [
    {
      id: 1,
      titulo: 'Sequência didática sobre sustentabilidade',
      area: 'Ciências',
      data: '12/01/2026',
      nivel: 'Ensino Fundamental II'
    },
    {
      id: 2,
      titulo: 'Projeto interdisciplinar: Matemática e Arte',
      area: 'Interdisciplinar',
      data: '09/01/2026',
      nivel: 'Ensino Médio'
    }
  ];

  return (
    <div className="revisao-container">
      <h2>Revisão de produção didática (duplo cego)</h2>

      <p className="revisao-descricao">
        Analise as produções abaixo sem identificação de autoria.
        Seu parecer definirá se o material será publicado na comunidade.
      </p>

      {producoesParaRevisao.length === 0 ? (
        <p>Não há produções pendentes de revisão no momento.</p>
      ) : (
        <ul className="revisao-lista">
          {producoesParaRevisao.map((producao) => (
            <li key={producao.id} className="revisao-card">
              <div className="linha">
                <span className="label">Título</span>
                <span className="valor">{producao.titulo}</span>
              </div>

              <div className="linha">
                <span className="label">Área</span>
                <span className="valor">{producao.area}</span>
              </div>

              <div className="linha">
                <span className="label">Nível</span>
                <span className="valor">{producao.nivel}</span>
              </div>

              <div className="linha">
                <span className="label">Data</span>
                <span className="valor">{producao.data}</span>
              </div>

              <div className="acoes">
                <button className="revisao-botao">
                  Revisar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RevisaoDuploCego;
