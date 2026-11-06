/* ===== JavaScript: lógica do sistema ===== */

// Níveis pelo total já depositado: quanto maior o nível, menor o juros e maior o limite do empréstimo
// Valor máximo de cada depósito
const LIMITE_DEPOSITO = 100000000;

const NIVEIS = [
  { nome: "Bronze", minimo: 0, juros: 0.050, limite: 2000, rendimento: 0.005 },
  { nome: "Prata", minimo: 10000, juros: 0.035, limite: 10000, rendimento: 0.008 },
  { nome: "Ouro", minimo: 25000, juros: 0.025, limite: 50000, rendimento: 0.011 }
];

// Formata número como dinheiro brasileiro: 1500 -> R$ 1.500,00
function dinheiro(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function porcento(taxa) {
  return (taxa * 100).toFixed(1).replace(".", ",") + "%";
}

// Mostra uma mensagem colorida em um elemento da tela
// Apaga os avisos e resultados que ficaram na tela (eles só valem logo depois da ação)
function limparAvisos() {
  let avisos = document.querySelectorAll("#plataforma .mensagem");
  for (let i = 0; i < avisos.length; i++) {
    avisos[i].textContent = "";
    avisos[i].className = "mensagem";
  }
  let resultados = document.querySelectorAll("#plataforma .resultado");
  for (let i = 0; i < resultados.length; i++) {
    resultados[i].innerHTML = "";
    resultados[i].style.display = "none";
  }
  let login = document.getElementById("mensagem");
  login.textContent = "";
  login.className = "mensagem";
}

function mostrar(id, texto, tipo) {
  let el = document.getElementById(id);
  el.textContent = texto;
  el.className = "mensagem " + tipo;
}

// Identifica o mês atual (usado para somar os saques do mês)
function mesAtual() {
  let d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1);
}

/* ---------- Troca entre login e cadastro ---------- */

// tela = "login" ou "cadastro"; limpar = true apaga a mensagem da tela
function trocarTela(tela, limpar) {
  let cadastro = (tela == "cadastro");
  // O card gira: a frente é o login e o verso é o cadastro
  document.getElementById("virar").classList.toggle("girado", cadastro);
  // O lado que está escondido não recebe clique nem foco do teclado
  document.getElementById("faceLogin").inert = cadastro;
  document.getElementById("faceCadastro").inert = !cadastro;
  if (limpar) {
    document.getElementById("mensagem").textContent = "";
    document.getElementById("mensagem").className = "mensagem";
    document.getElementById("mensagemCadastro").textContent = "";
    document.getElementById("mensagemCadastro").className = "mensagem";
  }
}

/* ---------- Usuários cadastrados ---------- */

// Usuário que está dentro da conta neste momento
let usuarioLogado = null;

// Lista com todas as pessoas cadastradas (cada uma guarda os próprios dados e a própria conta)
function carregarUsuarios() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios"));
  if (usuarios == null) {
    usuarios = [];
    // Aproveita o cadastro único das versões antigas do site
    let antigo = JSON.parse(localStorage.getItem("cadastro"));
    if (antigo != null) {
      antigo.conta = JSON.parse(localStorage.getItem("conta"));
      usuarios.push(antigo);
    }
  }
  return usuarios;
}

function salvarUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

// Procura uma pessoa pelo usuário; devolve null se não existir
function buscarUsuario(usuarios, usuario) {
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].usuario == usuario) {
      return usuarios[i];
    }
  }
  return null;
}

/* ---------- Cadastro e login (estrutura do item 8) ---------- */

function cadastrar() {
  let nome = document.getElementById("nome").value;
  let email = document.getElementById("email").value;
  let usuario = document.getElementById("usuario").value;
  let senha = document.getElementById("senha").value;
  let usuarios = carregarUsuarios();

  if (nome == "" || email == "" || usuario == "" || senha == "") {
    document.getElementById("mensagemCadastro").textContent = "Preencha todos os campos!";
    document.getElementById("mensagemCadastro").className = "mensagem erro";
  } else if (buscarUsuario(usuarios, usuario) != null) {
    document.getElementById("mensagemCadastro").textContent = "Esse usuário já existe. Escolha outro!";
    document.getElementById("mensagemCadastro").className = "mensagem erro";
  } else {
    let pessoa = {
      nome: nome,
      email: email,
      usuario: usuario,
      senha: senha,
      conta: novaConta()   // saldo zerado e cartão virtual
    };
    usuarios.push(pessoa);
    salvarUsuarios(usuarios);
    // Limpa o formulário de cadastro
    document.getElementById("nome").value = "";
    document.getElementById("email").value = "";
    document.getElementById("usuario").value = "";
    document.getElementById("senha").value = "";
    // Leva a pessoa para o login já com o usuário preenchido
    document.getElementById("loginUsuario").value = usuario;
    trocarTela("login", false);
  }
}

function entrar() {
  let usuario = document.getElementById("loginUsuario").value;
  let senha = document.getElementById("loginSenha").value;
  let usuarios = carregarUsuarios();
  let dados = buscarUsuario(usuarios, usuario);

  if (usuarios.length == 0) {
    document.getElementById("mensagem").textContent = "Realize seu cadastro primeiro!";
    document.getElementById("mensagem").className = "mensagem erro";
  } else if (dados != null && senha == dados.senha) {
    usuarioLogado = dados.usuario;
    document.getElementById("mensagem").textContent = "Acesso permitido!";
    document.getElementById("mensagem").className = "mensagem ok";
    document.getElementById("plataforma").style.display = "block";
    fecharAcesso();
    document.body.classList.remove("tela-login");
    document.getElementById("boasVindas").textContent = "Olá, " + dados.nome + "!";
    document.getElementById("avatar").textContent = dados.nome.charAt(0).toUpperCase();
    atualizarTela();
    mostrarAba("abaInicio");
  } else {
    document.getElementById("mensagem").textContent = "Usuário ou senha incorretos!";
    document.getElementById("mensagem").className = "mensagem erro";
  }
}

