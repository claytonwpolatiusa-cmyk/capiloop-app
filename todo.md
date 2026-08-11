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
