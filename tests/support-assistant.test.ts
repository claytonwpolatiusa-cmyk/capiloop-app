import { describe, expect, it } from "vitest";

import { getSupportAssistantReply } from "../lib/support-assistant";
import { getSupportTicketStatus } from "../lib/support-ticket-status";

describe("assistente simples da Central de Ajuda", () => {
  it("encaminha dúvidas de pagamento para o assunto apropriado", () => {
    const reply = getSupportAssistantReply("Meu pagamento com pix não foi confirmado");
    expect(reply.suggestedTopicId).toBe("payment");
  });

  it("orienta dúvidas de retirada para a sacola", () => {
    const reply = getSupportAssistantReply("Qual é meu código para retirada?");
    expect(reply.suggestedTopicId).toBe("pickup");
  });

  it("mantém uma alternativa segura para perguntas não reconhecidas", () => {
    expect(getSupportAssistantReply("preciso de uma orientação diferente").suggestedTopicId).toBe("other");
  });

  it("mapeia o status recebido para uma explicação legível", () => {
    expect(getSupportTicketStatus("under_review").label).toBe("Em análise");
  });
});
