/* Página de resultados: mostra as opções de conexão do CEP buscado */

const local = document.getElementById("local");
const resumo = document.getElementById("resumo");
const cards = document.getElementById("cards");
const regional = document.getElementById("regional");

// Pega o CEP da URL (resultados.html?cep=01310100)
const cep = new URLSearchParams(window.location.search).get("cep") || "";

// O botão "Quero internet aqui" já leva o CEP para o formulário
document.getElementById("queroInternet").href = "demanda.html?cep=" + limparCep(cep);

// Transforma "Disponível" em "disponivel", para usar como classe CSS
function classeStatus(status) {
  return normalizar(status).replace(/\s+/g, "-");
}

// Monta um card de tipo de conexão
function criarCard(chave, conexao) {
  const tipo = TIPOS[chave];
  const temOperadora = conexao.operadoras.length > 0;

  const card = document.createElement("article");
  card.className = "card" + (temOperadora ? "" : " indisponivel");
  card.innerHTML = `
    <img src="${tipo.icone}" alt="">
    <h3>${tipo.nome}</h3>
    <p class="operadoras">${temOperadora ? conexao.operadoras.join(", ") : "Nenhuma opção encontrada"}</p>
    ${conexao.observacao ? `<p class="obs">${conexao.observacao}</p>` : ""}
    <span class="badge ${classeStatus(conexao.status)}">${conexao.status}</span>
  `;
  return card;
}

// Quando o CEP é válido, mas a cidade não está nos dados simulados
function semDados(cidade, uf) {
  local.innerHTML = `CEP: <strong>${formatarCep(cep)}</strong> · ${cidade} - ${uf}`;
  resumo.hidden = false;
  resumo.textContent = "Ainda não temos informações sobre essa cidade no protótipo. Registre sua demanda para nos ajudar a mapear a região.";
}

async function iniciar() {
  if (!cepValido(cep)) {
    local.textContent = "CEP inválido.";
    return;
  }

  const dados = await carregarDados();
  const endereco = await buscarCidadePorCep(cep, dados);

  if (!endereco) {
    local.innerHTML = `CEP: <strong>${formatarCep(cep)}</strong>`;
    resumo.hidden = false;
    resumo.textContent = "Não encontramos esse CEP. Confira os números e tente de novo.";
    return;
  }

  const cidade = encontrarCidade(dados, endereco.cidade, endereco.uf);
  if (!cidade) {
    semDados(endereco.cidade, endereco.uf);
    return;
  }

  local.innerHTML = `CEP: <strong>${formatarCep(cep)}</strong> · ${cidade.cidade} - ${cidade.uf}`;

  // Cria os 4 cards
  let disponiveis = 0;
  for (const chave in TIPOS) {
    const conexao = cidade.conexoes[chave];
    cards.appendChild(criarCard(chave, conexao));
    if (conexao.status === "Disponível") disponiveis++;
  }

  // Frase de resumo em linguagem simples
  resumo.hidden = false;
  resumo.textContent = disponiveis === 4
    ? "Boa notícia: todos os tipos de conexão estão disponíveis na sua cidade."
    : `Encontramos ${disponiveis} de 4 tipos de conexão disponíveis em ${cidade.cidade}. Se nenhuma opção servir para você, registre sua demanda.`;

  // Mostra a nota sobre provedores regionais se algum aparecer
  regional.hidden = !JSON.stringify(cidade.conexoes).includes("*");
}

iniciar();
