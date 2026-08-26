import type { SupportTicketStatus } from "./support-ticket-status";

export type TicketFilter = "all" | SupportTicketStatus;
export type TicketSort = "recent" | "oldest" | "subject";

export type TicketSearchItem = {
  protocol: string;
  subject: string;
  topic: string;
  status: SupportTicketStatus;
  updatedAt: Date | string;
};

export function filterAndSortTickets<T extends TicketSearchItem>(tickets: T[], filter: TicketFilter, sort: TicketSort, search: string) {
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  return tickets
    .filter((ticket) => filter === "all" || ticket.status === filter)
    .filter((ticket) => !normalizedSearch || [ticket.protocol, ticket.subject, ticket.topic]
      .some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedSearch)))
    .sort((left, right) => {
      if (sort === "subject") return left.subject.localeCompare(right.subject, "pt-BR");
      const difference = new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime();
      return sort === "oldest" ? difference : -difference;
    });
}

export function canRateTicket(status: SupportTicketStatus) {
  return status === "resolved" || status === "closed";
}
