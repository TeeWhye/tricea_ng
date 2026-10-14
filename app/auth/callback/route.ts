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

  // Only allow internal redirect destinations.
  const next =
    requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//")
      ? requestedNext
      : "/account";

  const supabase = await createClient();

  let authError: Error | null = null;

  // Google OAuth / PKCE
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(
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
    authError = new Error("Missing authentication parameters.");
  }

  if (authError) {
    console.error("Auth callback failed:", authError);

    return NextResponse.redirect(
      new URL("/account/login?error=oauth", requestUrl.origin)
    );
  }

  // Retrieve the authenticated user from Supabase.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(
      new URL("/account/login?error=oauth", requestUrl.origin)
    );
  }

  const fullName =
    user.user_metadata?.fullName ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Tricea Customer";

  try {
    // Create or update the customer's profile.
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

    /*
     * Link previous guest purchases only when Supabase confirms
     * that the authenticated user's email has been verified.
     */
      } catch (error) {
    console.error("Auth callback profile creation failed:", error);

    return NextResponse.redirect(
      new URL("/account/login?error=profile", requestUrl.origin)
    );
  }

  // Link previous guest purchases only when Supabase confirms
  // that the authenticated user's email has been verified.
  const verifiedEmail =
    user.email_confirmed_at && user.email
      ? user.email.trim()
      : null;

  if (verifiedEmail) {
    try {
      await prisma.$transaction([
        // Link eligible guest orders.
        prisma.order.updateMany({
          where: {
            profileId: null,
            email: {
              equals: verifiedEmail,
              mode: "insensitive",
            },
          },
          data: {
            profileId: user.id,
          },
        }),

        // Link eligible guest custom requests.
        prisma.customOrderRequest.updateMany({
          where: {
            profileId: null,
            email: {
              equals: verifiedEmail,
              mode: "insensitive",
            },
          },
          data: {
            profileId: user.id,
          },
        }),
      ]);
    } catch (error) {
      // Linking failure should not undo successful authentication.
      console.error("Auth callback guest-record linking failed:", error);
    }
  }

  return NextResponse.redirect(
    new URL(next, requestUrl.origin)
  );
}