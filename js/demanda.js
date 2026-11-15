/* Página de registrar demanda: salva o pedido no navegador (localStorage) */

const campoCep = document.getElementById("cep");
const campoTipo = document.getElementById("tipo");
const lgpd = document.getElementById("lgpd");
const erro = document.getElementById("erro");
const sucesso = document.getElementById("sucesso");
const form = document.getElementById("formDemanda");

aplicarMascaraCep(campoCep);

// Se veio da página de resultados, o CEP já vem preenchido
const cepDaUrl = new URLSearchParams(window.location.search).get("cep");
if (cepDaUrl) campoCep.value = formatarCep(cepDaUrl);

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  erro.textContent = "";
  sucesso.hidden = true;

  if (!cepValido(campoCep.value)) {
    erro.textContent = "Digite um CEP com 8 números.";
    campoCep.focus();
    return;
  }
  if (!lgpd.checked) {
    erro.textContent = "Para enviar, marque que concorda com a Política de Privacidade.";
    return;
  }

  // Descobre a cidade para a demanda aparecer no mapa
  const dados = await carregarDados();
  const endereco = await buscarCidadePorCep(campoCep.value, dados);

  // Só guardamos CEP, cidade e tipo. Nenhum dado pessoal (nome, telefone, e-mail).
  salvarDemanda({
    cep: limparCep(campoCep.value),
    cidade: endereco ? endereco.cidade : "Não identificada",
    uf: endereco ? endereco.uf : "",
    tipo: campoTipo.value || "qualquer",
    data: new Date().toISOString()
  });

  form.reset();
  sucesso.hidden = false;
  sucesso.innerHTML = `Sua demanda foi enviada com sucesso! <a href="mapa.html">Ver no mapa</a>`;
});
