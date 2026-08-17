// Book institucional CapiLoop — convite a parceiros
#import "report-theme.typ": report-theme

#let forest = rgb("#173B2B")
#let avocado = rgb("#4A7C59")
#let lime = rgb("#B6ED33")
#let cream = rgb("#F7F4EC")
#let charcoal = rgb("#1E2823")
#let mist = rgb("#E9EFE7")
#let warm = rgb("#F1BE67")

#let label(text-value) = box(
  fill: lime,
  radius: 99pt,
  inset: (x: 9pt, y: 4pt),
  text(font: "Noto Sans", size: 8.5pt, weight: "bold", fill: forest)[#text-value],
)

#let pull-quote(content) = block(
  fill: mist,
  radius: 8pt,
  inset: 16pt,
  text(size: 15pt, weight: "bold", fill: forest)[#content],
)

#let callout(title, body) = block(
  fill: forest,
  radius: 10pt,
  inset: 16pt,
)[
  #text(font: "Noto Sans", size: 10pt, weight: "bold", fill: lime)[#title]
  #v(5pt)
  #text(size: 10pt, fill: cream)[#body]
]

#show: report-theme.with(
  title: "CapiLoop para parceiros",
  author: "CapiLoop",
  rhythm: "report",
  running-header: true,
)

#set text(font: ("Noto Sans", "DejaVu Sans"), lang: "pt", region: "br", fill: charcoal)
#show heading: set text(fill: forest)

// Capa
#page(margin: 0pt, numbering: none, header: none, fill: forest)[
  #place(top + right, dx: -18pt, dy: 18pt)[
    #image("assets/capiloop-logo.png", width: 34mm)
  ]
  #align(center + horizon)[
    #block(width: 77%, spacing: 0pt)[
      #label([PARCERIA PARA COMÉRCIOS LOCAIS])
      #v(18pt)
      #text(font: "Noto Sans", size: 35pt, weight: "bold", fill: cream)[
        Comida boa\
        encontra uma\
        *nova mesa.*
      ]
      #v(18pt)
      #text(size: 15pt, fill: luma(215))[Uma proposta simples para transformar excedentes do dia em novas oportunidades para o seu estabelecimento e para o bairro.]
      #v(28pt)
      #line(length: 100%, stroke: 1.2pt + lime)
      #v(16pt)
      #text(font: "Noto Sans", size: 12pt, weight: "bold", fill: lime)[CapiLoop para parceiros]
      #v(6pt)
      #text(size: 10.5pt, fill: cream)[Menos desperdício. Mais sabor. Mais movimento local.]
    ]
  ]
  #place(bottom + left, dx: 30pt, dy: -30pt)[
    #text(size: 9pt, fill: luma(190))[Book institucional • Agosto de 2026]
  ]
]

#pagebreak()

= Uma boa oportunidade não deveria terminar na lixeira

A CapiLoop é uma plataforma de sacolas surpresa criada para aproximar *comida boa* de pessoas que querem descobrir sabores do bairro e consumir com mais consciência. Para o parceiro, é uma forma organizada de dar uma nova saída a produtos ainda próprios para consumo, especialmente em horários próximos ao encerramento ou em dias de produção variável.

#pull-quote[O seu estabelecimento continua sendo o protagonista. A CapiLoop entra para organizar a descoberta, a reserva e a retirada.]

== O que entra na parceria

#table(
  columns: (1fr, 2.2fr),
  inset: 6pt,
  stroke: 0.4pt + luma(205),
  table.header(
    [*Item*], [*Como funciona na prática*],
  ),
  [Sacolas do dia], [O parceiro define uma quantidade limitada de sacolas e uma faixa de retirada.],
  [Surpresa com critério], [A pessoa compra a experiência de descoberta; o parceiro mantém a liberdade de compor conforme o dia.],
  [Visibilidade local], [O estabelecimento passa a ser encontrado por pessoas interessadas em comida boa perto delas.],
  [Retirada organizada], [Cada reserva gera um comprovante; a retirada é confirmada por código no portal do parceiro.],
)

