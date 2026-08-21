import { describe, expect, it } from "vitest";

import { getPickupConfirmationError } from "../server/pickup-confirmation";

describe("getPickupConfirmationError", () => {
  it("oculta códigos que não pertencem ao parceiro autenticado", () => {
    expect(getPickupConfirmationError({ belongsToPartner: false, reservationStatus: "confirmed", hasCompletedPayment: true })).toMatchObject({ status: 404 });
  });

  it("bloqueia pagamento pendente e retirada já registrada", () => {
    expect(getPickupConfirmationError({ belongsToPartner: true, reservationStatus: "pending", hasCompletedPayment: false })).toMatchObject({ status: 409 });
    expect(getPickupConfirmationError({ belongsToPartner: true, reservationStatus: "picked_up", hasCompletedPayment: true })).toMatchObject({ status: 409 });
  });

  it("só libera reserva confirmada com pagamento concluído", () => {
    expect(getPickupConfirmationError({ belongsToPartner: true, reservationStatus: "confirmed", hasCompletedPayment: false })).toMatchObject({ status: 409 });
    expect(getPickupConfirmationError({ belongsToPartner: true, reservationStatus: "confirmed", hasCompletedPayment: true })).toBeNull();
  });
});
