import { describe, expect, it } from "vitest";

import { getPickupUrgency } from "../lib/pickup-urgency";

describe("getPickupUrgency", () => {
  it("avisa quando a retirada está a menos de uma hora", () => {
    const urgency = getPickupUrgency("18:15", new Date("2026-08-20T17:30:00"));
    expect(urgency).toMatchObject({ level: "warning", remainingMinutes: 45, label: "Faltam 45 min para retirar" });
  });

  it("aumenta a urgência nos últimos quinze minutos", () => {
    const urgency = getPickupUrgency("18:00", new Date("2026-08-20T17:52:00"));
    expect(urgency).toMatchObject({ level: "critical", remainingMinutes: 8, label: "Retire nos próximos 8 min" });
  });

  it("não mostra alerta antes da janela de urgência", () => {
    expect(getPickupUrgency("20:00", new Date("2026-08-20T17:30:00"))).toBeNull();
  });
});