= Por que pode fazer sentido para o seu negócio

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  callout([DAR NOVO DESTINO],[Transforme excedentes do dia em uma experiência que valoriza o cuidado colocado em cada produção.]),
  callout([CONHECER NOVAS PESSOAS],[Crie uma porta de entrada para quem ainda não conhece o seu café, padaria, mercado ou restaurante.]),
  callout([OPERAR COM LEVEZA],[Cadastre as sacolas pelo portal, determine a janela de retirada e confirme o código quando a pessoa chegar.]),
  callout([FORTALECER O BAIRRO],[Participe de uma rede que aproxima bons comércios e consumidores locais.]),
)

== Onde a CapiLoop encaixa melhor

#table(
  columns: (1fr, 2.2fr),
  inset: 6pt,
  stroke: 0.4pt + luma(205),
  table.header(
    [*Tipo de estabelecimento*], [*Oportunidade típica*],
  ),
  [Padarias e confeitarias], [Itens do fim do dia, produção extra e variedade de pães e doces.],
  [Cafés e bistrôs], [Preparos prontos, sobremesas e produtos de vitrine.],
  [Mercados e hortifrutis], [Produtos em condição adequada para consumo que pedem giro rápido.],
  [Restaurantes e hotéis], [Produções excedentes compatíveis com uma janela curta de retirada.],
)

#pagebreak()

= Do cadastro à primeira retirada

O começo foi pensado para caber na rotina de um comércio local. A parceria passa por uma validação inicial para manter o catálogo confiável e, depois disso, a gestão diária fica concentrada no portal do parceiro.

== O caminho em cinco passos

#grid(
  columns: (auto, 1fr),
  column-gutter: 12pt,
  row-gutter: 13pt,
  text(size: 16pt, weight: "bold", fill: avocado)[01], [*Faça o cadastro.* Informe os dados do estabelecimento e valide o CNPJ.],
  text(size: 16pt, weight: "bold", fill: avocado)[02], [*Aguarde a aprovação.* A CapiLoop revisa o cadastro antes da primeira publicação.],
  text(size: 16pt, weight: "bold", fill: avocado)[03], [*Crie as sacolas do dia.* Defina quantidade, valor, categoria e janela de retirada.],
  text(size: 16pt, weight: "bold", fill: avocado)[04], [*Receba as reservas.* A sacola entra no catálogo quando estiver pronta para o público.],
  text(size: 16pt, weight: "bold", fill: avocado)[05], [*Confirme a retirada.* Digite o código do comprovante no portal quando a pessoa chegar.],
)

== O que o parceiro controla

O parceiro define a disponibilidade real de cada dia, a janela de retirada e a composição possível para a sacola. A proposta não é substituir o atendimento do estabelecimento, mas complementar a operação com uma nova rota para itens que já foram produzidos.

#callout([UMA REGRA SIMPLES],[Publique apenas o que o seu time consegue separar e entregar com a mesma qualidade que representa a sua casa.])

= O que torna uma boa sacola

Uma boa sacola não precisa prometer itens exatos. Ela precisa comunicar com clareza a categoria, a faixa de retirada e a experiência que a pessoa pode esperar. Quanto mais consistente for a operação, maior a chance de gerar uma primeira visita que vire recorrência.

#table(
  columns: (1fr, 2.2fr),
  inset: 6pt,
  stroke: 0.4pt + luma(205),
  table.header(
    [*Elemento*], [*Boa prática para começar*],
  ),
  [Quantidade], [Comece pequeno, com uma capacidade que o time consiga separar sem atrito.],
  [Horário], [Escolha uma janela objetiva, próxima da rotina de fechamento ou troca de turno.],
  [Comunicação], [Explique a categoria da sacola sem prometer produtos específicos.],
  [Retirada], [Oriente a equipe sobre a confirmação pelo código do comprovante.],
)

#pagebreak()

= Convite: vamos colocar o seu bairro no loop

Se o seu estabelecimento acredita que comida boa merece ser aproveitada até o fim, a CapiLoop quer conversar. O primeiro passo é simples: entender a sua rotina, identificar a melhor janela de retirada e desenhar uma sacola que faça sentido para o seu negócio.