// Janela de login/cadastro: abre pelos botões "Entrar" e "Criar conta" da página inicial
function abrirAcesso(tela) {
  trocarTela(tela, true);
  document.getElementById("acesso").classList.add("aberto");
  document.body.classList.add("acesso-aberto");
  let campo = (tela == "cadastro") ? "nome" : "loginUsuario";
  setTimeout(() => { document.getElementById(campo).focus(); }, 300);
}

function fecharAcesso() {
  document.getElementById("acesso").classList.remove("aberto");
  document.body.classList.remove("acesso-aberto");
}

// Números da página inicial sobem de 0 até o valor final quando aparecem na tela
function animarNumeros() {
  let numeros = document.querySelectorAll("[data-alvo]");
  let reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let observador = new IntersectionObserver((entradas) => {
    for (let i = 0; i < entradas.length; i++) {
      if (entradas[i].isIntersecting) {
        contar(entradas[i].target, reduzir);
        observador.unobserve(entradas[i].target);
      }
    }
  });
  for (let i = 0; i < numeros.length; i++) { observador.observe(numeros[i]); }
}

function contar(elemento, direto) {
  let alvo = Number(elemento.dataset.alvo);
  if (direto) { elemento.textContent = alvo; return; }
  // contagem lenta (cerca de 4,5 segundos) que desacelera no final, para dar tempo de ver
  let duracao = 4500;
  let inicio = null;
  function quadro(agora) {
    if (inicio == null) { inicio = agora; }
    let t = Math.min(1, (agora - inicio) / duracao);
    let suave = 1 - Math.pow(1 - t, 1.6);
    elemento.textContent = Math.round(alvo * suave);
    if (t < 1) { requestAnimationFrame(quadro); }
  }
  requestAnimationFrame(quadro);
}

// ---------- Temas (botão "Mudar tema") ----------

function sair() {
  usuarioLogado = null;
  document.documentElement.removeAttribute("data-nivel");
  limparAvisos();
  fecharAlertas();
  document.getElementById("plataforma").style.display = "none";
  document.body.classList.add("tela-login");
  document.getElementById("loginUsuario").value = "";
  document.getElementById("loginSenha").value = "";
  trocarTela("login", true);
}

/* ---------- Conta e cartão virtual ---------- */

// Gera uma sequência de números aleatórios com a quantidade de dígitos pedida
function numeroAleatorio(digitos) {
  let numero = "";
  for (let i = 0; i < digitos; i++) {
    numero = numero + Math.floor(Math.random() * 10);
  }
  return numero;
}

function gerarCartao() {
  let mes = 1 + Math.floor(Math.random() * 12);
  let ano = new Date().getFullYear() + 4;
  return {
    numero: numeroAleatorio(16),
    validade: (mes < 10 ? "0" : "") + mes + "/" + String(ano).slice(2),
    cvv: numeroAleatorio(3),
    bloqueado: false
  };
}

function novaConta() {
  return { saldo: 0, extrato: [], totalDepositado: 0, cartao: gerarCartao(), saldoMinimo: 100, limiteSaques: 500, favoritos: [], poupanca: { saldo: 0, minimo: 0 } };
}

// Completa campos que contas antigas não tinham
function normalizarConta(conta) {
  if (conta == null) { conta = novaConta(); }
  if (conta.totalDepositado == null) { conta.totalDepositado = 0; }
  if (conta.cartao == null) { conta.cartao = gerarCartao(); }
  if (conta.saldoMinimo == null) { conta.saldoMinimo = 100; }
  if (conta.limiteSaques == null) { conta.limiteSaques = 500; }
  if (conta.favoritos == null) { conta.favoritos = []; }
  if (conta.poupanca == null) { conta.poupanca = { saldo: 0, minimo: 0 }; }
  return conta;
}

// Conta de quem está logado
function carregarConta() {
  let dados = buscarUsuario(carregarUsuarios(), usuarioLogado);
  return normalizarConta(dados == null ? null : dados.conta);
}

function salvarConta(conta) {
  let usuarios = carregarUsuarios();
  let dados = buscarUsuario(usuarios, usuarioLogado);
  dados.conta = conta;
  salvarUsuarios(usuarios);
}

// Lê o valor digitado; devolve 0 se for vazio, negativo ou inválido
function lerValor(id) {
  let valor = parseFloat(document.getElementById(id).value);
  if (isNaN(valor) || valor <= 0) {
    return 0;
  }
  return valor;
}

/* ---------- Níveis ---------- */

// Descobre o nível pelo total depositado (guarda o maior nível que a pessoa alcançou)
function nivelAtual(totalDepositado) {
  let atual = NIVEIS[0];
  for (let i = 0; i < NIVEIS.length; i++) {
    if (totalDepositado >= NIVEIS[i].minimo) {
      atual = NIVEIS[i];
    }
  }
  return atual;
}

