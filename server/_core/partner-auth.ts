import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";

import { partners, partnerSessions, type Partner } from "../../drizzle/schema";
import { getDb } from "../db";

const scrypt = promisify(scryptCallback);
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class PartnerAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PartnerAuthError";
  }
}

export function normalizePartnerEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPartnerPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPartnerPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [algorithm, salt, keyHex] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !keyHex) return false;

  const storedKey = Buffer.from(keyHex, "hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function extractBearerToken(authorization?: string) {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

export async function createPartnerSession(partnerId: number) {
  const db = await getDb();
  if (!db) throw new PartnerAuthError("Banco de dados indisponível");

  const token = randomBytes(32).toString("base64url");
  await db.insert(partnerSessions).values({
    partnerId,
    tokenHash: tokenHash(token),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });

  return { token, expiresInSeconds: Math.floor(SESSION_TTL_MS / 1000) };
}

export async function getPartnerFromAuthorization(authorization?: string): Promise<Partner | null> {
  const token = extractBearerToken(authorization);
  if (!token) return null;

  const db = await getDb();
  if (!db) return null;

  const session = await db
    .select()
    .from(partnerSessions)
    .where(and(eq(partnerSessions.tokenHash, tokenHash(token)), gt(partnerSessions.expiresAt, new Date())))
    .limit(1);

  if (!session[0]) return null;
  const partner = await db.select().from(partners).where(eq(partners.id, session[0].partnerId)).limit(1);
  return partner[0] ?? null;
}

export async function revokePartnerSession(authorization?: string) {
  const token = extractBearerToken(authorization);
  if (!token) return;

  const db = await getDb();
  if (!db) return;
  await db.delete(partnerSessions).where(eq(partnerSessions.tokenHash, tokenHash(token)));
}
