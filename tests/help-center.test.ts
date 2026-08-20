import { describe, expect, it } from "vitest";

import { buildMailtoUrl, buildSupportEmail, getHelpTopic, SUPPORT_EMAIL } from "../lib/help-center";

describe("Central de Ajuda", () => {
  it("monta uma mensagem de suporte contextualizada para o assunto selecionado", () => {
    const topic = getHelpTopic("pickup");
    expect(topic).toBeDefined();

    const draft = buildSupportEmail(topic!, "Não encontrei o código do pedido.", "cliente@exemplo.com");

    expect(draft.recipients).toEqual([SUPPORT_EMAIL]);
    expect(draft.subject).toBe("[CapiLoop] Ajuda com minha retirada");
    expect(draft.body).toContain("Não encontrei o código do pedido.");
    expect(draft.body).toContain("cliente@exemplo.com");
  });

  it("mantém uma solicitação compreensível quando a pessoa não escreve detalhes", () => {
    const topic = getHelpTopic("payment");
    const draft = buildSupportEmail(topic!, "   ");

    expect(draft.body).toContain("preciso de ajuda e gostaria de receber orientação");
    expect(draft.body).toContain("E-mail da conta: não informado");
  });

  it("codifica assunto e conteúdo para o fallback mailto", () => {
    const topic = getHelpTopic("other");
    const draft = buildSupportEmail(topic!, "Preciso de ajuda & retorno.");
    const url = buildMailtoUrl(draft);

    expect(url).toContain(`mailto:${SUPPORT_EMAIL}`);
    expect(url).toContain("Ajuda%20com%20outro%20assunto");
    expect(url).toContain("%26");
  });
});
