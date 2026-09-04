# CapiLoop — Arquitetura das regras centrais de negócio

## Escopo

Este documento descreve a preparação técnica para três pilares do marketplace: **divisão financeira**, **expiração por janela de retirada** e **proteção de estoque com fluxo de disputa**. A implementação foi feita para preservar o histórico financeiro e operacional, sem tratar a aparência de disponibilidade no aplicativo como fonte de verdade.

> A confirmação final de regras tributárias, contratuais e de split deve ser validada com contador, jurídico e Mercado Pago. A separação dos valores no sistema não substitui uma análise fiscal.

## 1. Split payment e valores financeiros

Cada reserva e transação carregam três valores distintos, em centavos monetários representados no banco como `DECIMAL`:

| Campo | Proprietário econômico | Uso |
|---|---|---|
| `total_bag_value` | Valor bruto da sacola | Preço efetivamente pago pelo cliente |
| `platform_commission_fee` | CapiLoop | Comissão configurada por `CAPI_LOOP_COMMISSION_RATE`, atualmente com default técnico de 15% |
| `restaurant_net_value` | Restaurante | `total_bag_value - platform_commission_fee` |

O checkout calcula os três valores no backend, nunca no cliente. O payload encaminhado ao adaptador Mercado Pago inclui `marketplace_fee`, `application_fee`, `collector_id` quando o parceiro possui `mercadoPagoCollectorId`, e metadados de reconciliação. PIX, cartão e Checkout Pro usam o mesmo contrato de valores.

A integração ainda exige homologação real. Sem `MERCADO_PAGO_ACCESS_TOKEN`, o checkout recusa a operação de forma controlada. O `collector_id` precisa ser confirmado no modelo de marketplace escolhido pelo Mercado Pago antes de produção; a ausência dele mantém o `splitStatus` como `not_started` ou `pending`, sem afirmar que o repasse foi concluído.

## 2. Expiração por janela de retirada

Sacolas possuem `pickupDate`, `pickupStartAt`, `pickupEndAt`, além dos horários legados `pickupStartTime` e `pickupEndTime`. O backend aplica duas barreiras:

1. Toda consulta pública do catálogo executa uma varredura de ciclo de vida e retorna apenas estados `active` e `sold_out`.
2. A criação de reserva valida a janela novamente e muda a sacola para `expired` quando o fim já passou.

O módulo `server/bag-lifecycle.ts` executa `expireStaleBags` e `releaseExpiredReservationLocks`. O servidor agenda uma varredura periódica; o catálogo também faz uma varredura sob demanda para reduzir a janela entre a expiração real e a próxima leitura.

A precisão operacional é limitada ao intervalo do temporizador do servidor e ao instante da próxima requisição, mas a regra de escrita é protegida no backend. O cliente não pode reservar uma sacola cujo `pickupEndAt` expirou.

## 3. Lock de estoque e prevenção de dupla venda

Ao iniciar checkout, o backend executa uma atualização condicional:

```sql
UPDATE bags
SET reserved = reserved + 1
WHERE id = ?
  AND status = 'active'
  AND reserved < quantity;
```

Somente uma atualização com `affectedRows = 1` cria a reserva. Se o estoque acabar, o cliente recebe conflito; não existe incremento cego seguido de correção otimista. A reserva recebe `lockExpiresAt` — por padrão 15 minutos — e fica `pending` até a confirmação do pagamento. Falhas de gateway liberam a unidade e marcam a reserva como cancelada, sem apagar o histórico.

O sweep periódico cancela locks pendentes expirados e decrementa `bags.reserved` de forma protegida. A confirmação de pagamento limpa o lock e muda a reserva para `confirmed`.

## 4. Disputa, indisponibilidade e reembolso

A tela de comprovante possui a ação **Reportar problema com esta retirada**, com os motivos iniciais `bag_unavailable` e `pickup_issue`. O fluxo é:

1. O cliente envia a disputa para `disputes.create`; o backend valida titularidade e estado da reserva.
2. Apenas uma disputa pode existir por reserva.
3. O backend exige uma transação concluída com `paymentGatewayId`.
4. A reserva passa a `disputed` e a disputa recebe estado `open`.
5. O reembolso é iniciado via endpoint oficial do Mercado Pago com `X-Idempotency-Key` derivado do protocolo da disputa.
6. Em sucesso, a transação passa a `refunded`, a disputa passa a `refunded` e o parceiro recebe uma penalização interna.
7. Em falha de configuração ou gateway, o caso fica `under_review`/`failed` para tratamento da equipe, sem simular reembolso.

A penalização é interna e auditável: `reliabilityScore` do parceiro começa em 100, `disputeCount` registra a quantidade e cada motivo aplica pesos diferentes. Esses campos não são exibidos como avaliação pública.

## Estados essenciais

| Entidade | Estados relevantes |
|---|---|
| Parceiro | `pending`, `approved`, `rejected`, `suspended` |
| Sacola | `active`, `sold_out`, `expired`, `cancelled` |
| Reserva | `pending`, `confirmed`, `picked_up`, `cancelled`, `disputed` |
| Transação | `pending`, `completed`, `failed`, `refunded` |
| Split | `not_started`, `pending`, `completed`, `failed` |
| Disputa | `open`, `under_review`, `approved`, `rejected`, `refunded` |
| Reembolso | `not_requested`, `pending`, `processing`, `completed`, `failed` |

## Componentes e rotas

| Camada | Responsabilidade |
|---|---|
| `drizzle/schema.ts` | Campos de aprovação, janela temporal, lock, decomposição financeira, disputa e reputação interna |
| `server/bag-lifecycle.ts` | Expiração e liberação de locks |
| `server/routers/checkout.ts` | Lock condicional, cálculo financeiro e criação de transação |
| `server/_core/mercadopago.ts` | Payload de split, PIX, cartão, Checkout Pro e reembolso idempotente |
| `server/routers/partner-admin.ts` | Fila protegida de aprovação manual |
| `server/routers/disputes.ts` | Abertura, consulta, reembolso e penalização |
| `app/admin/partners.tsx` | Fila visual de revisão para administradores |
| `app/reservation/[id].tsx` | Ação de reporte e feedback do cliente |
| `lib/capiloop-store.tsx` | Persistência local dos estados de disputa e reembolso para o comprovante |

## Pendências de homologação

A arquitetura está preparada, mas o lançamento ainda exige credenciais de produção, identificação real dos recebedores Mercado Pago, validação do contrato de split, testes de PIX/cartão/webhook, conferência jurídica/fiscal e um piloto com restaurantes reais. O reembolso automático só deve ser considerado operacional depois de um teste controlado com pagamento aprovado e devolução confirmada no painel Mercado Pago.
