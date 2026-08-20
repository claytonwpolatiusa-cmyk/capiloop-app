import { describe, expect, it } from "vitest";

import { buildPickupSlots } from "../lib/pickup-slots";

describe("buildPickupSlots", () => {
  it("creates three collection choices within a one-hour pickup window", () => {
    expect(buildPickupSlots("18h–19h")).toEqual([
      { value: "18:00", label: "18h00" },
      { value: "18:30", label: "18h30" },
      { value: "18:50", label: "18h50" },
    ]);
  });

  it("supports windows with explicit minutes", () => {
    expect(buildPickupSlots("17h30–18h30").map((slot) => slot.value)).toEqual(["17:30", "18:00", "18:20"]);
  });
});
