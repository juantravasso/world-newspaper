export type InternalRequestAuthorization =
  | {
      authorized: true;
    }
  | {
      authorized: false;
      status: 401 | 503;
      message: string;
    };

export function authorizeInternalRequest(
  request:
    Request,
): InternalRequestAuthorization {
  const secret =
    process.env
      .CRON_SECRET
      ?.trim();

  if (!secret) {
    return {
      authorized:
        false,

      status:
        503,

      message:
        "A variável CRON_SECRET não foi configurada.",
    };
  }

  const authorizationHeader =
    request.headers.get(
      "authorization",
    );

  if (
    authorizationHeader !==
    `Bearer ${secret}`
  ) {
    return {
      authorized:
        false,

      status:
        401,

      message:
        "Acesso não autorizado.",
    };
  }

  return {
    authorized:
      true,
  };
}