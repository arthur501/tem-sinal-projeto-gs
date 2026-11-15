/* =========================================================
   Tem Sinal? - funções usadas em todas as páginas
   ========================================================= */

// Nomes, ícones e explicações dos 4 tipos de conexão
const TIPOS = {
  rede_movel: { nome: "Rede Móvel", icone: "img/movel.png", explicacao: "Internet pelo chip do celular (4G/5G)" },
  cabo_fibra: { nome: "Cabo/Fibra", icone: "img/fibra.png", explicacao: "Internet fixa por cabo, instalada em casa" },
  radio:      { nome: "Rádio",      icone: "img/radio.png", explicacao: "Sinal de uma antena próxima, comum na zona rural" },
  satelite:   { nome: "Satélite",   icone: "img/satelite.png", explicacao: "Funciona em qualquer lugar, com antena própria" }
};

// ---------- CEP ----------

// Deixa só os números do CEP
function limparCep(cep) {
  return String(cep).replace(/\D/g, "");
}

// Formata como 00000-000 enquanto a pessoa digita
function formatarCep(cep) {
  const n = limparCep(cep).slice(0, 8);
  return n.length > 5 ? n.slice(0, 5) + "-" + n.slice(5) : n;
}

function cepValido(cep) {
  return limparCep(cep).length === 8;
}

// Liga a máscara de CEP em um campo de texto
function aplicarMascaraCep(input) {
  input.addEventListener("input", () => {
    input.value = formatarCep(input.value);
  });
}

// ---------- Dados ----------

// Carrega o arquivo de dados simulados
async function carregarDados() {
  try {
    const resposta = await fetch("dados/dados.json");
    return await resposta.json();
  } catch (erro) {
    alert("Não foi possível carregar os dados. Abra o site pelo Live Server do VS Code ou pelo link publicado (abrir o arquivo direto não funciona).");
    throw erro;
  }
}

// Tira acentos e deixa minúsculo, para comparar nomes de cidades
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Descobre a cidade de um CEP.
// 1) Procura nos CEPs de exemplo dos nossos dados (funciona sem internet)
// 2) Se não achar, consulta a API pública ViaCEP
async function buscarCidadePorCep(cep, dados) {
  const numeros = limparCep(cep);

  const exemplo = dados.cidades.find(c => limparCep(c.cep_exemplo) === numeros);
  if (exemplo) return { cidade: exemplo.cidade, uf: exemplo.uf };

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
    const json = await resposta.json();
    if (json.erro) return null; // CEP não existe
    return { cidade: json.localidade, uf: json.uf };
  } catch {
    return null; // sem internet
  }
}

// Procura a cidade nos dados simulados
function encontrarCidade(dados, cidade, uf) {
  return dados.cidades.find(c => normalizar(c.cidade) === normalizar(cidade) && c.uf === uf);
}

// ---------- Demandas (salvas no navegador) ----------

const CHAVE_DEMANDAS = "temSinal_demandas";

function lerDemandas() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_DEMANDAS)) || [];
  } catch {
    return [];
  }
}

function salvarDemanda(demanda) {
  const lista = lerDemandas();
  lista.push(demanda);
  localStorage.setItem(CHAVE_DEMANDAS, JSON.stringify(lista));
}

// ---------- Acessibilidade: tamanho da letra e alto contraste ----------

function iniciarAcessibilidade() {
  const raiz = document.documentElement;
  let tamanho = Number(localStorage.getItem("temSinal_fonte")) || 16;
  const contraste = localStorage.getItem("temSinal_contraste") === "sim";

  raiz.style.fontSize = tamanho + "px";
  if (contraste) document.body.classList.add("alto-contraste");

  document.getElementById("fonteMais")?.addEventListener("click", () => {
    tamanho = Math.min(tamanho + 2, 24);
    raiz.style.fontSize = tamanho + "px";
    localStorage.setItem("temSinal_fonte", tamanho);
  });

  document.getElementById("fonteMenos")?.addEventListener("click", () => {
    tamanho = Math.max(tamanho - 2, 14);
    raiz.style.fontSize = tamanho + "px";
    localStorage.setItem("temSinal_fonte", tamanho);
  });

  document.getElementById("contraste")?.addEventListener("click", () => {
    const ativo = document.body.classList.toggle("alto-contraste");
    localStorage.setItem("temSinal_contraste", ativo ? "sim" : "nao");
  });
}

document.addEventListener("DOMContentLoaded", iniciarAcessibilidade);