function atualizarNivel(conta) {
  let nivel = nivelAtual(conta.totalDepositado);
  let proximo = NIVEIS[NIVEIS.indexOf(nivel) + 1];
  let badge = document.getElementById("nivelBadge");
  badge.textContent = nivel.nome;
  badge.className = "badge " + nivel.nome.toLowerCase();

  let texto = "Você já depositou " + dinheiro(conta.totalDepositado) + ". No empréstimo, seu nível tem juros de " +
    porcento(nivel.juros) + " ao mês e limite de " + dinheiro(nivel.limite) + ". Seu Community Invest rende " +
    porcento(nivel.rendimento) + " ao mês.";

  if (proximo) {
    let progresso = (conta.totalDepositado - nivel.minimo) / (proximo.minimo - nivel.minimo) * 100;
    document.getElementById("barraNivel").style.width = progresso + "%";
    texto = texto + " Faltam " + dinheiro(proximo.minimo - conta.totalDepositado) + " em depósitos para o " +
      proximo.nome + " (juros de " + porcento(proximo.juros) + ").";
  } else {
    document.getElementById("barraNivel").style.width = "100%";
    texto = texto + " Você está no nível máximo!";
  }
  document.getElementById("nivelTexto").textContent = texto;

  // barra fixa no menu lateral: cor do nível, nome escrito dentro e progresso até o próximo
  let largura = proximo ? (conta.totalDepositado - nivel.minimo) / (proximo.minimo - nivel.minimo) * 100 : 100;
  let preenchimento = document.getElementById("nivelLateralBarra");
  preenchimento.style.width = Math.min(100, Math.max(0, largura)) + "%";
  preenchimento.className = "nivel-lateral-barra " + nivel.nome.toLowerCase();
  document.getElementById("nivelLateralTexto").textContent = "Nível " + nivel.nome;

  // quem chega no Ouro ganha o tema dourado enquanto estiver logado
  if (nivel.nome == "Ouro") {
    document.documentElement.setAttribute("data-nivel", "ouro");
  } else {
    document.documentElement.removeAttribute("data-nivel");
  }
}

/* ---------- Depósito e saque ---------- */

function depositar() {
  let valor = lerValor("valorOperacao");
  if (valor == 0) {
    mostrar("msgOperacao", "Digite um valor maior que zero.", "erro");
    return;
  }
  if (valor > LIMITE_DEPOSITO) {
    mostrar("msgOperacao", "O limite por depósito é de " + dinheiro(LIMITE_DEPOSITO) + ".", "erro");
    return;
  }
  let conta = carregarConta();
  let nivelAntes = nivelAtual(conta.totalDepositado).nome;
  conta.saldo = conta.saldo + valor;
  conta.totalDepositado = conta.totalDepositado + valor;
  conta.extrato.push({ tipo: "Depósito", valor: valor, data: new Date().toLocaleString("pt-BR"), mes: mesAtual() });
  salvarConta(conta);

  let mensagem = "Depósito de " + dinheiro(valor) + " realizado!";
  let nivelDepois = nivelAtual(conta.totalDepositado).nome;
  if (nivelAntes != nivelDepois) {
    mensagem = mensagem + " Você subiu para o nível " + nivelDepois + "!";
  }
  mostrar("msgOperacao", mensagem, "ok");
  document.getElementById("valorOperacao").value = "";
  atualizarTela();
}

// Soma os saques feitos no mês atual (percorre o extrato)
function sacadoNoMes(conta) {
  let total = 0;
  for (let i = 0; i < conta.extrato.length; i++) {
    let item = conta.extrato[i];
    if (item.tipo == "Saque" && item.mes == mesAtual()) {
      total = total + Math.abs(item.valor);
    }
  }
  return total;
}

function sacar() {
  let valor = lerValor("valorOperacao");
  let conta = carregarConta();
  if (valor == 0) {
    mostrar("msgOperacao", "Digite um valor maior que zero.", "erro");
  } else if (valor > conta.saldo) {
    // Decisão do sistema: bloqueia o saque se o saldo não cobre o valor
    mostrar("msgOperacao", "Saldo insuficiente para este saque.", "erro");
  } else if (sacadoNoMes(conta) + valor > conta.limiteSaques) {
    // Decisão do sistema: respeita o limite mensal definido pelo próprio cliente
    mostrar("msgOperacao", "Este saque passa do seu limite mensal de " + dinheiro(conta.limiteSaques) +
      ". Você pode alterar o limite na aba Alertas.", "erro");
  } else {
    let saldoAntes = conta.saldo;
    conta.saldo = conta.saldo - valor;
    conta.extrato.push({ tipo: "Saque", valor: -valor, data: new Date().toLocaleString("pt-BR"), mes: mesAtual() });
    salvarConta(conta);
    let mensagem = "Saque de " + dinheiro(valor) + " realizado!";
    if (valor >= saldoAntes * 0.5) {
      mensagem = mensagem + " Atenção: você sacou metade ou mais do seu saldo.";
    }
    mostrar("msgOperacao", mensagem, "ok");
    document.getElementById("valorOperacao").value = "";
    atualizarTela();
  }
}

/* ---------- Alertas inteligentes ---------- */

// Os alertas ficam guardados e aparecem na janelinha do sininho
let alertasAtuais = [];

function atualizarAlertas(conta) {
  let lista = [];
  let sacado = sacadoNoMes(conta);

  if (conta.extrato.length > 0 && conta.saldo < conta.saldoMinimo) {
    lista.push({ tipo: "aviso", texto: "Saldo baixo: você está abaixo de " + dinheiro(conta.saldoMinimo) + "." });
  }
  if (conta.limiteSaques > 0 && sacado >= conta.limiteSaques) {
    lista.push({ tipo: "perigo", texto: "Você atingiu seu limite de saques do mês (" + dinheiro(conta.limiteSaques) + ")." });
  } else if (conta.limiteSaques > 0 && sacado >= conta.limiteSaques * 0.8) {
    lista.push({ tipo: "aviso", texto: "Você já usou " + Math.round(sacado / conta.limiteSaques * 100) + "% do seu limite de saques do mês." });
  }
  if (conta.cartao.bloqueado) {
    lista.push({ tipo: "aviso", texto: "Seu cartão virtual está bloqueado." });
  }

  alertasAtuais = lista;
  // O sininho ganha uma exclamação quando existe algum alerta
  document.getElementById("seloAlerta").style.display = lista.length > 0 ? "flex" : "none";
}

