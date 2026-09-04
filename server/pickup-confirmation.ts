export type PickupConfirmationState = "pending" | "confirmed" | "picked_up" | "cancelled" | "disputed";

export function getPickupConfirmationError(input: {
  belongsToPartner: boolean;
  reservationStatus: PickupConfirmationState;
  hasCompletedPayment: boolean;
}) {
  if (!input.belongsToPartner) {
    return { status: 404, message: "Comprovante não encontrado para este estabelecimento." } as const;
  }
  if (input.reservationStatus === "picked_up") {
    return { status: 409, message: "Esta retirada já foi confirmada anteriormente." } as const;
  }
  if (input.reservationStatus !== "confirmed") {
    return { status: 409, message: "A retirada só pode ser confirmada após a aprovação do pagamento." } as const;
  }
  if (!input.hasCompletedPayment) {
    return { status: 409, message: "O pagamento desta reserva ainda não foi confirmado." } as const;
  }
  return null;
}
