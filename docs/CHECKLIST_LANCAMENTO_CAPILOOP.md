# CapiLoop — Checklist realista de lançamento

**Autor:** Manus AI  
**Projeto:** CapiLoop  
**Objetivo:** separar com clareza o que já está implementado, o que precisa ser homologado, o que depende de credenciais ou decisões externas e quais ações o fundador precisa executar para colocar a operação no ar.

> **Conclusão executiva:** a CapiLoop está em estágio avançado de produto e possui os principais fluxos de aplicativo, backend e portal de parceiros implementados. Porém, **ainda não deve ser considerada pronta para um lançamento público aberto**. O próximo passo correto é um piloto controlado com poucos restaurantes, depois de concluir pagamentos reais, aprovação de parceiros, publicação de lojas, contas das lojas de aplicativos, políticas e testes ponta a ponta.

## 1. Resumo de prontidão

| Área | Estado atual | Pode bloquear lançamento? | O que falta comprovar |
|---|---|---:|---|
| Aplicativo móvel | Interface e fluxos principais implementados | Não isoladamente | Testes em dispositivos físicos e homologação ponta a ponta |
| Cadastro e login de cliente | Fluxo integrado ao sistema de autenticação do projeto | Sim, se a configuração de produção não estiver validada | Login real, retorno por deep link, sessão e logout em iOS e Android |
| Cadastro de restaurante | Portal e validação de CNPJ implementados | Sim para o piloto comercial | Cadastro real, validação de dados e instruções operacionais |
| Aprovação de restaurante | Fluxo administrativo implementado | Sim para operação segura | Confirmar aprovação real antes da publicação |
| Cadastro de sacolas | Formulário e API implementados | Sim para catálogo real | Cadastrar e editar sacolas reais de parceiros aprovados |
| Catálogo no aplicativo | Consumo de catálogo publicado implementado | Sim se ainda houver dados de referência | Publicar ofertas reais e desativar fallback de demonstração no lançamento |
| Reserva e retirada | Retirada local, horário e código do comprovante implementados | Sim para operação | Testar uma reserva completa com dados reais |
| Mercado Pago | Integração preparada no backend e telas de pagamento existentes | **Sim — bloqueador atual** | Credenciais, webhook, homologação e transações aprovadas |
| Portal do parceiro | Gestão de sacolas, reservas do dia e confirmação de retirada implementadas | Não isoladamente | Treinamento e teste com restaurantes reais |
| Suporte | Central de Ajuda, chamados, mensagens, avaliação e painel administrativo implementados | Não para o piloto, mas importante | Definir quem responderá aos chamados e os prazos de atendimento |
| Publicação nas lojas | Configuração Expo e identidade visual preparadas | **Sim para distribuição pública** | Conta Apple Developer, Google Play Console, builds e revisão das lojas |
| Operação comercial | Ainda depende do fundador | **Sim** | Restaurantes, regras comerciais, taxas, atendimento e piloto |

## 2. O restaurante já consegue se cadastrar?

**Tecnicamente, sim, por meio do portal de parceiros**, e não pela experiência principal do cliente. O restaurante deve acessar o endereço do portal `/partners/`, criar uma conta de parceiro, informar os dados comerciais e passar pela validação de CNPJ. A API de parceiros já contém as rotas de cadastro, autenticação, catálogo e gestão de sacolas.[1]

A sequência operacional prevista é a seguinte:

1. O restaurante acessa o portal de parceiros.
2. Preenche razão social ou nome comercial, CNPJ, e-mail, senha, endereço e dados de contato.
3. O sistema valida o formato e a situação do CNPJ.
4. A equipe da CapiLoop revisa o cadastro e aprova ou rejeita o parceiro.
5. Somente o parceiro aprovado deve publicar sacolas para o catálogo público.
6. O parceiro aprovado cadastra a sacola do dia, com nome, categoria, quantidade, preço, valor de referência, fotos e janela de retirada.
7. A equipe pode revisar a publicação e o cliente passa a visualizar a oferta no aplicativo.

**Importante:** a existência das telas e rotas não substitui o teste real. Antes de convidar restaurantes, deve-se executar esse fluxo em ambiente controlado com pelo menos dois cadastros de teste: um aprovado e um rejeitado. Também é necessário confirmar que um parceiro pendente não consegue publicar por tentativa direta na API.

## 3. O restaurante já consegue publicar uma sacola?

