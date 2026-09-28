import { NextResponse } from "next/server";

import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const tokenHash =
    requestUrl.searchParams.get("token_hash");

  const type =
    requestUrl.searchParams.get("type") as EmailOtpType | null;

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL(
        "/account/login?error=confirmation",
        requestUrl.origin
      )
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    console.error(
      "Email confirmation failed:",
      error
    );

    return NextResponse.redirect(
      new URL(
        "/account/login?error=confirmation",
        requestUrl.origin
      )
    );
  }

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
    new URL("/account", requestUrl.origin)
  );
}