function abrirAlertas() {
  let caixa = document.getElementById("listaAlertasModal");
  caixa.innerHTML = "";
  if (alertasAtuais.length == 0) {
    let vazio = document.createElement("p");
    vazio.className = "vazio";
    vazio.textContent = "Nenhum alerta no momento.";
    caixa.appendChild(vazio);
  }
  for (let i = 0; i < alertasAtuais.length; i++) {
    let div = document.createElement("div");
    div.className = "alerta " + alertasAtuais[i].tipo;
    div.textContent = alertasAtuais[i].texto;
    caixa.appendChild(div);
  }
  document.getElementById("modalAlertas").hidden = false;
}

// Fecha ao clicar no botão, no fundo escuro ou na tecla Esc
function fecharAlertas(evento) {
  let modal = document.getElementById("modalAlertas");
  if (evento && evento.target != modal) {
    return;
  }
  modal.hidden = true;
}

function salvarAlertas() {
  let minimo = parseFloat(document.getElementById("saldoMinimo").value);
  let limite = parseFloat(document.getElementById("limiteSaques").value);
  if (isNaN(minimo) || isNaN(limite) || minimo < 0 || limite < 0) {
    mostrar("msgAlertas", "Preencha os dois campos com números válidos.", "erro");
    return;
  }
  let conta = carregarConta();
  conta.saldoMinimo = minimo;
  conta.limiteSaques = limite;
  salvarConta(conta);
  mostrar("msgAlertas", "Alertas atualizados!", "ok");
  atualizarTela();
}

/* ---------- Cartão virtual ---------- */

function desenharCartao(conta) {
  let cartao = conta.cartao;
  // Separa o número em grupos de 4 dígitos
  document.getElementById("cartaoNumero").textContent = cartao.numero.replace(/(\d{4})(?=\d)/g, "$1 ");
  document.getElementById("cartaoValidade").textContent = cartao.validade;
  document.getElementById("cartaoCvv").textContent = cartao.cvv;
  document.getElementById("cartaoVirtual").className = cartao.bloqueado ? "cartao-virtual bloqueado" : "cartao-virtual";
  document.getElementById("btnBloqueio").textContent = cartao.bloqueado ? "Desbloquear cartão" : "Bloquear cartão";
}

function alternarBloqueio() {
  let conta = carregarConta();
  conta.cartao.bloqueado = !conta.cartao.bloqueado;
  salvarConta(conta);
  atualizarTela();
}

function novoCartao() {
  let conta = carregarConta();
  conta.cartao = gerarCartao();
  salvarConta(conta);
  mostrar("msgCartao", "Novo cartão gerado! O anterior foi cancelado.", "ok");
  atualizarTela();
}

/* ---------- Tela: saldo, extrato e abas ---------- */

// Mostra ou esconde o saldo (botão do olho)
let saldoOculto = false;

const OLHO_ABERTO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const OLHO_FECHADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.6 8.4 2 12 2 12s4 7 10 7a9.8 9.8 0 0 0 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/></svg>';

function alternarSaldo() {
  saldoOculto = !saldoOculto;
  atualizarTela();
}

// O olhinho fecha quando o saldo está escondido (vale para todos os botões de olho)
function atualizarOlhos() {
  let botoes = document.getElementsByClassName("olho");
  for (let i = 0; i < botoes.length; i++) {
    botoes[i].innerHTML = saldoOculto ? OLHO_FECHADO : OLHO_ABERTO;
    botoes[i].title = saldoOculto ? "Mostrar saldo" : "Esconder saldo";
  }
}

// Filtro do extrato: "todas", "entradas" ou "saidas"
let filtroExtrato = "todas";

function filtrarExtrato(tipo) {
  filtroExtrato = tipo;
  let botoes = document.getElementsByClassName("filtro");
  for (let i = 0; i < botoes.length; i++) {
    botoes[i].classList.toggle("ativo", botoes[i].dataset.filtro == tipo);
  }
  atualizarTela();
}

function oculta(valor) {
  return saldoOculto ? "R$ ••••••" : dinheiro(valor);
}

// Soma as entradas (depósitos) e as saídas (saques) de um mês
function resumoMes(conta, mes) {
  let entradas = 0;
  let saidas = 0;
  for (let i = 0; i < conta.extrato.length; i++) {
    let item = conta.extrato[i];
    if (item.mes == mes && !item.interno) {
      if (item.valor > 0) {
        entradas = entradas + item.valor;
      } else {
        saidas = saidas + Math.abs(item.valor);
      }
    }
  }
  return { entradas: entradas, saidas: saidas };
}

// Barra do limite de saques do mês
function atualizarLimite(conta) {
  let sacado = sacadoNoMes(conta);
  let porcentagem = 0;
  if (conta.limiteSaques > 0) {
    porcentagem = Math.min(100, sacado / conta.limiteSaques * 100);
  }
  let barra = document.getElementById("barraLimite");
  barra.style.width = porcentagem + "%";
  barra.className = porcentagem >= 80 ? "alto" : "";
  document.getElementById("limiteTexto").textContent =
    "Você sacou " + dinheiro(sacado) + " de " + dinheiro(conta.limiteSaques) + " neste mês.";
}