**O fluxo está implementado, mas ainda precisa ser homologado com dados reais.** Um parceiro aprovado consegue usar o portal para criar sacolas diárias e administrar a disponibilidade. Também foram implementadas ações para editar ou cancelar sacolas, com proteção para não destruir reservas já existentes.

A resposta prática é:

> **Se o restaurante já estiver aprovado, autenticado no portal e as rotas estiverem apontando para o banco de produção, ele deverá conseguir cadastrar e publicar uma sacola. Contudo, o produto ainda não deve prometer essa operação publicamente antes de executar um teste completo com um restaurante real.**

Para considerar esse fluxo pronto, execute este teste:

| Teste | Resultado esperado |
|---|---|
| Cadastro de restaurante com CNPJ válido | Cadastro criado e aguardando revisão |
| Login de parceiro pendente | Acesso limitado, sem publicação pública |
| Aprovação administrativa | Parceiro passa a poder gerenciar sacolas |
| Criação de sacola | Sacola aparece no catálogo após publicação |
| Edição sem reservas | Alterações são salvas |
| Cancelamento sem reservas | Sacola deixa de aparecer como disponível |
| Edição ou cancelamento com reserva | Sistema bloqueia ou aplica a regra segura definida |
| Reserva no aplicativo | Quantidade e disponibilidade são respeitadas |
| Confirmação de retirada | Código é validado pelo parceiro e não pode ser reutilizado |

## 4. O que já está pronto no aplicativo do cliente

O aplicativo possui uma base funcional ampla. Foram implementados descoberta de ofertas, busca por estabelecimento, filtros por categoria, distância e horário, ordenação por distância, horário e preço, favoritos, alertas por loja, fotos do estabelecimento, reputação condicional, reserva com retirada no local, histórico de pedidos, comprovante, contagem regressiva de retirada e Central de Ajuda.

Também foram implementados refinamentos de experiência, como áreas seguras, telas compactas, skeleton de carregamento, transições suaves, microinterações, respostas táteis e elementos da identidade visual 3D da capivara CapiLoop.

| Fluxo do cliente | Estado |
|---|---|
| Descobrir sacolas próximas | Implementado |
| Pesquisar estabelecimento | Implementado |
| Filtrar e ordenar resultados | Implementado |
| Favoritar loja e gerenciar alertas | Implementado localmente; notificações remotas ainda precisam de homologação |
| Abrir detalhes e visualizar fotos | Implementado |
| Consultar reputação após volume mínimo | Implementado conforme regra definida |
| Escolher horário de retirada | Implementado |
| Escolher PIX, cartão ou opção exibida de carteira | Interface preparada; processamento real depende de homologação |
| Confirmar reserva | Implementado |
| Visualizar comprovante e histórico | Implementado |
| Apresentar código ao parceiro | Implementado |
| Receber confirmação de retirada | Implementado no portal do parceiro |
| Abrir chamado e anexar imagem | Implementado |
| Conversar e avaliar atendimento | Implementado |

## 5. Pagamentos: o principal bloqueador técnico atual

A integração com o Mercado Pago foi preparada para criar preferências e processar pagamentos. O backend possui serviço para criar preferência, criar pagamento e consultar status.[2] Entretanto, o projeto ainda depende das credenciais de produção e da configuração correta do webhook.

As variáveis pendentes são:

| Credencial | Finalidade | Estado |
|---|---|---|
| `MERCADO_PAGO_ACCESS_TOKEN` | Autorizar chamadas ao Mercado Pago | Ainda precisa ser preenchida pelo proprietário |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Validar notificações recebidas do Mercado Pago | Ainda precisa ser preenchida pelo proprietário |
| `CAPI_LOOP_ADMIN_TOKEN` | Proteger operações administrativas | Ainda precisa ser preenchida e validada |

Antes do lançamento público, é necessário:

- criar ou confirmar a conta comercial do Mercado Pago;
- obter credenciais separadas para teste e produção;
- configurar o endereço público do webhook;
- validar assinatura e idempotência dos webhooks;
- testar pagamento aprovado, pendente, recusado, cancelado e estornado;
- confirmar que uma reserva só fica confirmada após o estado de pagamento correto;
- testar a conciliação entre pagamento, quantidade disponível e cancelamento;
- confirmar a política de reembolso e atendimento ao cliente.

### PIX, cartão e Apple Pay

O aplicativo já apresenta opções de pagamento no fluxo de reserva e o backend está preparado para Mercado Pago. **PIX e cartão devem ser tratados como prontos para homologação, não como prontos para produção**, enquanto as credenciais e transações reais não forem validadas.

