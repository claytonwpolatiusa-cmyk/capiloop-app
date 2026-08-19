# Checklist de Lançamento — CapiLoop na App Store

> **Objetivo:** organizar as etapas de distribuição da CapiLoop, sem substituir aconselhamento jurídico, contábil ou regulatório individual.

## Resposta curta

**Sim, é possível submeter a CapiLoop à App Store depois de abrir a conta Apple Developer.** Para aparecer como empresa — e não no seu nome pessoal — a inscrição deve ser feita como **organização**, após a constituição da pessoa jurídica. O registro da marca não é uma exigência técnica da Apple para enviar o aplicativo, mas é altamente recomendável como proteção do nome e da identidade da CapiLoop no Brasil.

## Ordem recomendada

| Ordem | Etapa | Por que importa |
|---:|---|---|
| 1 | Validar disponibilidade de “CapiLoop” e protocolar o pedido de marca no INPI | O registro é o caminho para exclusividade da marca no território nacional.[^inpi] |
| 2 | Constituir o CNPJ e definir o objeto social/atividade com contador | Permite contratar, faturar e se relacionar formalmente com parceiros e provedores de pagamento. |
| 3 | Criar domínio e e-mail corporativo | A Apple pede site público funcional e e-mail de trabalho associado ao domínio para inscrição como organização.[^apple-enrollment] |
| 4 | Solicitar/verificar o número D‑U‑N‑S | Ele é exigido pela Apple para verificar a organização.[^apple-enrollment] |
| 5 | Inscrever a empresa no Apple Developer Program | A entidade jurídica será exibida como “Seller” na App Store.[^apple-enrollment] |
| 6 | Concluir itens de revisão do aplicativo | Política de privacidade, termos, dados de suporte, conta de demonstração e backend acessível são pontos essenciais.[^apple-review] |
| 7 | Criar o registro no App Store Connect, gerar build iOS e enviar para revisão | A aprovação depende de funcionalidade, segurança, privacidade e aderência às diretrizes.[^apple-review] |

## Pontos específicos da CapiLoop

| Tema | Ação antes da submissão |
|---|---|
| Privacidade | Publicar política de privacidade em URL pública e completar os rótulos de privacidade no App Store Connect. |
| Login | Fornecer uma conta de demonstração funcional ou modo de demonstração completo para a equipe de revisão. |
| Pagamentos | Como a CapiLoop vende **bens físicos** (sacolas de alimentos), o fluxo Mercado Pago deve ser explicado claramente nas notas de revisão. Confirme o enquadramento final com profissional jurídico/contábil. |
| Retirada e parceiros | Manter regras de reserva, retirada, cancelamento, reembolso e contato de suporte acessíveis no app e no site. |
| Dados de localização | Mostrar uma justificativa clara de localização e solicitar somente a permissão necessária. |
| Operação | Submeter somente quando catálogo, backend, fluxo de login e pagamentos estiverem funcionais para a revisão. |

## O que não precisa esperar para começar

Você pode continuar desenvolvimento, testes internos, material comercial, captação de parceiros, perfil social, site, política de privacidade e preparação dos metadados da loja **antes** de concluir a marca. O que deve ser evitado é apresentar a marca como já registrada se o processo ainda estiver pendente.

## Referência de custos do INPI para marca

> **Valores por classe de produtos/serviços; conferir a tabela vigente no momento de emitir a GRU.** A tabela oficial consultada indica dois pagamentos usuais quando o pedido é deferido: depósito do pedido e primeiro decênio/certificado.

| Etapa | Sem desconto | Com desconto de 50%* |
|---|---:|---:|
| Pedido de registro com especificação pré-aprovada (código 389) | R$ 880,00 | R$ 440,00 |
| Primeiro decênio de vigência e certificado, no prazo ordinário (código 372) | R$ 750,00 | R$ 375,00 |
| **Total típico se deferido, por classe** | **R$ 1.630,00** | **R$ 815,00** |

\*A elegibilidade para desconto depende do enquadramento previsto pelo INPI. Confirme o perfil aplicável ao emitir a GRU. Se a especificação for de livre preenchimento (código 394), os valores de pedido são maiores: R$ 1.720,00 ou R$ 860,00 com desconto.

**Custos à parte:** busca/estratégia de classes e honorários de escritório ou advogado, se você optar por assessoria. Eles não são taxas do INPI e variam por prestador.

## Fontes oficiais

[^apple-enrollment]: Apple, [Program enrollment](https://developer.apple.com/help/account/membership/program-enrollment/).
[^apple-review]: Apple, [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
[^inpi]: INPI, [Guia Básico de Marcas](https://www.gov.br/inpi/pt-br/servicos/marcas/guia-basico).

**Tabela oficial de valores:** INPI, [Custos e Pagamento](https://www.gov.br/inpi/pt-br/servicos/marcas/custos) e [Tabela de Retribuições — Serviços de Marcas](https://www.gov.br/inpi/pt-br/servicos/marcas/NovaTabeladeRetribuiesINPI_MARCAS_Final_20_dez_25.pdf), consultadas em 19/08/2026.

## Nota sobre estrutura internacional e residência fiscal

Abrir uma empresa em outro país não substitui, por si só, a situação fiscal pessoal e operacional no Brasil. A Receita Federal informa que quem sai em caráter permanente deve comunicar a saída definitiva; a condição de não residente também pode ocorrer após 12 meses consecutivos de ausência em saída temporária. A comunicação não dispensa a declaração de saída definitiva, declarações anteriores nem impostos apurados.

Paraguai e Uruguai usam regras predominantemente baseadas em fonte para diversos rendimentos empresariais, mas suas regras específicas de fonte, residência, substância e renda passiva exigem avaliação individual. Para uma operação que atende clientes, parceiros e pagamentos no Brasil, é indispensável modelar onde se encontram direção efetiva, pessoas, contratos, plataforma e atividade econômica antes de decidir por estrutura estrangeira.

**Referências consultadas em 19/08/2026:** Receita Federal, [Comunicar saída definitiva do país](https://www.gov.br/pt-br/servicos/comunicar-saida-definitiva-do-pais); PwC, [Paraguay — Corporate income determination](https://taxsummaries.pwc.com/paraguay/corporate/income-determination); PwC, [Uruguay — Corporate income determination](https://taxsummaries.pwc.com/uruguay/corporate/income-determination).
