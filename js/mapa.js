/* Página do mapa: mostra onde há mais pedidos de "Quero internet aqui" */

// Posição de cada cidade no mapa (latitude, longitude)
const COORDENADAS = {
  "São Paulo": [-23.5505, -46.6333],
  "Campinas": [-22.9056, -47.0608],
  "Ribeirão Preto": [-21.1775, -47.8103],
  "Sorocaba": [-23.5015, -47.4526],
  "São José dos Campos": [-23.1896, -45.8841],
  "Registro": [-24.4979, -47.8449],
  "Cunha": [-23.0746, -44.9597],
  "São Luiz do Paraitinga": [-23.2222, -45.3108],
  "Monteiro Lobato": [-22.9544, -45.8406],
  "Iporanga": [-24.5853, -48.5933]
};

// Pedidos SIMULADOS já existentes em cada cidade (para o mapa não começar vazio).
// As cidades rurais, com menos opções, têm mais pedidos.
const DEMANDA_SIMULADA = {
  "São Paulo": 38,
  "Campinas": 14,
  "Ribeirão Preto": 11,
  "Sorocaba": 16,
  "São José dos Campos": 12,
  "Registro": 47,
  "Cunha": 63,
  "São Luiz do Paraitinga": 71,
  "Monteiro Lobato": 96,
  "Iporanga": 104
};

// Faixas de demanda e suas cores
function nivel(total) {
  if (total >= 60) return { nome: "Alta demanda", cor: "#1f3a5f" };
  if (total >= 25) return { nome: "Média demanda", cor: "#2e7dd7" };
  return { nome: "Baixa demanda", cor: "#a9c8ee" };
}

// Soma os pedidos simulados com os registrados neste navegador
function calcularTotais() {
  const totais = { ...DEMANDA_SIMULADA };
  const minhas = lerDemandas();

  minhas.forEach((demanda) => {
    // Acerta o nome da cidade com o da nossa lista (ignorando acentos)
    const nomeConhecido = Object.keys(COORDENADAS)
      .find(nome => normalizar(nome) === normalizar(demanda.cidade));
    const nome = nomeConhecido || demanda.cidade;
    totais[nome] = (totais[nome] || 0) + 1;
  });

  return { totais, quantidadeMinhas: minhas.length };
}

// ---------- Mapa ----------

const mapa = L.map("mapa").setView([-23.4, -46.8], 7);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap"
}).addTo(mapa);

const { totais, quantidadeMinhas } = calcularTotais();

// Camada 1: um círculo por cidade, maior e mais escuro onde há mais pedidos
const camadaCirculos = L.layerGroup();

for (const cidade in COORDENADAS) {
  const total = totais[cidade] || 0;
  const n = nivel(total);

  L.circleMarker(COORDENADAS[cidade], {
    radius: 10 + Math.sqrt(total) * 2.5,
    color: "#ffffff",
    weight: 2,
    fillColor: n.cor,
    fillOpacity: 0.85
  })
    .bindPopup(`<strong>${cidade}</strong><br>${total} pedidos de internet<br>${n.nome}`)
    .addTo(camadaCirculos);
}

// Camada 2: mapa de calor. Espalha pontos em volta de cada cidade,
// em quantidade proporcional aos pedidos, para formar as "ondas de calor".
function aleatorio(semente) {
  // Número pseudoaleatório fixo, para o mapa sair igual toda vez
  const x = Math.sin(semente) * 10000;
  return x - Math.floor(x);
}

const pontosCalor = [];
let semente = 1;
for (const cidade in COORDENADAS) {
  const [lat, lng] = COORDENADAS[cidade];
  const total = totais[cidade] || 0;
  for (let i = 0; i < total; i++) {
    const distancia = aleatorio(semente++) * 0.12;
    const angulo = aleatorio(semente++) * Math.PI * 2;
    pontosCalor.push([lat + Math.sin(angulo) * distancia, lng + Math.cos(angulo) * distancia, 0.6]);
  }
}

const camadaCalor = L.heatLayer(pontosCalor, {
  radius: 30,
  blur: 25,
  maxZoom: 10,
  gradient: { 0.3: "#a9c8ee", 0.6: "#2e7dd7", 1.0: "#1f3a5f" }
});

camadaCirculos.addTo(mapa);

// Botões para trocar a camada
const botaoCirculos = document.getElementById("verCirculos");
const botaoCalor = document.getElementById("verCalor");

botaoCirculos.addEventListener("click", () => {
  mapa.removeLayer(camadaCalor);
  camadaCirculos.addTo(mapa);
  botaoCirculos.classList.add("ativo");
  botaoCalor.classList.remove("ativo");
});

botaoCalor.addEventListener("click", () => {
  mapa.removeLayer(camadaCirculos);
  camadaCalor.addTo(mapa);
  botaoCalor.classList.add("ativo");
  botaoCirculos.classList.remove("ativo");
});

// ---------- Ranking lateral ----------

const ranking = document.getElementById("ranking");
Object.entries(totais)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .forEach(([cidade, total]) => {
    const item = document.createElement("li");
    item.innerHTML = `${cidade}: <strong>${total}</strong>`;
    ranking.appendChild(item);
  });

document.getElementById("minhas").textContent = quantidadeMinhas
  ? `Inclui ${quantidadeMinhas} pedido(s) registrado(s) neste aparelho.`
  : "Os números são simulados para a demonstração.";
