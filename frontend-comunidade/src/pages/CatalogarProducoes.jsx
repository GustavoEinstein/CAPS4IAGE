import { useState } from "react";

function CatalogarProducoes() {
  const [texto, setTexto] = useState("");

  const handleSubmit = () => {
    // no futuro: enviar para o backend
    console.log("Texto catalogado:", texto);
    alert("Produção didática catalogada (simulação)");
  };

  return (
    <div className="catalogar-container">
      <h2>Catalogar produções didáticas</h2>

      <p className="catalogar-descricao">
        <br />
        Descreva abaixo sua produção didática.
        <br />
        Você poderá digitar ou usar o reconhecimento de voz.
      </p>

      <textarea
        className="catalogar-textarea"
        placeholder="Digite aqui o texto da produção didática..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <button className="catalogar-botao" onClick={handleSubmit}>
        Catalogar produção
      </button>
    </div>
  );
}

export default CatalogarProducoes;
