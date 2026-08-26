export type SupportTicketStatus = "open" | "under_review" | "resolved" | "closed";

export function getSupportTicketStatus(status: SupportTicketStatus) {
  const labels: Record<SupportTicketStatus, { label: string; description: string; color: string; background: string }> = {
    open: { label: "Recebido", description: "Seu chamado foi registrado e aguarda análise.", color: "#4D611C", background: "#EAF7C8" },
    under_review: { label: "Em análise", description: "O time está avaliando as informações enviadas.", color: "#8A5714", background: "#FFF0D6" },
    resolved: { label: "Respondido", description: "Há uma orientação ou solução disponível para este chamado.", color: "#146A4F", background: "#DDF5E8" },
    closed: { label: "Encerrado", description: "Este atendimento foi concluído.", color: "#617060", background: "#EDF0EB" },
  };
  return labels[status];
}
