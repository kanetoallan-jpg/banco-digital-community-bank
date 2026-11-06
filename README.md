# Community Bank

Banco digital fictício feito com **HTML, CSS e JavaScript puro**, sem frameworks e sem servidor. Projeto da atividade do curso **Introdução à Programação (JavaScript)**, da Fundação Bradesco.

> Projeto educacional. Não é um banco real: o CNPJ, os telefones, o endereço, os números e as empresas que aparecem no site são fictícios.

**Demonstração:** https://kanetoallan-jpg.github.io/banco-digital-community-bank/ (disponível quando o GitHub Pages estiver ativado no repositório)

---

## O que o sistema faz

**Tela inicial**
- Apresentação do banco, números de destaque com contagem animada, empresas parceiras (fictícias), seção "Conheça o banco" e rodapé.
- Cards públicos dos três níveis (Bronze, Prata e Ouro) com as vantagens de cada um.
- Fundo animado e layout responsivo (computador e celular).

**Acesso à conta**
- Cadastro e login em uma janela com efeito de virar o card.
- Validação dos campos, e a tecla **Enter** envia o formulário.

**Dentro da conta**
- **Início:** resumo da conta, nível atual, limite de saques e gráfico de movimentação.
- **Depositar e sacar:** com limite de R$ 100.000.000,00 por depósito e limite mensal de saques.
- **Transferir:** entre contas cadastradas, com destinatários favoritos.
- **Extrato:** busca e filtros (todas, entradas e saídas).
- **Empréstimo:** simulador com parcelas fixas (Tabela Price), de acordo com o nível.
- **Investimento (Community Invest):** investir, resgatar e simular o rendimento com juros compostos.
- **Cartão virtual:** número, validade e CVV gerados, com bloqueio e geração de um novo cartão.
- **Alertas:** avisos de saldo baixo e de limite de saques.
- **Configurar conta:** alteração de senha e dos alertas.
- Botão para esconder o saldo e barra com o nível do cliente.

## Níveis

O nível depende do total já depositado no banco. Quanto mais alto, melhores as condições.

| Nível | Total depositado | Juros do empréstimo | Limite pré-aprovado | Rendimento (Community Invest) |
|-------|------------------|---------------------|---------------------|-------------------------------|
| Bronze | desde o início | 5% ao mês | R$ 2.000,00 | 0,5% ao mês |
| Prata | R$ 10.000,00 | 3,5% ao mês | R$ 10.000,00 | 0,8% ao mês |
| Ouro | R$ 25.000,00 | 2,5% ao mês | R$ 50.000,00 | 1,1% ao mês |

Quem chega ao nível **Ouro** ganha um tema preto e dourado e o cartão virtual dourado.

## Tecnologias

- **HTML5** para a estrutura das páginas
- **CSS3** com variáveis, grid, flexbox, animações e design responsivo
- **JavaScript (ES6)** com funções, condicionais, laços e manipulação do DOM
- **localStorage** para guardar usuários e contas no próprio navegador

## Como usar

1. Baixe ou clone o repositório:
   ```bash
   git clone https://github.com/kanetoallan-jpg/banco-digital-community-bank.git
   ```
2. Abra o arquivo `index.html` no navegador. Não precisa instalar nada.
3. Clique em **Abrir minha conta**, faça o cadastro e entre.

Os dados ficam guardados no `localStorage` do navegador. Para começar do zero, limpe os dados do site nas configurações do navegador.

## Estrutura do projeto

```
├── index.html       # estrutura da página (tela inicial, acesso e área da conta)
├── style.css        # estilos, temas e responsividade
├── script.js        # toda a lógica: cadastro, login, contas, níveis e investimento
├── foto-inicio.jpg  # imagem da tela inicial
├── favicon.svg      # ícone da aba
└── favicon.png      # ícone da aba (alternativo)
```

## Como os dados são guardados

Cada usuário é um objeto na lista `usuarios` do `localStorage`:

```js
{
  nome, email, usuario, senha,
  conta: {
    saldo, extrato, totalDepositado,
    cartao, saldoMinimo, limiteSaques,
    favoritos, poupanca: { saldo, minimo }
  }
}
```

## Observações

- Por ser um projeto de estudo, a senha fica guardada no navegador sem criptografia. Um sistema real precisaria de servidor e banco de dados.
- O botão discreto com ícone de relógio, na tela de investimento, simula a passagem de um mês e credita o rendimento. Ele existe só para demonstrar o Community Invest.

## Autor

Feito por [@kanetoallan-jpg](https://github.com/kanetoallan-jpg), engenheiro mecânico em transição de carreira para a programação.
