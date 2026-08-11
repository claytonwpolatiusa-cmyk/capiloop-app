# Jornada móvel simplificada — CapiLoop

## Princípio de navegação

O aplicativo organiza a experiência em três intenções principais: **encontrar uma sacola**, **acompanhar a reserva** e **gerenciar a conta**. A descoberta continua sendo o ponto de entrada; mapa e impacto ficam disponíveis como atalhos contextuais para não competir com a reserva na barra inferior.

| Momento | Ação prioritária | Resposta da interface |
|---|---|---|
| Descoberta | Encontrar uma oferta disponível | Cabeçalho com localização, filtros rápidos, contador de opções e atalho para mapa. |
| Detalhe | Decidir com segurança | Janela de retirada, endereço, economia, impacto e uma etapa explícita de pagamento seguro. |
| Identificação | Entrar para reservar | CTA muda para “Entrar para reservar” e explica que a conta protege o código de retirada. |
| Checkout | Concluir pagamento | Transição para o Mercado Pago com mensagem de retorno ao CapiLoop e estado de abertura. |
| Resultado | Saber o próximo passo | Estado visual de aprovado, pendente ou falha, com uma única ação primária contextual. |
| Retirada | Chegar preparado ao parceiro | Sacola prioriza horário, endereço e código de retirada. |

## Decisões de interface

As transições devem reforçar a continuidade do fluxo, sem animações chamativas. Detalhes de oferta entram lateralmente, resultado de pagamento e estados de sucesso aparecem com fade, e ações primárias possuem pressão curta e feedback háptico leve. Mensagens vazias sempre oferecem uma saída clara para a etapa anterior.

O usuário nunca deve precisar adivinhar o que acontece depois: antes do checkout, vê as três etapas; após o retorno, recebe uma ação adequada ao status; e na aba de sacolas enxerga primeiro a retirada ou pendência mais relevante.