// Gráfico de barras: depósitos e saques dos últimos 6 meses
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function desenharGrafico(conta) {
  let hoje = new Date();
  let meses = [];
  let maior = 1;
  for (let i = 5; i >= 0; i--) {
    let d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    let resumo = resumoMes(conta, d.getFullYear() + "-" + (d.getMonth() + 1));
    meses.push({ nome: MESES[d.getMonth()], entradas: resumo.entradas, saidas: resumo.saidas });
    maior = Math.max(maior, resumo.entradas, resumo.saidas);
  }
  let html = "";
  for (let i = 0; i < meses.length; i++) {
    let m = meses[i];
    // Com o saldo escondido, as barras ficam zeradas e a dica também esconde o valor
    let alturaDep = saldoOculto ? 0 : Math.round(m.entradas / maior * 110);
    let alturaSaq = saldoOculto ? 0 : Math.round(m.saidas / maior * 110);
    html = html + '<div class="g-mes"><div class="g-barras">' +
      '<span class="g-barra dep" style="height:' + alturaDep + 'px" title="Depósitos: ' + oculta(m.entradas) + '"></span>' +
      '<span class="g-barra saq" style="height:' + alturaSaq + 'px" title="Saques: ' + oculta(m.saidas) + '"></span>' +
      '</div><small>' + m.nome + '</small></div>';
  }
  document.getElementById("grafico").innerHTML = html;
}

// Histórico com pesquisa: percorre do mais recente para o mais antigo
function desenharExtrato(conta) {
  let busca = document.getElementById("buscaExtrato").value.toLowerCase();
  let lista = document.getElementById("listaExtrato");
  lista.innerHTML = "";
  let achou = false;

  for (let i = conta.extrato.length - 1; i >= 0; i--) {
    let item = conta.extrato[i];
    if ((item.tipo + " " + item.data).toLowerCase().indexOf(busca) == -1) {
      continue;
    }
    if (filtroExtrato == "entradas" && item.valor < 0) {
      continue;
    }
    if (filtroExtrato == "saidas" && item.valor > 0) {
      continue;
    }
    achou = true;
    let classe = item.valor > 0 ? "entrada" : "saida";
    let li = document.createElement("li");
    let esquerda = document.createElement("span");
    esquerda.textContent = item.tipo + " ";
    let data = document.createElement("small");
    data.className = "vazio";
    data.textContent = item.data;
    esquerda.appendChild(data);
    let direita = document.createElement("span");
    direita.className = classe;
    direita.textContent = dinheiro(item.valor);
    li.appendChild(esquerda);
    li.appendChild(direita);
    lista.appendChild(li);
  }

  if (!achou) {
    let aviso = conta.extrato.length == 0 ? "Nenhuma movimentação ainda. Faça um depósito para começar." : "Nenhuma movimentação encontrada.";
    lista.innerHTML = '<li class="vazio">' + aviso + '</li>';
  }
}

// Atualiza tudo que aparece na plataforma
function atualizarTela() {
  let conta = carregarConta();
  let resumo = resumoMes(conta, mesAtual());
  document.getElementById("saldoTela").textContent = oculta(conta.saldo);
  document.getElementById("saldoExtrato").textContent = oculta(conta.saldo);
  document.getElementById("totalDepositadoTela").textContent = oculta(conta.totalDepositado);
  document.getElementById("poupancaTela").textContent = oculta(conta.poupanca.saldo);
  document.getElementById("entradaMesTela").textContent = oculta(resumo.entradas);
  document.getElementById("saidaMesTela").textContent = oculta(resumo.saidas);
  atualizarNivel(conta);
  atualizarLimite(conta);
  atualizarAlertas(conta);
  desenharCartao(conta);
  desenharGrafico(conta);
  desenharExtrato(conta);
  desenharFavoritos(conta);
  prepararEmprestimo(conta);
  atualizarPoupanca(conta);
  atualizarOlhos();
}

// Troca a tela visível e marca o item do menu
function mostrarAba(id) {
  limparAvisos();
  let abas = document.getElementsByClassName("aba");
  for (let i = 0; i < abas.length; i++) {
    abas[i].classList.remove("ativa");
  }
  document.getElementById(id).classList.add("ativa");
  fecharMenu();

  let itens = document.getElementsByClassName("menu-item");
  for (let i = 0; i < itens.length; i++) {
    itens[i].classList.toggle("ativo", itens[i].dataset.aba == id);
  }

  if (id == "abaAlertas") {
    let conta = carregarConta();
    document.getElementById("saldoMinimo").value = conta.saldoMinimo;
    document.getElementById("limiteSaques").value = conta.limiteSaques;
  }
  if (id == "abaTransferir") {
    document.getElementById("msgTransferencia").textContent = "";
    document.getElementById("msgTransferencia").className = "mensagem";
  }
  if (id == "abaConfig") {
    // Mostra o login da conta (só leitura) e limpa o campo da senha
    let dados = buscarUsuario(carregarUsuarios(), usuarioLogado);
    document.getElementById("configUsuario").value = dados.usuario;
    document.getElementById("novaSenha").value = "";
    document.getElementById("msgConfig").textContent = "";
    document.getElementById("msgConfig").className = "mensagem";
  }
  window.scrollTo(0, 0);
}

/* ---------- Transferência entre contas ---------- */

