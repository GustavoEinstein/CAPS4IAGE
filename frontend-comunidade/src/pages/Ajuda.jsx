import { useState } from 'react';
import './Ajuda.css';

function Ajuda() {
  const [faqAtivo, setFaqAtivo] = useState(null);

  const faqs = [
    {
      pergunta: 'Como catalogar uma produção didática?',
      resposta:
        'Acesse o menu "Catalogar produções didáticas", escreva sua produção e envie para análise. Após revisão duplo cego, ela poderá ser publicada na comunidade.'
    },
    {
      pergunta: 'O que é revisão duplo cego?',
      resposta:
        'É um processo no qual avaliadores não sabem quem é o autor da produção, garantindo imparcialidade na análise.'
    },
    {
      pergunta: 'Posso editar uma produção após enviá-la?',
      resposta:
        'Sim. Enquanto a produção estiver em revisão, você poderá fazer ajustes antes da publicação.'
    },
    {
      pergunta: 'Quando minha produção ficará visível para a comunidade?',
      resposta:
        'Após aprovação na revisão duplo cego, ela será publicada automaticamente no painel da comunidade.'
    }
  ];

  const toggleFaq = (index) => {
    setFaqAtivo(faqAtivo === index ? null : index);
  };

  return (
    <div className="ajuda-container">
      <h2>Ajuda</h2>

      {/* ===== TUTORIAIS ===== */}
      <section className="ajuda-secao">
        <h3>Tutoriais</h3>

        <div className="tutorial-card">
          <h4>📌 Como usar o sistema</h4>
          <p>
            Conheça as principais funcionalidades da plataforma e entenda como
            navegar entre as áreas.
          </p>
          <div className="video-placeholder">
            Vídeo tutorial (em breve)
          </div>
        </div>

        <div className="tutorial-card">
          <h4>📘 Como catalogar uma produção didática</h4>
          <p>
            Passo a passo para cadastrar, revisar e acompanhar suas produções.
          </p>
          <div className="video-placeholder">
            Vídeo explicativo (em breve)
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="ajuda-secao">
        <h3>Perguntas frequentes (FAQ)</h3>

        <ul className="faq-lista">
          {faqs.map((faq, index) => (
            <li key={index} className="faq-item">
              <button
                className="faq-pergunta"
                onClick={() => toggleFaq(index)}
              >
                {faq.pergunta}
                <span className="faq-icone">
                  {faqAtivo === index ? '−' : '+'}
                </span>
              </button>

              {faqAtivo === index && (
                <div className="faq-resposta">
                  {faq.resposta}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Ajuda;
