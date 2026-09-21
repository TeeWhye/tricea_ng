import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type UpdateVariantRequest = {
  stock?: number;
  sku?: string;
  size?: string;
  colour?: string;
  price?: number | null;
};

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      variantId: string;
    }>;
  }
) {
  try {
    const { id, variantId } = await params;

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

    let body: UpdateVariantRequest;

try {
  body = (await request.json()) as UpdateVariantRequest;
} catch {
  return Response.json(
    {
      success: false,
      message: "Invalid request body.",
    },
    { status: 400 }
  );
}

    const hasUpdate =
      body.stock !== undefined ||
      body.sku !== undefined ||
      body.size !== undefined ||
      body.colour !== undefined ||
      body.price !== undefined;

    if (!hasUpdate) {
      return Response.json(
        {
          success: false,
          message: "No update was provided.",
        },
        { status: 400 }
      );
    }

    if (
  body.stock !== undefined &&
  (typeof body.stock !== "number" ||
    !Number.isInteger(body.stock) ||
    body.stock < 0)
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
  body.price !== undefined &&
  body.price !== null &&
  (typeof body.price !== "number" ||
    !Number.isInteger(body.price) ||
    body.price < 0)
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

    if (
      body.sku !== undefined &&
      !body.sku.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "Variant SKU is required.",
        },
        { status: 400 }
      );
    }

    if (
      body.size !== undefined &&
      !body.size.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "Variant size is required.",
        },
        { status: 400 }
      );
    }

    if (
      body.colour !== undefined &&
      !body.colour.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "Variant colour is required.",
        },
        { status: 400 }
      );
    }

    if (
  (body.sku !== undefined && body.sku.trim().length > 100) ||
  (body.size !== undefined && body.size.trim().length > 50) ||
  (body.colour !== undefined && body.colour.trim().length > 50)
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


    const variant =
      await prisma.productVariant.findFirst({
        where: {
          id: variantId,
          productId: id,
        },
        select: {
          id: true,
        },
      });

    if (!variant) {
      return Response.json(
        {
          success: false,
          message: "Product variant not found.",
        },
        { status: 404 }
      );
    }

    const updatedVariant =
      await prisma.productVariant.update({
        where: {
          id: variantId,
        },
        data: {
          ...(body.stock !== undefined
            ? {
                stock: body.stock,
              }
            : {}),

          ...(body.sku !== undefined
            ? {
                sku: body.sku.trim(),
              }
            : {}),

          ...(body.size !== undefined
            ? {
                size: body.size.trim(),
              }
            : {}),

          ...(body.colour !== undefined
            ? {
                colour: body.colour.trim(),
              }
            : {}),

          ...(body.price !== undefined
            ? {
                price: body.price,
              }
            : {}),
        },
      });

    return Response.json({
      success: true,
      message:
        "Product variant updated successfully.",
      variant: {
        id: updatedVariant.id,
        productId: updatedVariant.productId,
        size: updatedVariant.size,
        colour: updatedVariant.colour,
        sku: updatedVariant.sku,
        stock: updatedVariant.stock,
        price: updatedVariant.price,
      },
    });
  } catch (error) {
    console.error(
      "Admin variant update failed:",
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
    message: "Unable to update product variant.",
  },
  { status: 500 }
);
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      variantId: string;
    }>;
  }
) {
  try {
    const { id, variantId } = await params;

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

    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        productId: id,
      },
      select: {
        id: true,
        size: true,
        colour: true,
        orderItems: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
    });

    if (!variant) {
      return Response.json(
        {
          success: false,
          message: "Product variant not found.",
        },
        { status: 404 }
      );
    }

    if (variant.orderItems.length > 0) {
      return Response.json(
        {
          success: false,
          message:
            "This variant cannot be deleted because it has been used in an order.",
        },
        { status: 409 }
      );
    }

    await prisma.productVariant.delete({
      where: {
        id: variantId,
      },
    });

    return Response.json({
      success: true,
      message: "Product variant deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin variant deletion failed:",
      error
    );

    return Response.json(
  {
    success: false,
    message: "Unable to delete product variant.",
  },
  { status: 500 }
);
  }
}