function transferir() {
  let destino = document.getElementById("destinoTransferencia").value.trim();
  let valor = lerValor("valorTransferencia");
  let usuarios = carregarUsuarios();
  let origem = buscarUsuario(usuarios, usuarioLogado);
  let favorecido = buscarUsuario(usuarios, destino);   // null se a pessoa não tiver cadastro
  let contaOrigem = normalizarConta(origem.conta);

  if (destino == "") {
    mostrar("msgTransferencia", "Digite o usuário de quem vai receber.", "erro");
  } else if (valor == 0) {
    mostrar("msgTransferencia", "Digite um valor maior que zero.", "erro");
  } else if (favorecido == null) {
    // Só dá para transferir para quem já tem cadastro no banco
    mostrar("msgTransferencia", "Esse usuário não tem cadastro no Community Bank.", "erro");
  } else if (destino == usuarioLogado) {
    mostrar("msgTransferencia", "Você não pode transferir para você mesmo.", "erro");
  } else if (valor > contaOrigem.saldo) {
    mostrar("msgTransferencia", "Saldo insuficiente para esta transferência.", "erro");
  } else {
    let contaDestino = normalizarConta(favorecido.conta);
    let agora = new Date().toLocaleString("pt-BR");

    // Tira de quem envia e coloca em quem recebe, com registro no extrato dos dois
    contaOrigem.saldo = contaOrigem.saldo - valor;
    contaOrigem.extrato.push({ tipo: "Transferência para " + favorecido.nome, valor: -valor, data: agora, mes: mesAtual() });
    contaDestino.saldo = contaDestino.saldo + valor;
    contaDestino.extrato.push({ tipo: "Transferência de " + origem.nome, valor: valor, data: agora, mes: mesAtual() });

    // Chavinha "Salvar nos favoritos" ligada: guarda o contato (sem repetir)
    if (document.getElementById("salvarFavorito").checked) {
      let jaEhFavorito = false;
      for (let i = 0; i < contaOrigem.favoritos.length; i++) {
        if (contaOrigem.favoritos[i].usuario == favorecido.usuario) {
          jaEhFavorito = true;
        }
      }
      if (!jaEhFavorito) {
        contaOrigem.favoritos.push({ usuario: favorecido.usuario, nome: favorecido.nome });
      }
    }

    origem.conta = contaOrigem;
    favorecido.conta = contaDestino;
    salvarUsuarios(usuarios);

    mostrar("msgTransferencia", "Transferência de " + dinheiro(valor) + " enviada para " + favorecido.nome + "!", "ok");
    document.getElementById("destinoTransferencia").value = "";
    document.getElementById("valorTransferencia").value = "";
    document.getElementById("salvarFavorito").checked = false;
    atualizarTela();
  }
}

// Mostra só os contatos favoritos; ao clicar no nome, o usuário vai para o campo
function desenharFavoritos(conta) {
  let caixa = document.getElementById("listaDestinatarios");
  caixa.innerHTML = "";

  if (conta.favoritos.length == 0) {
    let aviso = document.createElement("p");
    aviso.className = "vazio";
    aviso.textContent = "Nenhum favorito ainda. Ligue a chavinha \"Salvar nos favoritos\" ao transferir.";
    caixa.appendChild(aviso);
    return;
  }

  for (let i = 0; i < conta.favoritos.length; i++) {
    let pessoa = conta.favoritos[i];
    let item = document.createElement("div");
    item.className = "favorito";

    let botao = document.createElement("button");
    botao.type = "button";
    botao.className = "destinatario";
    let avatar = document.createElement("span");
    avatar.className = "mini-avatar";
    avatar.textContent = pessoa.nome.charAt(0).toUpperCase();
    let textos = document.createElement("span");
    let nome = document.createElement("b");
    nome.textContent = pessoa.nome;
    let usuario = document.createElement("small");
    usuario.textContent = pessoa.usuario;
    textos.appendChild(nome);
    textos.appendChild(usuario);
    botao.appendChild(avatar);
    botao.appendChild(textos);
    botao.onclick = function () { escolherDestinatario(pessoa.usuario); };

    let remover = document.createElement("button");
    remover.type = "button";
    remover.className = "remover-favorito";
    remover.textContent = "×";
    remover.title = "Remover dos favoritos";
    remover.setAttribute("aria-label", "Remover " + pessoa.nome + " dos favoritos");
    remover.onclick = function () { removerFavorito(pessoa.usuario); };

    item.appendChild(botao);
    item.appendChild(remover);
    caixa.appendChild(item);
  }
}

function removerFavorito(usuario) {
  let conta = carregarConta();
  let restantes = [];
  for (let i = 0; i < conta.favoritos.length; i++) {
    if (conta.favoritos[i].usuario != usuario) {
      restantes.push(conta.favoritos[i]);
    }
  }
  conta.favoritos = restantes;
  salvarConta(conta);
  atualizarTela();
}

function escolherDestinatario(usuario) {
  document.getElementById("destinoTransferencia").value = usuario;
  document.getElementById("valorTransferencia").focus();
}

/* ---------- Configurar conta: alterar senha ---------- */

function alterarSenha() {
  let novaSenha = document.getElementById("novaSenha").value;
  let usuarios = carregarUsuarios();
  let dados = buscarUsuario(usuarios, usuarioLogado);

  if (novaSenha == "") {
    mostrar("msgConfig", "Digite a nova senha.", "erro");
  } else if (novaSenha.length < 4) {
    mostrar("msgConfig", "A senha precisa ter pelo menos 4 caracteres.", "erro");
  } else if (novaSenha == dados.senha) {
    mostrar("msgConfig", "A nova senha precisa ser diferente da atual.", "erro");
  } else {
    dados.senha = novaSenha;
    salvarUsuarios(usuarios);
    mostrar("msgConfig", "Senha alterada com sucesso!", "ok");
    document.getElementById("novaSenha").value = "";
  }
}

/* ---------- Simulador de empréstimo (juros e limite dependem do nível) ---------- */

// Parcelas escolhidas nos botões rápidos (6x, 12x, 24x, 36x)
let parcelasEscolhidas = 12;

function escolherParcelas(n) {
  parcelasEscolhidas = n;
  let botoes = document.getElementsByClassName("parcela");
  for (let i = 0; i < botoes.length; i++) {
    botoes[i].classList.toggle("ativo", Number(botoes[i].dataset.parcelas) == n);
  }
}

// A barra e o campo de número andam juntos
function sincronizarValor(origem) {
  let barra = document.getElementById("sliderEmprestimo");
  let campo = document.getElementById("valorEmprestimo");
  if (origem == "slider") {
    campo.value = barra.value;
  } else {
    barra.value = campo.value;
  }
}

