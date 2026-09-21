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

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      productId: true,
    },
  });

  return NextResponse.json({
    productIds: wishlistItems.map(
      (item) => item.productId
    ),
  });
}

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { message: "You must be signed in." },
      { status: 401 }
    );
  }

  let body: {
    productId?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  const productId =
  typeof body.productId === "string"
    ? body.productId.trim()
    : "";

if (
  !productId ||
  !/^[0-9a-fA-F-]{36}$/.test(productId)
) {
  return NextResponse.json(
    { message: "A valid product ID is required." },
    { status: 400 }
  );
}

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!product) {
    return NextResponse.json(
      { message: "Product not found." },
      { status: 404 }
    );
  }

  const existingItem =
    await prisma.wishlistItem.findUnique({
      where: {
        profileId_productId: {
          profileId: user.id,
          productId,
        },
      },
    });

  if (existingItem) {
    await prisma.wishlistItem.delete({
      where: {
        id: existingItem.id,
      },
    });

    return NextResponse.json({
      wishlisted: false,
      message: "Removed from wishlist.",
    });
  }

  await prisma.wishlistItem.create({
    data: {
      profileId: user.id,
      productId,
    },
  });

  return NextResponse.json({
    wishlisted: true,
    message: "Added to wishlist.",
  });
}