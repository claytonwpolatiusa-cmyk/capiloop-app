import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Partner (restaurant/bakery) table for CapiLoop merchants.
 */
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  businessName: varchar("businessName", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }).unique(),
  category: varchar("category", { length: 64 }).notNull(),
  address: text("address").notNull(),
  latitude: varchar("latitude", { length: 32 }),
  longitude: varchar("longitude", { length: 32 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }).notNull(),
  passwordHash: text("passwordHash"),
  cnpjStatus: varchar("cnpjStatus", { length: 32 }),
  cnpjVerifiedAt: timestamp("cnpjVerifiedAt"),
  lastSignedInAt: timestamp("lastSignedInAt"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Sessões opacas e revogáveis do portal de parceiros. Somente o hash SHA-256
 * do token bearer é persistido, e nunca o token em texto puro.
 */
export const partnerSessions = mysqlTable("partnerSessions", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull().references(() => partners.id),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PartnerSession = typeof partnerSessions.$inferSelect;
export type InsertPartnerSession = typeof partnerSessions.$inferInsert;

/**
 * Daily surplus bag offerings from partners.
 */
export const bags = mysqlTable("bags", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull().references(() => partners.id),
  category: varchar("category", { length: 64 }).notNull(),
  originalPrice: decimal("originalPrice", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("salePrice", { precision: 10, scale: 2 }).notNull(),
  expectedItems: text("expectedItems").notNull(),
  pickupStartTime: varchar("pickupStartTime", { length: 8 }).notNull(),
  pickupEndTime: varchar("pickupEndTime", { length: 8 }).notNull(),
  quantity: int("quantity").notNull().default(1),
  reserved: int("reserved").notNull().default(0),
  co2Kg: decimal("co2Kg", { precision: 5, scale: 2 }).notNull(),
  imageUrl: text("imageUrl"),
  status: mysqlEnum("status", ["active", "sold_out", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bag = typeof bags.$inferSelect;
export type InsertBag = typeof bags.$inferInsert;

/**
 * Customer addresses for delivery/pickup.
 */
export const addresses = mysqlTable("addresses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  label: varchar("label", { length: 64 }),
  street: varchar("street", { length: 255 }).notNull(),
  number: varchar("number", { length: 20 }).notNull(),
  complement: text("complement"),
  neighborhood: varchar("neighborhood", { length: 128 }).notNull(),
  city: varchar("city", { length: 128 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zipCode", { length: 10 }).notNull(),
  isDefault: int("isDefault").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

/**
 * Customer payment methods (credit card, PIX, etc).
 */
export const paymentMethods = mysqlTable("paymentMethods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["credit_card", "pix", "debit_card"]).notNull(),
  token: text("token").notNull(),
  lastFour: varchar("lastFour", { length: 4 }),
  brand: varchar("brand", { length: 64 }),
  isDefault: int("isDefault").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

/**
 * Customer reservations of bags.
 */
export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  bagId: int("bagId").notNull().references(() => bags.id),
  code: varchar("code", { length: 20 }).unique().notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "picked_up", "cancelled"]).default("pending").notNull(),
  pickupTime: varchar("pickupTime", { length: 8 }),
  pickupDate: varchar("pickupDate", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

/**
 * Payment transactions.
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  reservationId: int("reservationId").notNull().references(() => reservations.id),
  userId: int("userId").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethodId: int("paymentMethodId").references(() => paymentMethods.id),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  paymentGatewayId: varchar("paymentGatewayId", { length: 255 }),
  paymentGateway: varchar("paymentGateway", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Chamados criados pelo cliente na Central de Ajuda.
 * O protocolo é exibido ao cliente e os anexos ficam no armazenamento seguro.
 */
export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  protocol: varchar("protocol", { length: 32 }).notNull().unique(),
  topic: varchar("topic", { length: 64 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  details: text("details"),
  status: mysqlEnum("status", ["open", "under_review", "resolved", "closed"]).default("open").notNull(),
  attachmentCount: int("attachmentCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/** Metadados dos arquivos enviados pelo cliente como evidência do chamado. */
export const supportAttachments = mysqlTable("supportAttachments", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull().references(() => supportTickets.id),
  userId: int("userId").notNull().references(() => users.id),
  fileKey: text("fileKey").notNull(),
  url: text("url").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupportAttachment = typeof supportAttachments.$inferSelect;
export type InsertSupportAttachment = typeof supportAttachments.$inferInsert;

/**
 * Relations for Drizzle ORM.
 */
export const usersRelations = relations(users, ({ many }) => ({
  partners: many(partners),
  addresses: many(addresses),
  paymentMethods: many(paymentMethods),
  reservations: many(reservations),
  supportTickets: many(supportTickets),
}));

export const partnersRelations = relations(partners, ({ one, many }) => ({
  user: one(users, { fields: [partners.userId], references: [users.id] }),
  bags: many(bags),
  sessions: many(partnerSessions),
}));

export const partnerSessionsRelations = relations(partnerSessions, ({ one }) => ({
  partner: one(partners, { fields: [partnerSessions.partnerId], references: [partners.id] }),
}));

export const bagsRelations = relations(bags, ({ one, many }) => ({
  partner: one(partners, { fields: [bags.partnerId], references: [partners.id] }),
  reservations: many(reservations),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, { fields: [paymentMethods.userId], references: [users.id] }),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, { fields: [reservations.userId], references: [users.id] }),
  bag: one(bags, { fields: [reservations.bagId], references: [bags.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  reservation: one(reservations, { fields: [transactions.reservationId], references: [reservations.id] }),
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  paymentMethod: one(paymentMethods, { fields: [transactions.paymentMethodId], references: [paymentMethods.id] }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
  attachments: many(supportAttachments),
}));

export const supportAttachmentsRelations = relations(supportAttachments, ({ one }) => ({
  ticket: one(supportTickets, { fields: [supportAttachments.ticketId], references: [supportTickets.id] }),
  user: one(users, { fields: [supportAttachments.userId], references: [users.id] }),
}));
