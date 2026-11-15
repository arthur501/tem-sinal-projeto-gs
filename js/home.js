/* Página inicial: valida o CEP e vai para a página de resultados */

const campoCep = document.getElementById("cep");
const erro = document.getElementById("erro");

aplicarMascaraCep(campoCep);

document.getElementById("formBusca").addEventListener("submit", (evento) => {
  evento.preventDefault();

  if (!cepValido(campoCep.value)) {
    erro.textContent = "Digite um CEP com 8 números. Exemplo: 01310-100";
    campoCep.focus();
    return;
  }

  // Leva o CEP pela URL: resultados.html?cep=01310100
  window.location.href = "resultados.html?cep=" + limparCep(campoCep.value);
});

// Botões de exemplo preenchem o campo
document.querySelectorAll("[data-cep]").forEach((botao) => {
  botao.addEventListener("click", () => {
    campoCep.value = botao.dataset.cep;
    erro.textContent = "";
    campoCep.focus();
  });
});