// Mostra o limite pré-aprovado do nível e ajusta a barra até esse limite
function prepararEmprestimo(conta) {
  let nivel = nivelAtual(conta.totalDepositado);
  let barra = document.getElementById("sliderEmprestimo");
  let campo = document.getElementById("valorEmprestimo");
  document.getElementById("limitePreAprovado").textContent = dinheiro(nivel.limite);
  document.getElementById("nivelEmprestimo").textContent = "Nível " + nivel.nome + " · juros de " + porcento(nivel.juros) + " ao mês";
  barra.max = nivel.limite;
  campo.max = nivel.limite;
  if (campo.value == "") {
    campo.value = Math.min(1000, nivel.limite);
    barra.value = campo.value;
  } else if (Number(campo.value) > nivel.limite) {
    campo.value = nivel.limite;
    barra.value = nivel.limite;
  }
}

function simularEmprestimo() {
  let valor = parseFloat(document.getElementById("valorEmprestimo").value);
  let caixa = document.getElementById("resultadoEmprestimo");
  caixa.style.display = "block";

  let conta = carregarConta();
  let nivel = nivelAtual(conta.totalDepositado);
  let juros = nivel.juros;
  let n = parcelasEscolhidas;

  if (isNaN(valor) || valor < 500) {
    caixa.innerHTML = "<span class='erro'>Escolha um valor de pelo menos R$ 500,00.</span>";
  } else if (valor > nivel.limite) {
    // Decisão: o valor não pode passar do limite pré-aprovado do nível
    caixa.innerHTML = "<span class='erro'>Empréstimo recusado.</span> O valor passa do seu limite pré-aprovado de " +
      dinheiro(nivel.limite) + ". Deposite mais para subir de nível.";
  } else {
    // Fórmula da parcela fixa (Tabela Price): P = V * i / (1 - (1 + i)^-n)
    let parcela = valor * juros / (1 - Math.pow(1 + juros, -n));
    let total = parcela * n;
    caixa.innerHTML = "Parcelas: <strong>" + n + "x de " + dinheiro(parcela) + "</strong><br>" +
      "Total a pagar: " + dinheiro(total) + "<br>" +
      "Nível " + nivel.nome + ": juros de " + porcento(juros) + " ao mês";
  }
}


/* ---------- Poupança ---------- */

// Evita erros de casas decimais (0.1 + 0.2) nos valores guardados
function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

// Regra: o dinheiro investido rende todo mês, de acordo com o nível da pessoa (ver NIVEIS).
// Investir tira da conta corrente e coloca no Community Invest; resgatar faz o caminho contrário.
function guardarPoupanca() {
  let valor = lerValor("valorPoupanca");
  let conta = carregarConta();
  if (valor == 0) {
    mostrar("msgPoupanca", "Digite um valor maior que zero.", "erro");
  } else if (valor > conta.saldo) {
    mostrar("msgPoupanca", "Saldo insuficiente na conta corrente.", "erro");
  } else {
    conta.saldo = arredondar(conta.saldo - valor);
    conta.poupanca.saldo = arredondar(conta.poupanca.saldo + valor);
    conta.extrato.push({ tipo: "Investimento no Community Invest", valor: -valor, data: new Date().toLocaleString("pt-BR"), mes: mesAtual(), interno: true });
    salvarConta(conta);
    mostrar("msgPoupanca", "Investimento realizado! " + dinheiro(valor) + " aplicados no Community Invest.", "ok");
    document.getElementById("valorPoupanca").value = "";
    atualizarTela();
  }
}

function resgatarPoupanca() {
  let valor = lerValor("valorPoupanca");
  let conta = carregarConta();
  if (valor == 0) {
    mostrar("msgPoupanca", "Digite um valor maior que zero.", "erro");
  } else if (valor > conta.poupanca.saldo) {
    mostrar("msgPoupanca", "Saldo insuficiente no Community Invest.", "erro");
  } else {
    conta.poupanca.saldo = arredondar(conta.poupanca.saldo - valor);
    // guarda o menor saldo que o investimento chegou a ter
    conta.poupanca.minimo = Math.min(conta.poupanca.minimo, conta.poupanca.saldo);
    conta.saldo = arredondar(conta.saldo + valor);
    conta.extrato.push({ tipo: "Resgate do Community Invest", valor: valor, data: new Date().toLocaleString("pt-BR"), mes: mesAtual(), interno: true });
    salvarConta(conta);
    mostrar("msgPoupanca", dinheiro(valor) + " resgatados para a conta corrente.", "ok");
    document.getElementById("valorPoupanca").value = "";
    atualizarTela();
  }
}

// Botão discreto, usado só na demonstração: credita o rendimento de um mês
function passarMes() {
  let conta = carregarConta();
  let nivel = nivelAtual(conta.totalDepositado);
  // o botão representa a passagem de um mês: o que está investido agora rende já no primeiro clique
  let base = conta.poupanca.saldo;
  let rendimento = arredondar(base * nivel.rendimento);

  if (conta.poupanca.saldo == 0) {
    mostrar("msgPoupanca", "Mês simulado. Não há dinheiro no Community Invest para render.", "erro");
  } else if (rendimento == 0) {
    mostrar("msgPoupanca", "Mês simulado, mas nada rendeu.", "erro");
    conta.poupanca.minimo = conta.poupanca.saldo;
    salvarConta(conta);
  } else {
    conta.poupanca.saldo = arredondar(conta.poupanca.saldo + rendimento);
    conta.poupanca.minimo = conta.poupanca.saldo;
    conta.extrato.push({ tipo: "Rendimento do Community Invest", valor: rendimento, data: new Date().toLocaleString("pt-BR"), mes: mesAtual(), interno: true });
    salvarConta(conta);
    mostrar("msgPoupanca", "Mês simulado! Rendimento de " + dinheiro(rendimento) + " (" + porcento(nivel.rendimento) +
      " sobre " + dinheiro(base) + ", nível " + nivel.nome + ").", "ok");
  }
  atualizarTela();
}

