export const ACCESS_TOKEN_COOKIE = "life-control-access-token";
export const REFRESH_TOKEN_COOKIE = "life-control-refresh-token";

export function clearClientAuthCookies() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${ACCESS_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getClientCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : null;
}
