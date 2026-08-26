# Project TODO

- [x] Definir a arquitetura de telas, domínio local e identidade visual do CapiLoop.
- [x] Configurar tokens de tema, barra de abas e iconografia para a marca CapiLoop.
- [x] Implementar a tela Descobrir com categorias, impacto e ofertas locais.
- [x] Implementar a tela Explorar com mapa ilustrativo e estabelecimentos próximos.
- [x] Implementar as telas Sacola, Impacto e Perfil com dados locais relevantes.
- [x] Implementar detalhes de oferta, reserva e confirmação persistidos localmente.
- [x] Criar ícone original da marca e aplicá-lo à configuração do aplicativo.
- [x] Validar tipos, testes, navegação e apresentação do aplicativo.

## Fase 2: Autenticação e Pagamentos

- [ ] Criar rotas de autenticação OAuth no backend (login/logout/refresh).
- [ ] Implementar telas de login e cadastro no app móvel.
- [ ] Implementar tela de gerenciamento de endereços no app.
- [x] Integrar MercadoPago ou Stripe para pagamentos com cartão e PIX.
- [x] Criar telas de checkout e confirmação de pagamento.
- [x] Implementar tela de histórico de pedidos no app.

## Fase 3: Dashboard de Parceiros

- [x] Criar projeto web separado para dashboard de restaurantes.
- [x] Implementar login de parceiros com verificação de CNPJ.
- [x] Criar tela de cadastro de sacolas diárias.
- [x] Implementar tela de gerenciamento de sacolas (editar, cancelar, visualizar reservas).
- [x] Criar relatórios de vendas e impacto ambiental.
- [ ] Implementar notificações de novas reservas.

## Fase 4: Integração e Testes

- [x] Conectar app móvel com dados reais do backend.
- [ ] Testar fluxo completo: login → descobrir → reservar → pagar → retirar.
- [ ] Testar fluxo de parceiro: login → criar sacola → receber reserva → marcar como retirada.
- [x] Implementar tratamento de erros e validações.
- [x] Documentar APIs e fluxos.

## Integração em andamento

- [x] Validar CNPJ do parceiro por algoritmo e consulta cadastral no servidor.
- [x] Processar PIX e cartão via Mercado Pago com idempotência, tokenização e webhook assinado.
- [x] Consumir o catálogo público e as reservas reais no aplicativo móvel.
- [ ] Inserir credenciais de produção do Mercado Pago e executar pagamentos reais de homologação.

## Retirada no portal do parceiro

- [x] Criar endpoint seguro para confirmar a retirada pelo código do comprovante.
- [x] Criar tela de confirmação de retirada no portal do parceiro.
- [x] Validar códigos inválidos, pedidos de outros parceiros, pagamentos pendentes e retiradas já confirmadas.
- [x] Exibir uma lista das reservas do dia, com horário, sacola, status e código do comprovante.
- [x] Permitir editar os detalhes de sacolas publicadas antes de sua retirada.
- [x] Permitir cancelar sacolas publicadas sem afetar reservas já confirmadas.
- [x] Exibir animação de sucesso e recibo digital após confirmar uma retirada.

## Correção da descoberta de ofertas

- [x] Diagnosticar e restaurar a exibição das sacolas disponíveis na tela principal.
- [x] Reorganizar a tela de descoberta para priorizar busca, filtros e ofertas reserváveis.
- [x] Validar os estados de catálogo carregando, com ofertas, sem ofertas e em erro.

## Correção de carregamento

- [x] Restaurar a rota de pedido ausente que impede o carregamento da tela principal na web.
- [x] Validar novamente a renderização da descoberta após corrigir a rota.

## Publicação de sacolas reais

- [ ] Verificar parceiro aprovado e acesso ao portal de publicação.
- [ ] Coletar dados confirmados das sacolas, preços, quantidades e janelas de retirada.
- [ ] Cadastrar sacolas reais após a confirmação de publicação.
- [ ] Confirmar a exibição das novas sacolas no catálogo público.

