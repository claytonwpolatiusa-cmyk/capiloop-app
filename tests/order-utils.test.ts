import { formatPickupWindow, orderStatusPresentation } from "../lib/order-utils";
import { describe, expect, it } from "vitest";

describe("comprovantes de pedido", () => {
  it("prioriza retirada concluída sobre o status do pagamento", () => {
    expect(orderStatusPresentation("picked_up", "completed").label).toBe("RETIRADA CONCLUÍDA");
  });

  it("destaca pedidos prontos para retirar quando o pagamento foi confirmado", () => {
    expect(orderStatusPresentation("confirmed", "completed").label).toBe("PRONTO PARA RETIRAR");
  });

  it("mantém instruções claras para pagamentos em análise", () => {
    expect(orderStatusPresentation("pending", "pending").label).toBe("PAGAMENTO EM ANÁLISE");
    expect(formatPickupWindow("18:00", "19:30")).toBe("18:00–19:30");
  });
});
