export const SUPPORT_EMAIL = "claytonwpolati.usa@gmail.com";

export type HelpTopicId =
  | "reservation"
  | "payment"
  | "pickup"
  | "account"
  | "partner"
  | "other";

export type HelpTopic = {
  id: HelpTopicId;
  title: string;
  shortTitle: string;
  description: string;
  quickAnswer: string;
  icon: string;
};

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "reservation",
    title: "Reserva e pedido",
    shortTitle: "minha reserva",
    description: "Não encontrei, não consigo alterar ou tenho dúvida sobre meu pedido.",
    quickAnswer: "Confira a aba Sacolas e o comprovante do pedido. Se a reserva não aparecer, envie-nos os detalhes para verificarmos.",
    icon: "shopping-bag",
  },
  {
    id: "payment",
    title: "Pagamento e reembolso",
    shortTitle: "meu pagamento",
    description: "PIX, cartão, cobrança duplicada, pagamento pendente ou reembolso.",
    quickAnswer: "Mantenha o comprovante de pagamento por perto. O suporte consegue localizar a transação mais rápido com o código do pedido.",
    icon: "payments",
  },
  {
    id: "pickup",
    title: "Retirada da sacola",
    shortTitle: "minha retirada",
    description: "Horário, endereço, código de retirada ou imprevisto no local.",
    quickAnswer: "Leve o código exibido no comprovante e respeite a janela de retirada. Para um imprevisto, fale com a gente antes de o horário terminar.",
    icon: "storefront",
  },
  {
    id: "account",
    title: "Conta e perfil",
    shortTitle: "minha conta",
    description: "Entrada, dados pessoais, notificações ou acesso à conta.",
    quickAnswer: "Tente entrar novamente pelo Perfil. Se o acesso continuar indisponível, descreva o que aconteceu para recebermos o contexto certo.",
    icon: "person-outline",
  },
  {
    id: "partner",
    title: "Quero ser parceiro",
    shortTitle: "parceria com meu estabelecimento",
    description: "Cadastro de restaurante, padaria, café ou mercado na CapiLoop.",
    quickAnswer: "Conte qual é o seu estabelecimento, cidade e o melhor contato. Nosso time orienta o cadastro e a aprovação antes da primeira sacola.",
    icon: "handshake",
  },
  {
    id: "other",
    title: "Outro assunto",
    shortTitle: "outro assunto",
    description: "Seu tema não está nesta lista? Conte para a gente.",
    quickAnswer: "Descreva o que aconteceu com o máximo de contexto possível. Assim conseguimos encaminhar sua mensagem sem idas e vindas.",
    icon: "chat-bubble-outline",
  },
];

export type SupportEmailDraft = {
  recipients: string[];
  subject: string;
  body: string;
};

export function getHelpTopic(id: HelpTopicId | null): HelpTopic | undefined {
  return HELP_TOPICS.find((topic) => topic.id === id);
}

export function buildSupportEmail(topic: HelpTopic, details: string, accountEmail?: string | null): SupportEmailDraft {
  const trimmedDetails = details.trim();
  const accountLine = accountEmail ? `E-mail da conta: ${accountEmail}` : "E-mail da conta: não informado";
  const detailLine = trimmedDetails || "Detalhes: preciso de ajuda e gostaria de receber orientação.";

  return {
    recipients: [SUPPORT_EMAIL],
    subject: `[CapiLoop] Ajuda com ${topic.shortTitle}`,
    body: [
      `Olá, preciso de ajuda com ${topic.shortTitle}.`,
      "",
      detailLine,
      "",
      accountLine,
      "Enviado pela Central de Ajuda do app CapiLoop.",
    ].join("\n"),
  };
}

export function buildMailtoUrl(draft: SupportEmailDraft): string {
  return `mailto:${draft.recipients.join(",")}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
}
