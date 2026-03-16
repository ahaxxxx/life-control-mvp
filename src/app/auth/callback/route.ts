import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookies";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const redirectUrl = new URL(next, requestUrl.origin);

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const response = NextResponse.redirect(redirectUrl);
  const secure = requestUrl.protocol === "https:";

  response.cookies.set(ACCESS_TOKEN_COOKIE, data.session.access_token, {
    path: "/",
    secure,
    sameSite: "lax",
    maxAge: data.session.expires_in,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, data.session.refresh_token, {
    path: "/",
    secure,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
