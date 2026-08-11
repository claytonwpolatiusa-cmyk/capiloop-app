import { describe, expect, it } from "vitest";
import { cleanCNPJ, formatCNPJ, isValidCNPJ } from "../server/_core/cnpj-validator";

describe("CNPJ validator", () => {
  it("aceita um CNPJ conhecido com pontuação", () => {
    expect(isValidCNPJ("04.252.011/0001-10")).toBe(true);
    expect(cleanCNPJ("04.252.011/0001-10")).toBe("04252011000110");
  });

  it("rejeita sequências repetidas e dígitos verificadores inválidos", () => {
    expect(isValidCNPJ("00.000.000/0000-00")).toBe(false);
    expect(isValidCNPJ("04.252.011/0001-11")).toBe(false);
  });

  it("formata somente os primeiros quatorze dígitos", () => {
    expect(formatCNPJ("04252011000110abc")).toBe("04.252.011/0001-10");
  });
});
