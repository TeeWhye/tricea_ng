import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type BulkVariantRequest = {
  colour?: string;
  sizes?: string[];
  stock?: number;
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

    let body: BulkVariantRequest;

try {
  body = (await request.json()) as BulkVariantRequest;
} catch {
  return Response.json(
    {
      success: false,
      message: "Invalid request body.",
    },
    { status: 400 }
  );
}

    const colour =
      typeof body.colour === "string"
        ? body.colour.trim()
        : "";

    const sizes = Array.isArray(body.sizes)
      ? body.sizes
          .filter(
            (size): size is string =>
              typeof size === "string"
          )
          .map((size) => size.trim())
          .filter(Boolean)
      : [];

    const stock = body.stock ?? 0;

    const price =
      body.price === undefined ||
      body.price === null
        ? null
        : body.price;

    if (!colour) {
      return Response.json(
        {
          success: false,
          message: "Colour is required.",
        },
        { status: 400 }
      );
    }

    if (colour.length > 50) {
  return Response.json(
    {
      success: false,
      message: "Colour must be 50 characters or fewer.",
    },
    { status: 400 }
  );
}

    if (sizes.length === 0) {
      return Response.json(
        {
          success: false,
          message: "At least one size is required.",
        },
        { status: 400 }
      );
    }

    if (sizes.some((size) => size.length > 50)) {
  return Response.json(
    {
      success: false,
      message: "Each size must be 50 characters or fewer.",
    },
    { status: 400 }
  );
}

    const uniqueSizes = [...new Set(sizes)];

    if (uniqueSizes.length !== sizes.length) {
      return Response.json(
        {
          success: false,
          message: "Duplicate sizes are not allowed.",
        },
        { status: 400 }
      );
    }

    if (uniqueSizes.length > 50) {
  return Response.json(
    {
      success: false,
      message: "You can create a maximum of 50 variants at once.",
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
        sku: true,
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

    const existingVariants =
      await prisma.productVariant.findMany({
        where: {
          productId,
          colour,
          size: {
            in: uniqueSizes,
          },
        },
        select: {
          size: true,
          sku: true,
        },
      });

    if (existingVariants.length > 0) {
      return Response.json(
        {
          success: false,
          message: `Some ${colour} size variants already exist.`,
          existingSizes: existingVariants.map(
            (variant) => variant.size
          ),
        },
        { status: 409 }
      );
    }

    const variants = uniqueSizes.map((size) => ({
  productId,
  size,
  colour,
  sku: `${product.sku}-${size}-${colour
    .replace(/\s+/g, "-")
    .toUpperCase()}`,
  stock,
  price,
}));

if (variants.some((variant) => variant.sku.length > 100)) {
  return Response.json(
    {
      success: false,
      message:
        "One or more generated SKUs are too long. Please shorten the product SKU, size, or colour.",
    },
    { status: 400 }
  );
}

    const createdVariants =
      await prisma.$transaction(
        variants.map((variant) =>
          prisma.productVariant.create({
            data: variant,
          })
        )
      );

    return Response.json(
      {
        success: true,
        message: `${createdVariants.length} variants created successfully.`,
        variants: createdVariants.map(
          (variant) => ({
            id: variant.id,
            productId: variant.productId,
            size: variant.size,
            colour: variant.colour,
            sku: variant.sku,
            stock: variant.stock,
            price: variant.price,
          })
        ),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin bulk variant creation failed:",
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
            "One or more generated SKUs or size/colour combinations already exist.",
        },
        { status: 409 }
      );
    }

    return Response.json(
  {
    success: false,
    message: "Unable to create product variants.",
  },
  { status: 500 }
);
  }
}