## Acesso ao portal do parceiro

- [x] Corrigir o roteamento base do portal em `/partners/` para carregar as páginas do parceiro.

## Confirmação de reserva e pagamento

- [x] Criar uma etapa de confirmação antes de reservar uma sacola.
- [x] Exibir claramente a janela de retirada, o valor e as condições da reserva.
- [x] Permitir a escolha entre PIX, Apple Pay e cartão cadastrado antes do checkout.
- [x] Conectar a escolha ao checkout e validar os estados de confirmação, cancelamento e erro.

## Evolução da reserva, disponibilidade e favoritos

- [x] Fixar o fluxo de reserva em retirada no local, sem opção de delivery nesta fase.
- [x] Permitir selecionar um horário de retirada dentro da janela disponível antes do pagamento.
- [x] Apresentar PIX, Apple Pay e cartão cadastrado ou novo cartão como opções de pagamento.
- [x] Exibir estabelecimentos sem sacolas disponíveis em estado cinza e impedir sua abertura para reserva.
- [x] Implementar favoritos persistentes para estabelecimentos e acesso rápido aos salvos.
- [x] Validar os fluxos de retirada, indisponibilidade e favoritos.
- [x] Exibir um alerta visual na descoberta quando uma loja favoritada tiver novas sacolas disponíveis.
- [x] Criar animação de sucesso e confirmação de pedido com informações completas após o pagamento.
- [x] Permitir ativar ou silenciar alertas individualmente para cada loja favoritada.
- [x] Mostrar aviso visual e contagem regressiva quando a janela de retirada estiver perto de expirar.
- [x] Adicionar no perfil o histórico de pedidos anteriores com acesso aos comprovantes.
- [x] Validar a gestão de alertas, a urgência de retirada e o histórico de pedidos.

## Redesenho da descoberta

- [x] Simplificar a hierarquia visual da aba inicial e priorizar as sacolas disponíveis.
- [x] Refinar a busca, os filtros e os atalhos para uso confortável com uma mão.
- [x] Melhorar a apresentação de cards, estados e feedbacks da descoberta.
- [x] Validar a navegação e a consistência visual do novo fluxo inicial.

## Redesenho minimalista da descoberta

- [x] Definir a direção visual clean, centralizada e colorida a partir da referência aprovada.
- [x] Criar elementos 3D exclusivos da capivara CapiLoop para a nova experiência inicial.
- [x] Redesenhar o topo da descoberta com composição minimalista, localização e busca.
- [x] Implementar uma camada de sacolas próximas que incentive a primeira reserva e possa ser deslizada para revelar o catálogo.
- [x] Validar a nova hierarquia, os gestos e a responsividade em orientação retrato.

## Evolução da marca 3D

- [x] Definir a capivara com sacola 3D como elemento central da identidade visual atualizada.
- [x] Criar uma nova marca de aplicativo compatível com ícones de iOS e Android.
- [x] Gerar variações minimalistas da capivara 3D para contextos de descoberta, sacola e impacto.
- [x] Aplicar o novo sistema de mascote em posições estratégicas sem sobrecarregar as telas.
- [x] Validar contraste, consistência e legibilidade da marca em todo o aplicativo.

## Ajustes de responsividade e descoberta

- [x] Corrigir margens, largura máxima e áreas seguras para a interface permanecer bem posicionada em telas móveis.
- [x] Tornar a tela Descobrir integralmente rolável, com continuidade visual do catálogo abaixo da seleção inicial.
- [x] Fazer a barra de “Mais perto de você” responder ao arraste e revelar o catálogo ao ser recolhida.
- [x] Adicionar uma galeria de três fotos do estabelecimento na experiência de oferta.
- [x] Validar o layout, a rolagem e a interação de arraste em orientação retrato.
- [x] Corrigir o enquadramento superior para respeitar a área segura sem deslocar o cabeçalho e a localização.
- [x] Aplicar o mesmo padrão de áreas seguras e enquadramento às telas de perfil e pedidos.
- [x] Adaptar espaçamentos e controles para telas móveis menores e compactas.
- [x] Adicionar uma transição suave da descoberta ao detalhe da oferta.
- [x] Validar a responsividade e a navegação atualizadas em orientação retrato.
- [x] Aplicar transições suaves e consistentes às telas de checkout e histórico de pedidos.
- [x] Exibir skeleton animado enquanto os detalhes de estabelecimentos são carregados.
- [x] Adaptar automaticamente os tamanhos de fonte para leitura em telas menores.
- [x] Validar fluidez, carregamento e legibilidade em orientação retrato.

