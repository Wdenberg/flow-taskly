// Utilitários puros de token JWT — sem dependências de framework, fáceis de testar.

/** Garante um JWT puro: sem objeto JSON, sem prefixo "Bearer", sem "null"/"undefined". */
export function sanitizeToken(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let value = raw.trim();
  if (!value || value === "null" || value === "undefined") return null;

  if (value.startsWith("{") || value.startsWith('"')) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (typeof parsed === "string") {
        value = parsed.trim();
      } else if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        const nested = obj["token"] ?? obj["accessToken"] ?? obj["jwt"];
        if (typeof nested !== "string") return null;
        value = nested.trim();
      }
    } catch {
      return null;
    }
  }

  if (/^bearer\s+/i.test(value)) value = value.replace(/^bearer\s+/i, "").trim();
  if (!value || value === "null" || value === "undefined") return null;
  return value;
}

export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

function base64UrlDecode(segment: string): string | null {
  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    if (typeof atob === "function") {
      const binary = atob(padded);
      // Reconstrói caracteres multibyte (nomes acentuados no payload).
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }
    return Buffer.from(padded, "base64").toString("utf-8");
  } catch {
    return null;
  }
}

/** Decodifica o payload de um JWT sem validar assinatura (apenas leitura de `exp`). */
export function decodeJwtPayload(token: string | null | undefined): JwtPayload | null {
  const clean = sanitizeToken(token);
  if (!clean) return null;
  const parts = clean.split(".");
  if (parts.length !== 3) return null;
  const json = base64UrlDecode(parts[1] ?? "");
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Verifica expiração de forma proativa, com margem de segurança (skew).
 * Tokens sem `exp` (ou não-JWT) são considerados válidos — quem decide é o backend.
 */
export function isTokenExpired(token: string | null | undefined, skewSeconds = 30): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return false;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

/** Milissegundos restantes até a expiração; `null` quando não há `exp`. */
export function millisUntilExpiry(token: string | null | undefined): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return null;
  return payload.exp * 1000 - Date.now();
}
