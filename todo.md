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
- [ ] Implementar tela de histórico de pedidos no app.

## Fase 3: Dashboard de Parceiros

- [x] Criar projeto web separado para dashboard de restaurantes.
- [x] Implementar login de parceiros com verificação de CNPJ.
- [x] Criar tela de cadastro de sacolas diárias.
- [ ] Implementar tela de gerenciamento de sacolas (editar, cancelar, visualizar reservas).
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

- [ ] Criar endpoint seguro para confirmar a retirada pelo código do comprovante.
- [ ] Criar tela de confirmação de retirada no portal do parceiro.
- [ ] Validar códigos inválidos, pedidos de outros parceiros, pagamentos pendentes e retiradas já confirmadas.

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

## Redesenho da descoberta

- [x] Simplificar a hierarquia visual da aba inicial e priorizar as sacolas disponíveis.
- [x] Refinar a busca, os filtros e os atalhos para uso confortável com uma mão.
- [x] Melhorar a apresentação de cards, estados e feedbacks da descoberta.
- [x] Validar a navegação e a consistência visual do novo fluxo inicial.

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

## Brand book e conteúdo de lançamento

- [x] Inventariar logo, paleta, tipografia, componentes e estado do projeto.
- [x] Criar brand book completo com posicionamento, arquétipos, voz, mensagens e diretrizes visuais.
- [x] Consolidar objetivos, entregas realizadas e pendências do CapiLoop.
- [x] Criar três posts iniciais minimalistas para Instagram com legendas e instruções de publicação.

## Migração do Instagram

- [x] Verificar a conexão e o estado atual do perfil do Instagram.
- [x] Preparar nome, @, bio, logo e conteúdo inaugural da CapiLoop.
- [x] Confirmar alterações de perfil, arquivamento dos posts existentes e publicação inicial.
- [ ] Aplicar a nova identidade e publicar o primeiro post da CapiLoop.

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