#align(center)[
  #box(fill: lime, radius: 14pt, inset: 24pt, width: 90%)[
    #align(center)[
      #text(font: "Noto Sans", size: 21pt, weight: "bold", fill: forest)[Vamos começar com uma conversa curta.]
      #v(8pt)
      #text(size: 11pt, fill: forest)[Conheça a proposta, tire dúvidas sobre a operação e avalie um piloto que respeite a rotina da sua equipe.]
      #v(16pt)
      #text(font: "Noto Sans", size: 11pt, weight: "bold", fill: forest)[CapiLoop • Comida boa encontra uma nova mesa]
    ]
  ]
]

= Guia prático para captar estabelecimentos

Este roteiro foi feito para a fase inicial de expansão local. O objetivo não é abordar todas as pessoas; é construir uma primeira base de parceiros que tenha aderência real à proposta e consiga executar bem a experiência.

== 1. Faça uma lista curta e qualificada

Comece pelo seu próprio raio de deslocamento. Priorize estabelecimentos com produção diária, vitrine de alimentos, horário de fechamento claro e uma reputação local já consolidada. Uma primeira lista equilibrada pode misturar padarias, cafés, bistrôs, mercados e hortifrutis.

#table(
  columns: (1fr, 2.2fr),
  inset: 6pt,
  stroke: 0.4pt + luma(205),
  table.header(
    [*Critério de priorização*], [*Pergunta de qualificação*],
  ),
  [Produção diária], [Há variação de itens ao longo do dia?],
  [Janela operacional], [Existe um horário previsível para retirada?],
  [Time engajado], [Há alguém responsável que possa cuidar do portal?],
  [Fit de marca], [O estabelecimento valoriza qualidade, comunidade e cuidado?],
)

== 2. Faça uma abordagem que respeite o tempo de quem atende

Evite vender a plataforma em uma primeira mensagem longa. Use uma abordagem curta, personalizada e orientada à rotina do estabelecimento. O objetivo inicial é marcar uma conversa de quinze minutos, não fechar a parceria no primeiro contato.

#pull-quote[“Oi, eu sou da CapiLoop. Estamos criando uma forma simples de dar uma nova saída à comida boa do dia e trazer novas pessoas para comércios locais. Posso te explicar a ideia em quinze minutos nesta semana?”]

== 3. Conduza uma conversa simples e concreta

Durante a reunião, fale menos de tecnologia e mais de rotina. Pergunte o que costuma sobrar, quando isso acontece, quem poderia separar as sacolas e qual retirada seria confortável para a equipe. Apresente um piloto pequeno, com poucas sacolas e uma única janela de retirada.

== 4. Comece com um piloto de sete dias

O piloto deve ter uma hipótese objetiva: testar a capacidade de separação, entender a procura e ajustar a janela de retirada. Após a primeira semana, reveja com o parceiro o que funcionou e escolha juntos se é o momento de aumentar, manter ou ajustar a oferta.

== 5. Crie constância antes de escala

Os primeiros parceiros definem a experiência da marca. Priorize retirada pontual, comunicação clara e sacolas que representem bem cada casa. Uma base pequena e consistente é mais valiosa do que um catálogo grande com operação irregular.

#pagebreak()

= Checklist de início do parceiro

#grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 10pt,
  callout([ANTES DE PUBLICAR],[Dados e CNPJ revisados. Responsável pelo portal definido. Categoria e composição possível alinhadas.]),
  callout([SEMANA DE ESTREIA],[Sacolas e janela de retirada definidos. Pessoa do caixa ou cozinha orientada. Catálogo atualizado apenas com disponibilidade real.]),
  callout([PRIMEIRAS RETIRADAS],[Confirmar que o fluxo de código está claro. Coletar percepções de volume e horário. Ajustar quantidade, descrição ou janela.]),
)

#callout([O MELHOR COMEÇO],[É aquele que o parceiro consegue repetir com tranquilidade no dia seguinte.])

#align(center)[
  #v(22pt)
  #image("assets/capiloop-logo.png", width: 26mm)
  #v(8pt)
  #text(font: "Noto Sans", size: 13pt, weight: "bold", fill: forest)[CapiLoop]
  #v(3pt)
  #text(size: 10pt, fill: avocado)[Menos desperdício. Mais sabor. Mais comércio local.]
]
