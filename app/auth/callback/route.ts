import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const requestedNext =
  requestUrl.searchParams.get("next") ?? "/account";

const next =
  requestedNext.startsWith("/") &&
  !requestedNext.startsWith("//")
    ? requestedNext
    : "/account";

  if (code) {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
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
  }

  return NextResponse.redirect(
    new URL(
      "/account/login?error=oauth",
      requestUrl.origin
    )
  );
}