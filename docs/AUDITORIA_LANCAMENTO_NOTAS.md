# Notas da auditoria de lançamento — CapiLoop

## Estado observado no backend de parceiros

- O cadastro `POST /partners/signup` valida formato e consulta o CNPJ em registro externo configurado pelo projeto.
- O cadastro cria conta de usuário parceira, aplica hash de senha e, no estado atual do código, grava o parceiro com `status: "approved"` imediatamente. Isso significa que o cadastro automático está funcional, mas o requisito de aprovação manual precisa ser revisado antes de um lançamento comercial caso a política desejada seja aprovar cada parceiro antes da publicação.
- O login de parceiro existe e cria sessão bearer própria.
- As rotas operacionais exigem sessão de parceiro aprovado.
- A criação de sacola `POST /partners/bags` valida categoria, preços, itens esperados, horários, quantidade, impacto e imagem opcional; a sacola é inserida no catálogo com status ativo.
- A edição impede alterar sacolas que já tenham reservas.
- O cancelamento impede cancelar sacolas com reservas pendentes, confirmadas ou retiradas.
- Existe confirmação de retirada por código, com vínculo ao parceiro, pagamento concluído, prevenção de retirada duplicada e confirmação atômica.
- Existe agenda de reservas do dia em `GET /partners/reservations/today`.

## Pontos que não devem ser declarados como produção sem homologação

- O pagamento Mercado Pago tem integração preparada, mas as credenciais de produção e webhook precisam ser preenchidas e testadas com uma transação real de homologação.
- A publicação nas lojas Apple/Google ainda depende de contas de desenvolvedor, certificados, builds e revisão das lojas.
- O cadastro e publicação de sacolas precisam ser testados com um restaurante real em banco e ambiente controlados.
- O estado `approved` automático no cadastro de parceiro deve ser decidido: manter para piloto fechado ou alterar para aprovação manual real antes do lançamento aberto.
- O fluxo de notificações e operação contínua precisa de validação com responsáveis humanos.

## Funcionalidades implementadas conforme histórico do projeto

- App Expo/React Native com descoberta, busca, filtros, ordenação, distância, favoritos e alertas locais.
- Detalhe de estabelecimento com fotos, reputação condicional e disponibilidade.
- Reserva exclusivamente para retirada no local, com seleção de horário.
- Fluxos preparados para PIX, cartão e Apple Pay; produção depende de credenciais e homologação.
- Confirmação pós-reserva, histórico, comprovantes e contagem de urgência de retirada.
- Central de Ajuda com assistente simples, criação de chamados, anexos de imagens, comentários, avaliação, filtros e histórico.
- Painel administrativo de suporte protegido por função no servidor e badges de respostas novas.
- Portal web de parceiros com login, cadastro, gestão de sacolas, agenda diária e confirmação de retirada.
- TypeScript validado e suíte de testes existente aprovada conforme os checkpoints mais recentes.

## Ações externas do fundador

- Constituir/validar empresa e responsabilidades fiscais com assessoria própria.
- Definir termos de uso, política de privacidade, tratamento de dados, cancelamento e responsabilidade por alimentos.
- Abrir contas de desenvolvedor Apple e Google e preparar publicação.
- Obter e inserir credenciais de produção do Mercado Pago, webhook secret e token administrativo.
- Selecionar restaurantes-piloto, coletar dados, fotos, horários e regras de retirada.
- Treinar parceiros para login, cadastro de sacolas, atendimento e confirmação por código.
- Definir suporte humano, e-mail operacional, SLA e processo de incidentes.

## Critério de go/no-go

O lançamento público só deve ocorrer depois de: parceiro-piloto aprovado; sacola real publicada; reserva teste paga; confirmação de retirada concluída; webhook verificado; política e suporte publicados; builds submetidos; e plano de contingência testado.