function atualizarPoupanca(conta) {
  let nivel = nivelAtual(conta.totalDepositado);
  document.getElementById("saldoPoupanca").textContent = oculta(conta.poupanca.saldo);
  document.getElementById("rendimentoInfo").textContent = "Nível " + nivel.nome + ": rende " + porcento(nivel.rendimento) + " ao mês";
  document.getElementById("notaPoupanca").innerHTML = "Disponível na conta corrente para investir: <b>" + oculta(conta.saldo) + "</b>";
  // o simulador já começa com o valor da poupança, até a pessoa mexer no campo
  if (!simEditado) {
    // com o saldo escondido, o campo não mostra o valor da poupança
    document.getElementById("valorSimPoupanca").value = (conta.poupanca.saldo > 0 && !saldoOculto) ? conta.poupanca.saldo : "";
  }
}

let simEditado = false;

function alternarSimulador() {
  let bloco = document.getElementById("blocoSimulador");
  let botao = document.getElementById("btnSimulador");
  bloco.hidden = !bloco.hidden;
  botao.setAttribute("aria-expanded", !bloco.hidden);
  botao.title = bloco.hidden ? "Abrir simulador" : "Fechar simulador";
}

// Juros compostos: M = C * (1 + i)^n
function simularRendimento() {
  let valor = parseFloat(document.getElementById("valorSimPoupanca").value);
  let meses = parseInt(document.getElementById("mesesSimPoupanca").value);
  let caixa = document.getElementById("resultadoPoupanca");
  caixa.style.display = "block";
  let nivel = nivelAtual(carregarConta().totalDepositado);

  if (isNaN(valor) || valor <= 0) {
    caixa.innerHTML = "<span class='erro'>Digite um valor maior que zero.</span>";
  } else if (isNaN(meses) || meses < 1) {
    caixa.innerHTML = "<span class='erro'>Digite pelo menos 1 mês.</span>";
  } else {
    let final = valor * Math.pow(1 + nivel.rendimento, meses);
    caixa.innerHTML = "Em <strong>" + meses + " meses</strong> você teria <strong>" + dinheiro(final) + "</strong><br>" +
      "Rendimento: " + dinheiro(final - valor) + "<br>" +
      "Nível " + nivel.nome + ": " + porcento(nivel.rendimento) + " ao mês";
  }
}

// Garante que só o login aparece no carregamento inicial
function formatarReais(valor) {
  return "R$ " + valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Cards com os níveis na tela de login (valores vêm de NIVEIS)
function desenharNiveisPublicos() {
  let grade = document.getElementById("niveisGrade");
  if (!grade) { return; }
  grade.innerHTML = "";
  for (let i = 0; i < NIVEIS.length; i++) {
    let n = NIVEIS[i];
    let juros = (n.juros * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
    let exigencia = n.minimo == 0 ? "Você já começa aqui" : "A partir de " + formatarReais(n.minimo);
    let card = document.createElement("article");
    card.className = "nivel-card";
    card.innerHTML =
      '<span class="badge ' + n.nome.toLowerCase() + '">' + n.nome + '</span>' +
      '<dl><dt>Como chegar</dt><dd>' + exigencia + ' depositado</dd>' +
      '<dt>Juros do empréstimo</dt><dd>' + juros + '% ao mês</dd>' +
      '<dt>Limite pré-aprovado</dt><dd>' + formatarReais(n.limite) + '</dd>' +
      '<dt>Rendimento do Community Invest</dt><dd>' + (n.rendimento * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + '% ao mês</dd></dl>';
    grade.appendChild(card);
  }
}

// Menu lateral recolhido no celular
function alternarMenu() {
  let lateral = document.querySelector(".lateral");
  let aberto = lateral.classList.toggle("aberto");
  document.getElementById("btnMenu").setAttribute("aria-expanded", aberto);
}

function fecharMenu() {
  let lateral = document.querySelector(".lateral");
  if (lateral) { lateral.classList.remove("aberto"); }
  let botao = document.getElementById("btnMenu");
  if (botao) { botao.setAttribute("aria-expanded", "false"); }
}

// No celular, sininho e sair ficam no topo escuro, ao lado do nome
function posicionarBotoesTopo() {
  let botoes = document.querySelector(".topo-botoes");
  let slot = document.getElementById("slotBotoesCelular");
  let topo = document.querySelector(".topo");
  if (!botoes || !slot || !topo) { return; }
  if (window.matchMedia("(max-width: 900px)").matches) {
    slot.appendChild(botoes);
  } else {
    topo.appendChild(botoes);
    fecharMenu();
  }
}

// Faz a tecla Enter, dentro dos campos indicados, chamar uma função
function teclaEnter(ids, funcao) {
  for (let i = 0; i < ids.length; i++) {
    document.getElementById(ids[i]).addEventListener("keydown", (evento) => {
      if (evento.key == "Enter") {
        evento.preventDefault();
        funcao();
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  desenharNiveisPublicos();
  animarNumeros();
  // Enter no teclado faz o mesmo que clicar no botão (login e cadastro)
  teclaEnter(["loginUsuario", "loginSenha"], entrar);
  teclaEnter(["nome", "email", "usuario", "senha"], cadastrar);
  posicionarBotoesTopo();
  window.addEventListener('resize', posicionarBotoesTopo);
  trocarTela('login', false);
  document.addEventListener('keydown', (evento) => {
    if (evento.key == 'Escape') { fecharAlertas(); fecharAcesso(); }
  });
});
