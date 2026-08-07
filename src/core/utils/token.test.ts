import { describe, expect, it } from "vitest";

import { decodeJwtPayload, isTokenExpired, sanitizeToken } from "@/core/utils/token";

function makeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.assinatura`;
}

describe("sanitizeToken", () => {
  it("aceita um JWT limpo", () => {
    expect(sanitizeToken(" abc.def.ghi ")).toBe("abc.def.ghi");
  });

  it("remove o prefixo Bearer", () => {
    expect(sanitizeToken("Bearer abc.def.ghi")).toBe("abc.def.ghi");
  });

  it("extrai o token de um objeto JSON salvo no storage", () => {
    expect(sanitizeToken('{"token":"abc.def.ghi"}')).toBe("abc.def.ghi");
    expect(sanitizeToken('"abc.def.ghi"')).toBe("abc.def.ghi");
  });

  it("rejeita valores vazios ou inválidos", () => {
    for (const value of ["", "  ", "null", "undefined", null, undefined, 42, {}]) {
      expect(sanitizeToken(value)).toBeNull();
    }
  });
});

describe("decodeJwtPayload", () => {
  it("lê o payload de um JWT válido", () => {
    const token = makeJwt({ sub: "user-1", exp: 1893456000 });
    expect(decodeJwtPayload(token)).toMatchObject({ sub: "user-1", exp: 1893456000 });
  });

  it("retorna null para strings que não são JWT", () => {
    expect(decodeJwtPayload("nao-e-um-jwt")).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("detecta token vencido", () => {
    expect(isTokenExpired(makeJwt({ exp: Math.floor(Date.now() / 1000) - 10 }))).toBe(true);
  });

  it("considera válido um token com folga suficiente", () => {
    expect(isTokenExpired(makeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 }))).toBe(false);
  });

  it("expira antecipadamente dentro da margem de segurança", () => {
    expect(isTokenExpired(makeJwt({ exp: Math.floor(Date.now() / 1000) + 5 }), 30)).toBe(true);
  });

  it("não expira tokens sem `exp`", () => {
    expect(isTokenExpired(makeJwt({ sub: "x" }))).toBe(false);
  });
});
