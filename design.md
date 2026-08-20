# Direção de design — CapiLoop

## Premissa

O CapiLoop é um marketplace móvel de sacolas surpresa que transforma excedentes alimentares em ofertas locais de alto valor. A experiência deve tornar a escolha rápida, segura e desejável: o usuário vê a economia, entende o horário de retirada e percebe o impacto ambiental antes de reservar.

O desenho considera a orientação **vertical 9:16**, uso com uma mão e padrões de navegação nativos do iOS. As áreas de toque prioritárias ficam na metade inferior da tela, os controles têm contraste alto e o conteúdo essencial aparece antes da dobra.

## Sistema visual

| Elemento | Direção |
|---|---|
| Fundo | Off-white `#F8FAF6`, arejado e silencioso para valorizar as ofertas. |
| Cor de assinatura | Verde-abacate elétrico `#A5DF00`, reservado para ações, economia e indicadores de impacto. |
| Texto | Grafite profundo `#151B14` para títulos e `#697065` para metadados. |
| Superfícies | Branco `#FFFFFF`, cartões arredondados de 24 px e sombras extremamente suaves. |
| Contraste de ação | Preto `#151B14` para CTAs de reserva; verde para benefícios e estados positivos. |
| Tipografia | Sans-serif nativa em pesos semibold e bold, com títulos compactos e preços grandes. |
| Ilustração | Capivara 3D tátil, de pelo marrom-cacau e olhos pretos brilhantes, surgindo de uma sacola reutilizável grafite com alças creme. É acolhedora, contemporânea e reconhecível; nunca infantilizada, genérica ou excessivamente decorativa. |

## Direção revisada da descoberta

A tela **Descobrir** passa a usar uma composição ainda mais limpa e centralizada. O topo traz a localização em um chip discreto, um cartão editorial com fundo verde-claro e a capivara CapiLoop em 3D como elemento de reconhecimento. A ilustração permanece funcional: ela sustenta a mensagem de resgate de alimentos sem competir com a busca ou com a ação de reserva.

Ao abrir o aplicativo, uma camada arredondada de **“Mais perto de você”** aparece sobre o catálogo, priorizando até três sacolas com menor distância informada. A pessoa pode tocar em uma sacola para abrir o detalhe ou arrastar a camada para baixo — também há o botão “Continuar” — para seguir pela lista completa de lojas. Depois de fechada, a camada permanece acessível por um atalho compacto. Esta decisão favorece a primeira reserva, mas preserva uma rota direta de exploração e o uso com uma mão.

## Sistema de mascote 3D

A capivara com sacola torna-se o principal ativo de reconhecimento da CapiLoop. O ícone de aplicativo e a marca compacta utilizam a versão frontal do mascote em fundo verde-lima. Dentro do produto, ela aparece apenas em quatro pontos de alto significado: na abertura da descoberta, para convidar à primeira reserva; no estado de sacola vazia, para orientar o retorno ao catálogo; no cartão de impacto, como reforço de recompensa; e na marca compacta das telas. Variações futuras precisam manter os mesmos âncoras de identidade — pelo marrom-cacau, olhos pretos brilhantes, sacola grafite e alças creme — e uma composição limpa com área de respiro.

## Lista de telas

| Tela | Conteúdo principal | Função central |
|---|---|---|
| Descobrir | Saudação, localização, impacto acumulado, carrossel de categorias e ofertas próximas. | Encontrar uma sacola atraente e iniciar a reserva. |
| Explorar | Mapa estilizado, marcadores de estabelecimentos e lista resumida de opções próximas. | Compreender o que está disponível por proximidade. |
| Sacola | Sacolas reservadas, contagem regressiva e instruções de retirada. | Acompanhar a reserva ativa até a coleta. |
| Impacto | Quilos de CO₂ evitados, sacolas salvas e nível do Passaporte Verde. | Reforçar recorrência por meio de progresso mensurável. |
| Perfil | Dados locais, preferências e atalho para ajuda. | Ajustar a experiência sem criar dependência de login nesta versão. |
| Detalhe da oferta | Foto, loja, horário, preço original, preço CapiLoop, itens esperados e CTA. | Confirmar a escolha e reservar a sacola. |
| Confirmação de reserva | Estado de sucesso, código de coleta e lembrete de horário. | Fechar o fluxo com clareza e permitir ver a reserva. |

## Fluxos prioritários

| Fluxo | Etapas |
|---|---|
| Descobrir e reservar | Descobrir → tocar em uma oferta → revisar detalhes → tocar em “Reservar sacola” → confirmar → abrir Sacola. |
| Explorar por proximidade | Explorar → tocar em um marcador ou card → abrir detalhe → reservar. |
| Consultar retirada | Sacola → abrir reserva ativa → conferir horário, endereço e código de retirada. |
| Acompanhar impacto | Impacto → ver progresso no Passaporte Verde → entender a próxima meta. |

## Modelos de domínio locais

| Entidade | Campos principais | Uso |
|---|---|---|
| Oferta | `id`, `loja`, `categoria`, `precoOriginal`, `preco`, `distancia`, `retirada`, `estoque`, `imagem` | Alimenta cards, detalhe e mapa. |
| Reserva | `ofertaId`, `codigo`, `status`, `horario`, `data` | Representa uma sacola garantida no dispositivo. |
| Impacto | `sacolasSalvas`, `co2Kg`, `economia`, `nivel` | Mantém os indicadores de sustentabilidade e gamificação. |

## Decisões de interface

Os cards exibem preço com ancoragem, distância, janela de retirada e sinal de escassez para diminuir o esforço decisório sem mascarar condições. O botão de reserva permanece visualmente inequívoco e gera uma confirmação clara. O protótipo usará dados de demonstração locais e armazenamento local para simular a reserva sem exigir conta, servidor ou pagamento nesta primeira versão.