A opção de Apple Pay aparece na experiência projetada, mas **não deve ser anunciada como método de pagamento efetivamente disponível** antes de uma implementação e teste nativos no iOS. A presença de uma opção visual não comprova que a carteira esteja processando pagamentos reais.

## 6. Fluxo completo que ainda precisa ser testado

O teste mais importante antes do piloto é realizar uma transação completa, do início ao fim:

1. Criar um restaurante de teste no portal.
2. Validar o CNPJ.
3. Aprovar o restaurante no painel administrativo.
4. Cadastrar uma sacola real de teste.
5. Confirmar que ela aparece no catálogo do aplicativo.
6. Criar ou acessar uma conta de cliente.
7. Reservar a sacola escolhendo horário de retirada.
8. Completar o pagamento em ambiente de homologação.
9. Confirmar que o pedido aparece no histórico e no comprovante.
10. Ir ao portal do parceiro e consultar a reserva do dia.
11. Inserir o código do comprovante.
12. Confirmar a retirada.
13. Verificar o recibo digital e o status final.
14. Tentar reutilizar o mesmo código e confirmar que o sistema bloqueia a duplicidade.
15. Simular pagamento pendente ou recusado e garantir que a retirada não seja liberada.

Enquanto esse teste não passar com dados reais de homologação, a plataforma deve ser considerada **produto avançado em pré-lançamento**, e não operação comercial pronta.

## 7. O que falta fazer no aplicativo e backend

### Bloqueadores antes do piloto

- Preencher as credenciais de produção ou homologação do Mercado Pago.
- Testar o webhook de pagamento em endereço público.
- Confirmar que a reserva não é liberada com pagamento pendente ou recusado.
- Executar o fluxo de restaurante aprovado até a publicação de uma sacola real.
- Remover ou desativar ofertas de referência antes de abrir o catálogo ao público, para não misturar demonstração com inventário real.
- Testar login, cadastro, deep links e logout em aparelhos físicos.
- Configurar o token administrativo e testar o painel de aprovação e suporte.
- Definir como serão tratados cancelamentos, reembolsos e indisponibilidade de sacola.

### Importantes antes do lançamento público

- Implementar ou validar notificações remotas para novas sacolas e respostas de suporte.
- Criar mecanismos de logs, monitoramento e alertas de erro.
- Definir backups e procedimento de restauração do banco.
- Revisar limites de quantidade e concorrência quando duas pessoas reservarem a última sacola ao mesmo tempo.
- Validar armazenamento e acesso de imagens anexadas aos chamados.
- Revisar textos de consentimento, política de privacidade e termos de uso.
- Realizar testes de carga básicos no catálogo, checkout e confirmação de retirada.

### Melhorias que podem ficar para depois do piloto

- Programa de fidelidade.
- Notificações avançadas segmentadas.
- Relatórios financeiros completos para parceiros.
- Integração com sistemas de caixa dos restaurantes.
- Entrega a domicílio, que não faz parte do escopo atual.
- Expansão para múltiplas cidades e regras comerciais diferentes.

## 8. O que você precisa fazer fora do código

O lançamento não depende apenas de terminar telas. O fundador precisa organizar a operação comercial, financeira e legal.

### Empresa e operação

Você deve definir a entidade que será responsável pela operação, os dados fiscais, a conta bancária, o responsável pelo atendimento e as regras comerciais. Questões de constituição empresarial, tributação, contratos e proteção de dados devem ser confirmadas com contador e advogado especializados; este checklist não substitui orientação profissional.

### Restaurantes parceiros

Antes do lançamento, é necessário montar uma lista inicial de estabelecimentos, apresentar o material comercial da CapiLoop, explicar a proposta, definir a margem ou taxa da plataforma, coletar os dados necessários e treinar os responsáveis pelo portal.

Cada restaurante precisa receber instruções objetivas sobre:

- como acessar o portal;
- como publicar a sacola do dia;
- como atualizar quantidade e horário;
- o que acontece quando uma sacola é cancelada;
- como consultar as reservas do dia;
- como conferir o código do cliente;
- como confirmar a retirada;
- quem procurar em caso de problema.

Para o primeiro piloto, é melhor começar com poucos estabelecimentos que tenham uma pessoa responsável pela operação diária. A qualidade do atendimento e a regularidade das sacolas são mais importantes que tentar cadastrar muitos parceiros de uma vez.