## Refinamento geral de UI e UX

- [x] Aprimorar a hierarquia visual e o acabamento das telas principais do aplicativo.
- [x] Adicionar microinterações sutis aos controles e ações de alta prioridade.
- [x] Padronizar transições e feedbacks de carregamento entre os fluxos principais.
- [x] Validar fluidez, leitura e toque em telas compactas.

## Ordenação de ofertas

- [x] Implementar ordenação das sacolas por menor distância.
- [x] Implementar ordenação das sacolas pelo próximo horário de retirada.
- [x] Adicionar controles acessíveis de ordenação à aba inicial.
- [x] Validar a combinação entre categorias e critérios de ordenação.
- [x] Implementar ordenação das sacolas por menor preço.
- [x] Expor a opção de preço nos controles e validar a ordenação combinada com categorias.

## Busca de estabelecimentos

- [x] Implementar busca de sacolas pelo nome do estabelecimento.
- [x] Adicionar campo de busca acessível na descoberta.
- [x] Validar a combinação entre busca, categorias e ordenação.

## Reputação de estabelecimentos

- [x] Definir limiar mínimo de vendas e dados necessários para mostrar estrelas e nota.
- [x] Implementar avaliação de 0 a 5, quantidade de sacolas vendidas e classificação padronizada.
- [x] Criar dez tipos de destaques padronizados de experiência sem atribuí-los a pessoas específicas.
- [x] Exibir reputação de forma transparente nos cards de oferta e validar estados sem dados suficientes.
- [x] Exibir nota de 0 a 5 estrelas no detalhe de cada estabelecimento.
- [x] Mostrar a quantidade de sacolas vendidas no detalhe somente após 40 vendas.

## Brand book e conteúdo de lançamento

- [x] Inventariar logo, paleta, tipografia, componentes e estado do projeto.
- [x] Criar brand book completo com posicionamento, arquétipos, voz, mensagens e diretrizes visuais.
- [x] Consolidar objetivos, entregas realizadas e pendências do CapiLoop.
- [x] Criar três posts iniciais minimalistas para Instagram com legendas e instruções de publicação.

## Migração do Instagram

- [x] Verificar a conexão e o estado atual do perfil do Instagram.
- [x] Preparar nome, @, bio, logo e conteúdo inaugural da CapiLoop.
- [x] Confirmar alterações de perfil, arquivamento dos posts existentes e publicação inicial.
- [x] Aplicar a nova identidade e publicar o primeiro post da CapiLoop.

## Revisão da publicação inaugural

- [x] Criar nova arte de lançamento com maior nitidez, contraste e tipografia marcante.
- [x] Preparar nova legenda de alto impacto para a primeira publicação.
- [x] Submeter a nova publicação à confirmação antes do envio ao Instagram.

## Sequência editorial para Instagram

- [x] Definir o calendário de cinco posts diários, com horários e objetivos de engajamento.
- [x] Criar cinco artes de feed com linguagem visual consistente e conteúdos complementares.
- [x] Criar legendas, CTAs e instruções de publicação para a sequência.
- [x] Criar um story vertical para publicação imediata.
- [x] Submeter o story à confirmação antes de publicá-lo no Instagram.
- [ ] Configurar o agendamento programado dos cinco posts no calendário editorial.
- [x] Publicar imediatamente os cinco posts aprovados, com confirmação individual no Instagram.

## Conteúdo variado para Instagram

