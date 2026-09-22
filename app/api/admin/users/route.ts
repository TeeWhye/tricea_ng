import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
    select: {
      role: true,
    },
  });

  if (profile?.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function GET() {
  try {
    const currentAdmin = await requireAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const profiles = await prisma.profile.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const {
      data: { users: authUsers },
      error: authUsersError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (authUsersError) {
      throw authUsersError;
    }

    const users = profiles.map((profile) => {
      const authUser = authUsers.find(
        (user) => user.id === profile.id
      );

      return {
        ...profile,
        email: authUser?.email ?? null,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users GET error:", error);

    return NextResponse.json(
      { error: "Unable to load users." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentAdmin = await requireAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { userId, action } = body as {
      userId?: unknown;
      action?: unknown;
    };

    if (
      typeof userId !== "string" ||
      !userId ||
      userId.length > 100
    ) {
      return NextResponse.json(
        { error: "Invalid user ID." },
        { status: 400 }
      );
    }

    if (action !== "promote" && action !== "demote") {
      return NextResponse.json(
        { error: "Invalid action." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const targetUser = await tx.profile.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          role: true,
        },
      });

      if (!targetUser) {
        throw new Error("USER_NOT_FOUND");
      }

      if (action === "promote") {
        if (targetUser.role === "ADMIN") {
          throw new Error("ALREADY_ADMIN");
        }

        return tx.profile.update({
          where: {
            id: userId,
          },
          data: {
            role: "ADMIN",
          },
          select: {
            id: true,
            role: true,
          },
        });
      }

      if (targetUser.role !== "ADMIN") {
        throw new Error("NOT_ADMIN");
      }

      const adminCount = await tx.profile.count({
        where: {
          role: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        throw new Error("LAST_ADMIN");
      }

      return tx.profile.update({
        where: {
          id: userId,
        },
        data: {
          role: "CUSTOMER",
        },
        select: {
          id: true,
          role: true,
        },
      });
    });

    return NextResponse.json({
      message:
        action === "promote"
          ? "User promoted to admin."
          : "Admin access removed.",
      user: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return NextResponse.json(
          { error: "User not found." },
          { status: 404 }
        );
      }

      if (error.message === "ALREADY_ADMIN") {
        return NextResponse.json(
          { error: "User is already an admin." },
          { status: 409 }
        );
      }

      if (error.message === "NOT_ADMIN") {
        return NextResponse.json(
          { error: "User is not an admin." },
          { status: 409 }
        );
      }

      if (error.message === "LAST_ADMIN") {
        return NextResponse.json(
          {
            error:
              "The last remaining admin cannot be removed.",
          },
          { status: 409 }
        );
      }
    }

    console.error("Admin users PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to update user access." },
      { status: 500 }
    );
  }
}