### Publicação nas lojas

Para distribuir o aplicativo, você precisa das contas de desenvolvedor da Apple e do Google, informações legais e de suporte, ícones e telas, descrição do produto, política de privacidade, classificação etária, dados sobre coleta e uso de informações e builds assinados para revisão.

A configuração Expo e a identidade visual já foram preparadas, mas isso não significa que o aplicativo já esteja publicado. Ainda será necessário gerar os builds, instalar em aparelhos reais, corrigir eventuais problemas específicos de cada plataforma, enviar para revisão e acompanhar a aprovação das lojas.

### Marca e comunicação

O brand book, a logo, a capivara 3D, os textos de posicionamento e o material institucional já existem. Ainda é necessário garantir que o nome, o domínio, os perfis sociais, os dados de contato e as informações comerciais estejam consistentes antes da divulgação pública.[3]

## 9. Checklist em ordem de execução

### Fase 1 — Preparar a operação

- [ ] Definir cidade ou região inicial do piloto.
- [ ] Selecionar os primeiros restaurantes.
- [ ] Definir taxa, repasse, política de cancelamento e responsabilidade pela retirada.
- [ ] Confirmar dados da empresa, conta financeira e responsáveis.
- [ ] Finalizar termos, privacidade e textos de suporte.
- [ ] Confirmar canal de atendimento e horário de resposta.

### Fase 2 — Fechar a parte técnica

- [ ] Preencher `MERCADO_PAGO_ACCESS_TOKEN`.
- [ ] Preencher `MERCADO_PAGO_WEBHOOK_SECRET`.
- [ ] Preencher `CAPI_LOOP_ADMIN_TOKEN`.
- [ ] Configurar webhook público e validar assinatura.
- [ ] Testar PIX e cartão em homologação.
- [ ] Validar o comportamento de Apple Pay; se não estiver pronto, remover a opção da interface.
- [ ] Testar autenticação, deep links e sessões em iOS e Android.
- [ ] Confirmar banco, migrações, backup e logs.

### Fase 3 — Ativar restaurantes

- [ ] Cadastrar restaurante de teste.
- [ ] Aprovar manualmente.
- [ ] Criar uma sacola de teste.
- [ ] Confirmar que a sacola aparece no aplicativo.
- [ ] Editar e cancelar uma sacola sem reservas.
- [ ] Confirmar que uma sacola com reserva não pode ser alterada de modo inseguro.
- [ ] Treinar o parceiro com um pedido simulado.

### Fase 4 — Executar piloto fechado

- [ ] Convidar poucos clientes reais ou usuários de teste.
- [ ] Processar reservas reais com valor controlado.
- [ ] Confirmar pagamentos e retiradas no estabelecimento.
- [ ] Registrar dúvidas e falhas.
- [ ] Medir sacolas publicadas, reservadas, retiradas, canceladas e problemas de pagamento.
- [ ] Corrigir os bloqueadores encontrados antes de abrir a operação.

### Fase 5 — Publicar

- [ ] Criar e validar builds iOS e Android.
- [ ] Enviar o aplicativo para as lojas.
- [ ] Configurar domínio e site institucional.
- [ ] Publicar termos, privacidade e contato.
- [ ] Confirmar que os restaurantes iniciais já possuem sacolas disponíveis.
- [ ] Abrir a comunicação pública somente quando houver oferta real no catálogo.
- [ ] Monitorar pagamentos, reservas, suporte e retiradas diariamente no início.

## 10. Critério de decisão: lançar ou não lançar

### Não lançar publicamente ainda se:

- o Mercado Pago não estiver validado com transações reais ou de homologação;
- não houver pelo menos alguns restaurantes treinados e aprovados;
- o catálogo ainda depender principalmente de ofertas de referência;
- o fluxo de retirada não tiver sido testado do começo ao fim;
- não houver política de cancelamento e reembolso definida;
- o aplicativo não tiver sido instalado e testado em aparelhos reais;
- não houver responsável pelo suporte durante o piloto.

### Pode iniciar um piloto controlado quando:

- o pagamento estiver funcionando em ambiente de teste;
- ao menos um restaurante aprovado publicar uma sacola real;
- um cliente conseguir reservar, pagar e receber comprovante;
- o parceiro conseguir consultar a reserva e confirmar a retirada;
- o suporte estiver acessível;
- os riscos e limites do piloto estiverem claros.

### Pode abrir o lançamento público quando:

- o piloto completar alguns ciclos sem falhas críticas;
- pagamentos, webhooks, cancelamentos e reembolsos estiverem validados;
- as lojas aprovarem os builds;
- houver oferta real suficiente para a região escolhida;
- a operação diária de parceiros, suporte e conciliação financeira estiver definida.

## 11. Resposta direta às suas perguntas

**“Se o restaurante quiser colocar uma sacola, já vai funcionar?”** O código do portal, as rotas de parceiros, a criação de sacolas e o catálogo dinâmico estão implementados. Para funcionar de verdade, ainda é necessário configurar o ambiente correto, aprovar o parceiro, cadastrar dados reais, confirmar que a sacola aparece no catálogo e testar a operação com pagamento e retirada.

**“O cadastro do restaurante está pronto?”** O fluxo técnico de cadastro, login, validação de CNPJ e gestão no portal está implementado. O processo comercial, a revisão manual, o treinamento e a validação em ambiente de produção ainda precisam ser executados.

**“O cliente já consegue comprar?”** A jornada de descoberta, reserva, pagamento e comprovante foi construída. A compra real só deve ser anunciada depois de preencher as credenciais do Mercado Pago, configurar o webhook e concluir o teste ponta a ponta.

**“O que falta para lançar?”** Os bloqueadores principais são: pagamentos em produção, teste completo com restaurantes reais, contas e builds das lojas, documentos e políticas, oferta real no catálogo, operação de suporte e definição comercial do piloto.

## 12. Prioridade absoluta para os próximos dias

1. Escolher a cidade e os primeiros restaurantes do piloto.
2. Obter e configurar as credenciais do Mercado Pago e do administrador.
3. Executar um cadastro real de parceiro e publicar uma sacola de teste.
4. Realizar uma reserva completa com pagamento e retirada.
5. Corrigir qualquer falha encontrada nesse ciclo.
6. Preparar termos, privacidade, suporte e contas das lojas.
7. Somente depois enviar os builds para publicação e anunciar a abertura.

**Estado final recomendado:** a CapiLoop deve ser apresentada agora como uma plataforma em **pré-lançamento avançado**, pronta para uma etapa de homologação e piloto controlado, mas ainda não como uma operação pública completamente validada.

## Referências internas

[1]: ../server/partner-rest.ts "API REST de parceiros, cadastro, aprovação e gestão de sacolas"
[2]: ../server/_core/mercadopago.ts "Serviço de integração com Mercado Pago"
[3]: ./BRAND_BOOK_CAPILOOP.md "Brand book e diretrizes de identidade da CapiLoop"
[4]: ../server/routers/checkout.ts "Rotas de reserva e validação de retirada"
[5]: ../app/support-tickets.tsx "Acompanhamento de chamados no aplicativo"
[6]: ../partner-dashboard/src/pages/ReservationsPage.tsx "Agenda de reservas do parceiro"

---

*Este documento é um diagnóstico de prontidão baseado no estado atual do projeto e deve ser atualizado após cada rodada de homologação.*


## 13. Atualização técnica — pilares de negócio implementados

A rodada atual adicionou os seguintes controles de backend e aplicativo:

- [x] Aprovação manual de parceiros com estados `pending`, `approved`, `rejected` e `suspended`; parceiros pendentes não podem publicar sacolas.
- [x] Separação persistida entre `total_bag_value`, `platform_commission_fee` e `restaurant_net_value`.
- [x] Payload de split preparado para PIX, cartão e Checkout Pro, com `collector_id` e metadados de reconciliação quando configurados.
- [x] Expiração de sacolas pela janela de retirada, com sweep periódico e filtro de catálogo.
- [x] Lock condicional de estoque durante o checkout e liberação de locks pendentes expirados.
- [x] Disputa protegida no comprovante com motivo, histórico, reembolso idempotente e penalização interna do parceiro.
- [x] Fila administrativa de aprovação disponível no perfil de usuários autorizados.
- [x] Testes unitários para expiração, split, lock e pesos de penalização.

Esses itens estão **prontos no código**, mas não transformam pagamentos, reembolsos ou split em homologados. Ainda é necessário testar com credenciais válidas, pagamentos reais de teste, webhook público, recebedores Mercado Pago configurados e uma operação-piloto com restaurantes.

A proposta detalhada de modelos, estados e fluxos está em [`ARQUITETURA_REGRAS_NEGOCIO.md`](./ARQUITETURA_REGRAS_NEGOCIO.md).
