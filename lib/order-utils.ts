export type OrderStatus = "pending" | "confirmed" | "picked_up" | "cancelled";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | null;

export function orderStatusPresentation(status: OrderStatus, paymentStatus: PaymentStatus) {
  if (status === "picked_up") return { label: "RETIRADA CONCLUÍDA", color: "#405500", background: "#ECF6CD", icon: "task-alt" as const };
  if (status === "cancelled" || paymentStatus === "failed" || paymentStatus === "refunded") return { label: "PEDIDO ENCERRADO", color: "#9B2C25", background: "#FCE8E6", icon: "cancel" as const };
  if (paymentStatus === "completed" || status === "confirmed") return { label: "PRONTO PARA RETIRAR", color: "#405500", background: "#ECF6CD", icon: "check-circle" as const };
  return { label: "PAGAMENTO EM ANÁLISE", color: "#8A5A00", background: "#FFF3D8", icon: "schedule" as const };
}

export function formatOrderDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function formatPickupWindow(start?: string | null, end?: string | null) {
  if (!start) return "Horário a confirmar";
  return end ? `${start}–${end}` : start;
}
