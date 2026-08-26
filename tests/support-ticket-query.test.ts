import { describe, expect, it } from "vitest";

import { canRateTicket, filterAndSortTickets } from "../lib/support-ticket-query";

const tickets = [
  { protocol: "CAP-02", subject: "Pagamento", topic: "pagamento", status: "resolved" as const, updatedAt: "2026-08-20T12:00:00Z" },
  { protocol: "CAP-01", subject: "Reserva", topic: "reserva", status: "open" as const, updatedAt: "2026-08-22T12:00:00Z" },
  { protocol: "CAP-03", subject: "Conta", topic: "conta", status: "under_review" as const, updatedAt: "2026-08-21T12:00:00Z" },
];

describe("consultas de chamados", () => {
  it("filtra por status e pesquisa assunto, tema ou protocolo", () => {
    expect(filterAndSortTickets(tickets, "open", "recent", "").map((ticket) => ticket.protocol)).toEqual(["CAP-01"]);
    expect(filterAndSortTickets(tickets, "all", "recent", "pag").map((ticket) => ticket.protocol)).toEqual(["CAP-02"]);
    expect(filterAndSortTickets(tickets, "all", "recent", "cap-03").map((ticket) => ticket.protocol)).toEqual(["CAP-03"]);
  });

  it("ordena por atualização, antiguidade e assunto", () => {
    expect(filterAndSortTickets(tickets, "all", "recent", "")[0].protocol).toBe("CAP-01");
    expect(filterAndSortTickets(tickets, "all", "oldest", "")[0].protocol).toBe("CAP-02");
    expect(filterAndSortTickets(tickets, "all", "subject", "")[0].subject).toBe("Conta");
  });

  it("libera avaliação apenas após resolução ou encerramento", () => {
    expect(canRateTicket("open")).toBe(false);
    expect(canRateTicket("under_review")).toBe(false);
    expect(canRateTicket("resolved")).toBe(true);
    expect(canRateTicket("closed")).toBe(true);
  });
});
