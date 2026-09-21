import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "You must be signed in." },
      { status: 401 }
    );
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: user.id,
    },
    select: {
      fullName: true,
      phone: true,
    },
  });

  if (!profile) {
    return NextResponse.json(
      { message: "Profile not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    profile,
    email: user.email ?? "",
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "You must be signed in." },
      { status: 401 }
    );
  }

  let body: {
    fullName?: unknown;
    phone?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const fullName =
    typeof body.fullName === "string"
      ? body.fullName.trim()
      : "";

  const phone =
    typeof body.phone === "string"
      ? body.phone.trim()
      : "";

  if (!fullName) {
    return NextResponse.json(
      { message: "Full name is required." },
      { status: 400 }
    );
  }

  if (fullName.length > 100) {
  return NextResponse.json(
    { message: "Full name is too long." },
    { status: 400 }
  );
}

if (phone.length > 30) {
  return NextResponse.json(
    { message: "Phone number is too long." },
    { status: 400 }
  );
}

  const profile = await prisma.profile.update({
    where: {
      id: user.id,
    },
    data: {
      fullName,
      phone: phone || null,
    },
    select: {
      fullName: true,
      phone: true,
    },
  });

  return NextResponse.json({
    message: "Account details updated successfully.",
    profile,
  });
}