- [x] Definir uma matriz de formatos que mantenha o branding CapiLoop sem repetir a estética.
- [x] Criar roteiros de reels realistas com comida, pessoas e contexto local.
- [x] Criar carrosséis narrativos e educativos com imagens predominantes.
- [ ] Criar posts fotográficos e de bastidores que não dependam de texto como elemento central.
- [ ] Gerar e organizar o primeiro lote de ativos variados para aprovação.
- [x] Publicar o reel realista disponível enquanto o restante do lote aguarda nova cota de geração.
- [ ] Gerar e publicar uma nova rodada imediata de reels, carrosséis e bastidores variados.
- [x] Criar kit de prompts e roteiros detalhados para vídeos fotorrealistas da CapiLoop em outras IAs.
- [ ] Gerar e publicar o vídeo fotorrealista “Isso não é resto”.
- [x] Criar série de posts tipográficos afetivos com humor familiar e comida boa em destaque.
- [x] Criar posts da estética sacola verde-lima, capivara e tipografia monumental inspirada na referência aprovada.
- [x] Montar calendário semanal que alterne as duas estéticas em uma publicação por dia.
- [x] Criar stories complementares para cada publicação semanal.
- [x] Submeter todo o calendário em rascunho à aprovação antes de agendar ou publicar.
- [ ] Configurar as publicações diárias e os stories da semana no Instagram.
- [x] Publicar uma peça pronta no Instagram hoje.
- [x] Gerar e publicar um Reel animado jovem com a capivara CapiLoop.
- [x] Organizar e enviar por e-mail o kit de publicação manual com os ativos ainda não publicados e suas legendas.

## Material comercial para parceiros

- [x] Criar book institucional em PDF para convite de restaurantes, cafés, padarias e mercados.
- [x] Incluir roteiro prático de captação e início de relacionamento com estabelecimentos.
- [x] Preparar a entrega do material ao e-mail indicado pelo usuário, se houver canal de envio disponível.

## Central de Ajuda

- [x] Criar tela de Central de Ajuda com categorias de problema e orientações rápidas.
- [x] Implementar a seleção guiada do assunto e o encaminhamento por e-mail ao suporte.
- [x] Adicionar acesso à Central de Ajuda no perfil do cliente.
- [x] Validar o fluxo no aplicativo e os cenários sem cliente de e-mail disponível.
- [x] Garantir que cada problema da Central de Ajuda ofereça uma próxima ação funcional e sem bloqueios.
- [x] Criar alternativas de progresso quando o cliente de e-mail não estiver disponível.
- [x] Validar as rotas de ajuda, retorno e contato em ambiente web e móvel.
- [x] Adicionar assistente virtual simples com respostas para dúvidas frequentes.
- [x] Permitir anexar imagens e capturas de tela a uma solicitação de suporte.
- [x] Criar chamados persistentes com protocolo e status de acompanhamento.
- [x] Exibir histórico de chamados e atualizações de status no perfil do usuário.
- [x] Permitir enviar e visualizar comentários dentro de cada chamado aberto.
- [x] Adicionar filtros por status e ordenação na tela Meus chamados.
- [x] Permitir avaliar com estrelas os chamados resolvidos.
- [x] Validar segurança de acesso, filtros, conversa e avaliação de chamados.
- [x] Criar painel administrativo simples para listar chamados e responder como equipe de suporte.
- [x] Proteger o painel e as ações da equipe com autorização administrativa.
- [x] Registrar a leitura das mensagens da equipe pelo usuário.
- [x] Exibir badges de novas respostas da equipe na lista e no detalhe dos chamados.
- [x] Validar permissão administrativa, envio de resposta e reconhecimento das notificações.

## Documento institucional da CapiLoop

- [x] Consolidar uma explicação completa da CapiLoop, do produto, da marca e da operação.
- [x] Documentar o fluxo de clientes, parceiros, pagamentos, retirada e segurança.
- [x] Registrar as entregas implementadas, limitações atuais e próximos passos do projeto.
