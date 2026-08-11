# Webhooks Mercado Pago

O endpoint de produção é `POST /api/payments/mercadopago/webhook`. A URL precisa ser configurada como HTTPS no painel da aplicação Mercado Pago e o segredo gerado em **Webhooks > Configure notifications** deve ser salvo como `MERCADO_PAGO_WEBHOOK_SECRET`.

O handler valida `x-signature`, `x-request-id` e `data.id` com o `WebhookSignatureValidator` do SDK oficial. Ele não confia no estado enviado pelo cliente: após validar a assinatura, consulta o pagamento no Mercado Pago e então atualiza a transação e a reserva locais.

| Variável | Uso | Obrigatória para |
|---|---|---|
| `MERCADO_PAGO_ACCESS_TOKEN` | Criação e consulta de pagamentos no servidor. | PIX, cartão e reconciliação. |
| `MERCADO_PAGO_PUBLIC_KEY` | Tokenização de cartão no SDK cliente Mercado Pago. | Cartão. |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Validação da assinatura recebida em `x-signature`. | Webhook. |
| `MERCADO_PAGO_WEBHOOK_URL` | URL HTTPS desse endpoint, enviada também em cada cobrança. | Notificações por cobrança. |

> O token de acesso e o segredo de webhook nunca devem ser expostos no app móvel ou no dashboard. O cartão é tokenizado pelo SDK oficial do Mercado Pago antes de a API do CapiLoop receber qualquer referência ao cartão.

Fonte: [documentação oficial do Mercado Pago sobre notificações](https://www.mercadopago.com.br/developers/en/docs/checkout-api-orders/notifications), consultada em 11 de agosto de 2026.

## Checkout Pro no aplicativo Expo

Para cartão no aplicativo Expo, o CapiLoop cria uma preferência no backend e abre o **Checkout Pro** no navegador integrado do sistema. A documentação oficial recomenda `expo-web-browser` (Custom Tabs no Android e Safari View Controller no iOS) e uma URL de retorno com deep link. Este projeto usa o esquema `capiloop://checkout/result`, registrado no manifesto Expo. Assim, o app não coleta, transmite nem armazena número de cartão, CVV ou validade.

Fonte: [Mercado Pago — React Native Expo Go](https://www.mercadopago.com.ar/developers/en/docs/checkout-pro/mobile-integration/react-native-expo-go), consultada em 11 de agosto de 2026.
