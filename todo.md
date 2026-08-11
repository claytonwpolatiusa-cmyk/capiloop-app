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

 - [x] Criar rotas de autenticação OAuth no backend (login/logout/refresh).
 - [x] Implementar telas de login e cadastro no app móvel.
- [ ] Implementar tela de gerenciamento de endereços no app.
- [x] Integrar MercadoPago ou Stripe para pagamentos com cartão e PIX.
- [x] Criar telas de checkout e confirmação de pagamento.
- [x] Implementar tela de histórico de pedidos no app.

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

## Aprovação manual de parceiros

- [ ] Registrar novos parceiros como pendentes após a validação de CNPJ.
- [ ] Criar API administrativa protegida para listar, aprovar e recusar parceiros.
- [ ] Criar painel administrativo para revisar os dados empresariais e tomar decisões.
- [ ] Exibir o status pendente, aprovado ou recusado no portal do parceiro e bloquear publicações não aprovadas.
- [ ] Validar e documentar o fluxo de aprovação manual.

## Experiência de navegação móvel

- [x] Mapear os fluxos de descoberta, reserva, checkout e retirada com pontos de decisão claros.
- [x] Priorizar atalhos, CTAs e informações de retirada para uso com uma mão.
- [x] Adicionar estados vazios, carregamento e mensagens de orientação contextual.
- [x] Adicionar transições sutis entre descoberta, detalhe, checkout e reserva.
- [x] Validar a jornada de navegação e corrigir pontos de fricção observados.

## Conta do cliente

 - [x] Definir a jornada nativa de entrada, cadastro, recuperação e retorno à reserva.
 - [x] Criar telas de login, cadastro e recuperação com validação acessível de campos.
 - [x] Persistir a sessão de cliente no dispositivo e proteger o fluxo de checkout.
 - [x] Retomar automaticamente a oferta ou reserva após autenticação.
 - [x] Validar a jornada de conta e os estados de erro, carregamento e sucesso.

## Descoberta e pedidos

- [x] Implementar filtros funcionais de distância, categoria e horário no catálogo de ofertas.
- [x] Criar histórico de pedidos do cliente no perfil, com estados de reserva e pagamento.
- [x] Exibir comprovante detalhado de retirada para pedidos confirmados.
- [x] Validar os novos fluxos de filtros, histórico e comprovantes com testes determinísticos.
