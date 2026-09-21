import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type UpdateProductRequest = {
  name?: string;
  categoryId?: string;
  sku?: string;
  price?: number;
  description?: string | null;
  isActive?: boolean;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    let body: UpdateProductRequest;

try {
  body = (await request.json()) as UpdateProductRequest;
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
      body.name !== undefined ||
      body.categoryId !== undefined ||
      body.sku !== undefined ||
      body.price !== undefined ||
      body.description !== undefined ||
      body.isActive !== undefined;

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
      body.name !== undefined &&
      !body.name.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "Product name is required.",
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
          message: "Product SKU is required.",
        },
        { status: 400 }
      );
    }

    if (
      body.price !== undefined &&
      (!Number.isInteger(body.price) ||
        body.price < 0)
    ) {
      return Response.json(
        {
          success: false,
          message: "Product price must be a valid amount.",
        },
        { status: 400 }
      );
    }

    if (
      body.categoryId !== undefined &&
      !body.categoryId.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "Product category is required.",
        },
        { status: 400 }
      );
    }

    if (
  body.name !== undefined &&
  body.name.trim().length > 150
) {
  return Response.json(
    {
      success: false,
      message: "Product name is too long.",
    },
    { status: 400 }
  );
}

if (
  body.sku !== undefined &&
  body.sku.trim().length > 100
) {
  return Response.json(
    {
      success: false,
      message: "Product SKU is too long.",
    },
    { status: 400 }
  );
}

if (
  body.categoryId !== undefined &&
  body.categoryId.trim().length > 100
) {
  return Response.json(
    {
      success: false,
      message: "Invalid product category.",
    },
    { status: 400 }
  );
}

if (
  typeof body.description === "string" &&
  body.description.length > 5000
) {
  return Response.json(
    {
      success: false,
      message: "Product description is too long.",
    },
    { status: 400 }
  );
}

if (
  body.isActive !== undefined &&
  typeof body.isActive !== "boolean"
) {
  return Response.json(
    {
      success: false,
      message: "Invalid product status.",
    },
    { status: 400 }
  );
}

    const product = await prisma.product.findUnique({
      where: {
        id,
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

    if (body.categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: {
          id: body.categoryId,
        },
        select: {
          id: true,
        },
      });

      if (!category) {
        return Response.json(
          {
            success: false,
            message: "Selected category does not exist.",
          },
          { status: 400 }
        );
      }
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id,
      },
      data: {
        ...(body.name !== undefined
          ? {
              name: body.name.trim(),
            }
          : {}),

        ...(body.categoryId !== undefined
          ? {
              categoryId: body.categoryId.trim(),
            }
          : {}),

        ...(body.sku !== undefined
          ? {
              sku: body.sku.trim(),
            }
          : {}),

        ...(body.price !== undefined
          ? {
              price: body.price,
            }
          : {}),

        ...(body.description !== undefined
          ? {
              description:
                body.description?.trim() || null,
            }
          : {}),

        ...(body.isActive !== undefined
          ? {
              isActive: body.isActive,
            }
          : {}),
      },
      include: {
        category: true,
      },
    });

    return Response.json({
      success: true,
      message: "Product updated successfully.",
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        category: updatedProduct.category.name,
        sku: updatedProduct.sku,
        price: updatedProduct.price,
        description: updatedProduct.description,
        isActive: updatedProduct.isActive,
      },
    });
  } catch (error) {
    console.error(
      "Admin product update failed:",
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
            "That SKU is already being used by another product.",
        },
        { status: 409 }
      );
    }

    return Response.json(
  {
    success: false,
    message: "Unable to update product.",
  },
  { status: 500 }
);
  }
}