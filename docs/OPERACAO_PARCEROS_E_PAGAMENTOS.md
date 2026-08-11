# Operação de parceiros e pagamentos — CapiLoop

## Visão operacional

O CapiLoop separa claramente os dois públicos da plataforma. O **cliente** usa o aplicativo móvel para encontrar sacolas disponíveis, autenticar-se e concluir uma reserva. O **restaurante parceiro** acessa o portal web em `/partners/`, cria a conta empresarial, cadastra suas sacolas e acompanha o próprio resultado operacional. O portal e a API usam a mesma origem em produção, reduzindo a necessidade de configurações adicionais de CORS.

| Público | Canal | Ação principal |
|---|---|---|
| Cliente | Aplicativo CapiLoop | Descobrir sacolas, reservar e pagar por PIX ou cartão. |
| Restaurante parceiro | `/partners/` | Criar conta, validar CNPJ, publicar e administrar sacolas. |
| Plataforma | Backend CapiLoop | Validar disponibilidade, iniciar checkout e reconciliar o pagamento. |

## Fluxo do restaurante

O restaurante deve abrir `https://SEU-DOMINIO/partners/` e selecionar **Criar conta**. O cadastro pede nome empresarial, e-mail, senha, categoria, endereço, telefone e CNPJ. Antes de criar a conta, o servidor verifica os dígitos verificadores do documento e consulta a situação cadastral ativa. A consulta usa a BrasilAPI como fonte complementar; uma indisponibilidade temporária do serviço impede a criação para evitar registros sem verificação.[1]

> Nesta versão, um CNPJ com situação ativa cria uma conta de parceiro **aprovada automaticamente**. Para uma operação com análise humana, a regra deve ser alterada para gravar o parceiro como `pending` e aprová-lo em uma área administrativa separada.

Depois do login, o parceiro abre **Sacolas** e informa categoria, preço original, preço CapiLoop, itens esperados, janela de retirada, quantidade, impacto estimado de CO₂ e, opcionalmente, uma URL de imagem. O backend exige que o preço CapiLoop seja menor que o preço original. Ao publicar, a sacola fica disponível no endpoint público do catálogo e aparece nas telas **Descobrir** e **Explorar** do aplicativo assim que houver estoque.

| Regra de publicação | Comportamento |
|---|---|
| Parceiro habilitado | Apenas sessões de parceiros `approved` podem criar, listar ou cancelar sacolas. |
| Estoque disponível | Uma sacola é exibida enquanto `reservadas < quantidade`. |
| Preço de oportunidade | O preço CapiLoop precisa ser estritamente menor que o preço original. |
| Cancelamento | O parceiro pode cancelar uma sacola própria; ela deixa de aparecer no catálogo público. |

## Fluxo de pagamento do cliente

O aplicativo móvel carrega o catálogo em `GET /api/catalog/bags`. Ao tocar em **Reservar e pagar**, ele exige uma sessão de cliente e solicita ao backend uma preferência do **Checkout Pro**. O aplicativo abre a página hospedada do Mercado Pago em navegador seguro, onde o cliente escolhe PIX ou cartão. Dessa forma, o CapiLoop não recebe nem armazena número de cartão, CVV ou token de cartão no aplicativo.[2]

O backend cria uma reserva pendente, decrementa a disponibilidade reservando uma unidade de estoque e associa a transação a uma referência externa única. Ao receber a notificação, o webhook valida a assinatura, consulta o pagamento no Mercado Pago e atualiza a reserva. Pagamentos aprovados confirmam a retirada; pagamentos recusados, cancelados, estornados ou contestados cancelam a reserva e devolvem a unidade ao estoque. As notificações devem ser validadas por assinatura e conciliadas com o status consultado na API do Mercado Pago.[3]

| Método | Tela usada pelo cliente | Dados sensíveis processados pelo CapiLoop |
|---|---|---|
| PIX | Checkout Pro hospedado | Nenhum dado bancário. |
| Cartão de crédito | Checkout Pro hospedado | Nenhum número, CVV ou token de cartão. |
| Webhook | Backend CapiLoop | Identificador do pagamento, status e referência externa. |

## Configuração do Mercado Pago

As credenciais devem ser adicionadas exclusivamente nas configurações seguras do projeto. Elas nunca devem ser incluídas em arquivos do aplicativo ou no dashboard web.

| Variável | Obrigatória | Finalidade |
|---|---:|---|
| `MERCADO_PAGO_ACCESS_TOKEN` | Sim | Autoriza o backend a criar preferências de checkout e consultar pagamentos. |
| `MERCADO_PAGO_WEBHOOK_SECRET` | Sim | Valida a assinatura `x-signature` das notificações. |
| `MERCADO_PAGO_WEBHOOK_URL` | Sim | URL pública exata: `https://SEU-DOMINIO/api/payments/mercadopago/webhook`. |
| `MERCADO_PAGO_PUBLIC_KEY` | Não para o app atual | Necessária somente se o fluxo direto de tokenização de cartão for ativado no futuro. |

Após inserir uma credencial de teste, cadastre a URL de webhook no painel do Mercado Pago e habilite eventos de pagamento. Faça uma compra de teste por PIX e outra por cartão no ambiente de teste; a reserva deve ficar pendente antes da confirmação e mudar para confirmada após a notificação. Em caso de falha, verifique o log do webhook e o campo de assinatura antes de tentar novamente.

## Verificação e limites atuais

O projeto foi compilado com o portal de parceiros incluído no comando de build do backend. A checagem TypeScript e os testes unitários de domínio e CNPJ também foram executados com sucesso. O catálogo público responde corretamente, porém fica vazio até que um restaurante com conta aprovada publique a primeira sacola.

Enquanto as credenciais não forem preenchidas, o aplicativo mantém a interface de checkout pronta, mas o backend rejeita a criação de cobrança com uma mensagem de configuração. Isso é intencional: nenhuma cobrança fictícia é marcada como paga.

## Referências

[1] [BrasilAPI — documentação da API de CNPJ](https://brasilapi.com.br/docs)

[2] [Mercado Pago — integração Checkout Pro em React Native/Expo](https://www.mercadopago.com.ar/developers/en/docs/checkout-pro/mobile-integration/react-native-expo-go)

[3] [Mercado Pago — notificações e webhooks](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/notifications/webhooks)
