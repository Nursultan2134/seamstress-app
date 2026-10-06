// Pure, framework-agnostic session token signing/verification.
// Uses Web Crypto (crypto.subtle) instead of Node's `crypto` module so this
// file is safe to import from both Next.js Edge middleware and server code.

export type Role =
  | "OWNER"
  | "MANAGER"
  | "CUTTER"
  | "SEWER"
  | "QC"
  | "SHIPPER"
  | "IRONER";

export type SessionPayload = {
  employeeId: string;
  role: Role;
  workshopId: string;
};

export const SESSION_COOKIE = "session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days — shared shop-floor tablet stays logged in
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const data = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await getKey();
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signature = bytesToBase64Url(new Uint8Array(signatureBytes));
  return `${data}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      encoder.encode(data)
    );
    if (!valid) return null;
    return JSON.parse(decoder.decode(base64UrlToBytes(data))) as SessionPayload;
  } catch {
    return null;
  }
}
