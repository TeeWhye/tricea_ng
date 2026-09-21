import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type CreateVariantRequest = {
  stock?: number;
  sku?: string;
  size?: string;
  colour?: string;
  price?: number | null;
};

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id: productId } = await params;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: {
        id: user.id,
      },
      select: {
        role: true,
      },
    });

    if (!profile || profile.role !== "ADMIN") {
      return Response.json(
        {
          success: false,
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }

    let body: CreateVariantRequest;

try {
  body = (await request.json()) as CreateVariantRequest;
} catch {
  return Response.json(
    {
      success: false,
      message: "Invalid request body.",
    },
    { status: 400 }
  );
}

    const size =
      typeof body.size === "string"
        ? body.size.trim()
        : "";

    const colour =
      typeof body.colour === "string"
        ? body.colour.trim()
        : "";

    const sku =
      typeof body.sku === "string"
        ? body.sku.trim()
        : "";

    const stock = body.stock ?? 0;

    const price =
      body.price === undefined ||
      body.price === null
        ? null
        : body.price;

    if (!size || !colour || !sku) {
      return Response.json(
        {
          success: false,
          message:
            "Size, colour, and SKU are required.",
        },
        { status: 400 }
      );
    }

    if (
  size.length > 50 ||
  colour.length > 50 ||
  sku.length > 100
) {
  return Response.json(
    {
      success: false,
      message:
        "Size and colour must be 50 characters or fewer, and SKU must be 100 characters or fewer.",
    },
    { status: 400 }
  );
}

    if (
  typeof stock !== "number" ||
  !Number.isInteger(stock) ||
  stock < 0
) {
      return Response.json(
        {
          success: false,
          message:
            "Stock must be a whole number greater than or equal to zero.",
        },
        { status: 400 }
      );
    }

    if (
  price !== null &&
  (typeof price !== "number" ||
    !Number.isInteger(price) ||
    price < 0)
) {
      return Response.json(
        {
          success: false,
          message:
            "Variant price must be a valid amount.",
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    const existingVariant =
      await prisma.productVariant.findFirst({
        where: {
          OR: [
            {
              sku,
            },
            {
              productId,
              size,
              colour,
            },
          ],
        },
        select: {
          id: true,
        },
      });

    if (existingVariant) {
      return Response.json(
        {
          success: false,
          message:
            "That SKU or size/colour combination already exists.",
        },
        { status: 409 }
      );
    }

    const variant =
      await prisma.productVariant.create({
        data: {
          productId,
          size,
          colour,
          sku,
          stock,
          price,
        },
      });

    return Response.json(
      {
        success: true,
        message:
          "Product variant created successfully.",
        variant: {
          id: variant.id,
          productId: variant.productId,
          size: variant.size,
          colour: variant.colour,
          sku: variant.sku,
          stock: variant.stock,
          price: variant.price,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin variant creation failed:",
      error
    );

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return Response.json(
        {
          success: false,
          message:
            "That SKU or size/colour combination already exists.",
        },
        { status: 409 }
      );
    }

    return Response.json(
  {
    success: false,
    message: "Unable to create variant.",
  },
  { status: 500 }
);
  }
}