import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function GET() {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { message: "You must be signed in." },
      { status: 401 }
    );
  }

  const addresses = await prisma.address.findMany({
    where: {
      profileId: user.id,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  return NextResponse.json({
    addresses,
  });
}

export async function POST(request: Request) {
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
    label?: unknown;
    address?: unknown;
    city?: unknown;
    state?: unknown;
    phone?: unknown;
    isDefault?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const label =
    typeof body.label === "string"
      ? body.label.trim()
      : "";

  const address =
    typeof body.address === "string"
      ? body.address.trim()
      : "";

  const city =
    typeof body.city === "string"
      ? body.city.trim()
      : "";

  const state =
    typeof body.state === "string"
      ? body.state.trim()
      : "";

  const phone =
    typeof body.phone === "string"
      ? body.phone.trim()
      : "";

  const isDefault =
    body.isDefault === true;

  if (!address || !city || !state) {
    return NextResponse.json(
      {
        message:
          "Address, city, and state are required.",
      },
      { status: 400 }
    );
  }

  if (label.length > 50) {
  return NextResponse.json(
    { message: "Address label is too long." },
    { status: 400 }
  );
}

if (address.length > 250) {
  return NextResponse.json(
    { message: "Address is too long." },
    { status: 400 }
  );
}

if (city.length > 100) {
  return NextResponse.json(
    { message: "City name is too long." },
    { status: 400 }
  );
}

if (state.length > 100) {
  return NextResponse.json(
    { message: "State name is too long." },
    { status: 400 }
  );
}

if (phone.length > 30) {
  return NextResponse.json(
    { message: "Phone number is too long." },
    { status: 400 }
  );
}

  const createdAddress = await prisma.$transaction(
    async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: {
            profileId: user.id,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      return tx.address.create({
        data: {
          profileId: user.id,
          label: label || null,
          address,
          city,
          state,
          phone: phone || null,
          isDefault,
        },
      });
    }
  );

  return NextResponse.json(
    {
      message: "Address saved successfully.",
      address: createdAddress,
    },
    { status: 201 }
  );
}