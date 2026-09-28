import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const flowId = requestUrl.searchParams.get("sb_flow_id");
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get(
    "type"
  ) as EmailOtpType | null;

  const requestedNext =
    requestUrl.searchParams.get("next") ?? "/account";

  const next =
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//")
      ? requestedNext
      : "/account";

  const supabase = await createClient();

  let authError = null;

  // Google OAuth / PKCE
  if (code) {
    const { error } =
  await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined
  );

    authError = error;
  }

  // Email confirmation
  else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    authError = error;
  }

  // No valid authentication parameters
  else {
    authError = new Error(
      "Missing authentication parameters."
    );
  }

  if (!authError) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const fullName =
        user.user_metadata?.fullName ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email ||
        "Tricea Customer";

      await prisma.profile.upsert({
        where: {
          id: user.id,
        },
        create: {
          id: user.id,
          fullName,
          role: "CUSTOMER",
        },
        update: {
          fullName,
        },
      });
    }

    return NextResponse.redirect(
      new URL(next, requestUrl.origin)
    );
  }

  console.error("Auth callback failed:", authError);

  return NextResponse.redirect(
    new URL(
      "/account/login?error=oauth",
      requestUrl.origin
    )
  );
}