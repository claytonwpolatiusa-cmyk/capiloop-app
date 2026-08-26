export type SupportAssistantReply = {
  title: string;
  answer: string;
  suggestedTopicId?: "reservation" | "payment" | "pickup" | "account" | "partner" | "other";
};

const FALLBACK_REPLY: SupportAssistantReply = {
  title: "Posso encaminhar isso",
  answer: "Escolha o assunto mais próximo abaixo. Se precisar, descreva o que aconteceu e envie um chamado com protocolo para acompanhar a resposta.",
  suggestedTopicId: "other",
};

const RESPONSES: Array<{ terms: string[]; reply: SupportAssistantReply }> = [
  {
    terms: ["pix", "cartao", "cartão", "pagamento", "cobrança", "cobranca"],
    reply: { title: "Sobre pagamentos", answer: "Verifique o status em Histórico de pedidos. Se houver uma cobrança pendente ou divergente, abra o tema Pagamento e envie o chamado com o comprovante ou uma captura de tela.", suggestedTopicId: "payment" },
  },
  {
    terms: ["retirada", "retirar", "codigo", "código", "horario", "horário"],
    reply: { title: "Sobre retirada", answer: "Abra sua Sacola para confirmar horário, endereço e código de retirada. O estabelecimento confirma a entrega usando o código do comprovante.", suggestedTopicId: "pickup" },
  },
  {
    terms: ["reserva", "sacola", "esgotada", "esgotado"],
    reply: { title: "Sobre reservas", answer: "As sacolas têm quantidade limitada e a confirmação depende do pagamento. Veja a Sacola para consultar seu pedido; se a reserva não aparecer, abra um chamado com o nome do estabelecimento.", suggestedTopicId: "reservation" },
  },
  {
    terms: ["conta", "login", "entrar", "cadastro", "senha"],
    reply: { title: "Sobre sua conta", answer: "Use Perfil para entrar ou criar uma conta. Estar conectado permite acompanhar chamados, pedidos e recibos no mesmo dispositivo.", suggestedTopicId: "account" },
  },
  {
    terms: ["restaurante", "parceiro", "cnpj", "vender", "publicar"],
    reply: { title: "Sobre parcerias", answer: "Estabelecimentos fazem o cadastro no portal de parceiros e passam por aprovação antes de publicar sacolas. Escolha Parceria para solicitar orientação ao time CapiLoop.", suggestedTopicId: "partner" },
  },
];

function normalize(value: string) {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function getSupportAssistantReply(question: string): SupportAssistantReply {
  const normalized = normalize(question.trim());
  if (!normalized) {
    return { title: "Olá, eu sou a Capi", answer: "Posso orientar sobre pagamentos, retirada, reservas, conta ou parceria. Escreva sua dúvida em poucas palavras." };
  }
  return RESPONSES.find(({ terms }) => terms.some((term) => normalized.includes(normalize(term))))?.reply ?? FALLBACK_REPLY;
}
