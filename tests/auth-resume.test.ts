import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      storage.delete(key);
    }),
  },
}));

import { consumePendingCheckoutOffer, savePendingCheckoutOffer } from "../lib/auth-resume";

describe("contexto de retomada de checkout", () => {
  beforeEach(() => {
    storage.clear();
    vi.clearAllMocks();
  });

  it("persiste a oferta que precisa ser retomada após o acesso", async () => {
    await savePendingCheckoutOffer("42");

    await expect(consumePendingCheckoutOffer()).resolves.toBe("42");
  });

  it("consome o contexto uma única vez para evitar novo checkout acidental", async () => {
    await savePendingCheckoutOffer("17");

    await expect(consumePendingCheckoutOffer()).resolves.toBe("17");
    await expect(consumePendingCheckoutOffer()).resolves.toBeNull();
  });

  it("não persiste valores de rota vazios", async () => {
    await savePendingCheckoutOffer("   ");

    await expect(consumePendingCheckoutOffer()).resolves.toBeNull();
  });
});
