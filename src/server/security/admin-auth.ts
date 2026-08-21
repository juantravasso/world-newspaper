import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

const ADMIN_SESSION_COOKIE =
  "world_newspaper_admin";

const ADMIN_SESSION_VERSION =
  "v1";

const ADMIN_SESSION_MAX_AGE_SECONDS =
  8 *
  60 *
  60;

export type AdminAuthorizationResult =
  | {
      authorized:
        true;
    }
  | {
      authorized:
        false;

      status:
        401 | 503;

      message:
        string;
    };

export function verifyAdminCredentials(
  username:
    string,

  password:
    string,
): boolean {
  const configuredUsername =
    process.env
      .ADMIN_USERNAME;

  const configuredPassword =
    process.env
      .ADMIN_PASSWORD;

  if (
    !configuredUsername ||
    !configuredPassword
  ) {
    throw new Error(
      "As variáveis ADMIN_USERNAME e ADMIN_PASSWORD não foram configuradas.",
    );
  }

  return (
    safeEqual(
      username,
      configuredUsername,
    ) &&
    safeEqual(
      password,
      configuredPassword,
    )
  );
}

export function createAdminSessionToken():
  string {
  const username =
    getAdminUsername();

  const issuedAt =
    Date.now();

  const signature =
    createSessionSignature(
      username,
      issuedAt,
    );

  return [
    ADMIN_SESSION_VERSION,
    Buffer.from(
      username,
      "utf8",
    ).toString(
      "base64url",
    ),
    String(
      issuedAt,
    ),
    signature,
  ].join(
    ".",
  );
}

export function authorizeAdminRequest(
  request:
    Request,
): AdminAuthorizationResult {
  try {
    const token =
      readCookie(
        request.headers.get(
          "cookie",
        ),
        ADMIN_SESSION_COOKIE,
      );

    if (
      !token ||
      !verifyAdminSessionToken(
        token,
      )
    ) {
      return {
        authorized:
          false,

        status:
          401,

        message:
          "Sessão administrativa inválida ou expirada.",
      };
    }

    return {
      authorized:
        true,
    };
  } catch (
    error
  ) {
    return {
      authorized:
        false,

      status:
        503,

      message:
        error instanceof Error
          ? error.message
          : "A autenticação administrativa não foi configurada.",
    };
  }
}

export function createAdminSessionCookie(
  token:
    string,
): string {
  const secure =
    process.env.NODE_ENV ===
    "production";

  return [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(
      token,
    )}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${ADMIN_SESSION_MAX_AGE_SECONDS}`,
    secure
      ? "Secure"
      : "",
  ]
    .filter(
      Boolean,
    )
    .join(
      "; ",
    );
}

export function clearAdminSessionCookie():
  string {
  const secure =
    process.env.NODE_ENV ===
    "production";

  return [
    `${ADMIN_SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    secure
      ? "Secure"
      : "",
  ]
    .filter(
      Boolean,
    )
    .join(
      "; ",
    );
}

function verifyAdminSessionToken(
  token:
    string,
): boolean {
  const [
    version,
    encodedUsername,
    issuedAtValue,
    suppliedSignature,
  ] =
    token.split(
      ".",
    );

  if (
    version !==
      ADMIN_SESSION_VERSION ||
    !encodedUsername ||
    !issuedAtValue ||
    !suppliedSignature
  ) {
    return false;
  }

  const issuedAt =
    Number(
      issuedAtValue,
    );

  const now =
    Date.now();

  if (
    !Number.isFinite(
      issuedAt,
    ) ||
    issuedAt >
      now +
        5 *
          60 *
          1_000 ||
    now -
      issuedAt >
      ADMIN_SESSION_MAX_AGE_SECONDS *
        1_000
  ) {
    return false;
  }

  let username:
    string;

  try {
    username =
      Buffer.from(
        encodedUsername,
        "base64url",
      ).toString(
        "utf8",
      );
  } catch {
    return false;
  }

  if (
    !safeEqual(
      username,
      getAdminUsername(),
    )
  ) {
    return false;
  }

  const expectedSignature =
    createSessionSignature(
      username,
      issuedAt,
    );

  return safeEqual(
    suppliedSignature,
    expectedSignature,
  );
}

function createSessionSignature(
  username:
    string,

  issuedAt:
    number,
): string {
  const secret =
    process.env
      .ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "A variável ADMIN_SESSION_SECRET não foi configurada.",
    );
  }

  return createHmac(
    "sha256",
    secret,
  )
    .update(
      [
        ADMIN_SESSION_VERSION,
        username,
        String(
          issuedAt,
        ),
        "world-newspaper-admin",
      ].join(
        ":",
      ),
    )
    .digest(
      "base64url",
    );
}

function getAdminUsername():
  string {
  const username =
    process.env
      .ADMIN_USERNAME;

  if (!username) {
    throw new Error(
      "A variável ADMIN_USERNAME não foi configurada.",
    );
  }

  return username;
}

function safeEqual(
  first:
    string,

  second:
    string,
): boolean {
  const firstBuffer =
    Buffer.from(
      first,
      "utf8",
    );

  const secondBuffer =
    Buffer.from(
      second,
      "utf8",
    );

  if (
    firstBuffer.length !==
    secondBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    firstBuffer,
    secondBuffer,
  );
}

function readCookie(
  cookieHeader:
    string | null,

  cookieName:
    string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (
    const cookie of
    cookieHeader.split(
      ";",
    )
  ) {
    const [
      name,
      ...valueParts
    ] =
      cookie
        .trim()
        .split(
          "=",
        );

    if (
      name ===
      cookieName
    ) {
      return decodeURIComponent(
        valueParts.join(
          "=",
        ),
      );
    }
  }

  return null;
}
