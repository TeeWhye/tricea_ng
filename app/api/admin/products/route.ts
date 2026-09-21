import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type CreateProductRequest = {
  name: string;
  categoryId: string;
  sku: string;
  price: number;
  description?: string | null;
  isActive?: boolean;
};


export async function POST(request: Request) {
  try {
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

    let body: CreateProductRequest;

try {
  body = (await request.json()) as CreateProductRequest;
} catch {
  return Response.json(
    {
      success: false,
      message: "Invalid request body.",
    },
    { status: 400 }
  );
}

    const name = body.name?.trim();
    const categoryId = body.categoryId?.trim();
    const sku = body.sku?.trim();
    const price = body.price;

    if (!name) {
      return Response.json(
        {
          success: false,
          message: "Product name is required.",
        },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return Response.json(
        {
          success: false,
          message: "Product category is required.",
        },
        { status: 400 }
      );
    }

    if (!sku) {
      return Response.json(
        {
          success: false,
          message: "Product SKU is required.",
        },
        { status: 400 }
      );
    }

    if (name.length > 150) {
  return Response.json(
    {
      success: false,
      message: "Product name is too long.",
    },
    { status: 400 }
  );
}

if (sku.length > 100) {
  return Response.json(
    {
      success: false,
      message: "Product SKU is too long.",
    },
    { status: 400 }
  );
}

if (categoryId.length > 100) {
  return Response.json(
    {
      success: false,
      message: "Invalid product category.",
    },
    { status: 400 }
  );
}

    if (
      !Number.isInteger(price) ||
      price < 0
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

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
        name: true,
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

    const slugBase = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slugBase) {
      return Response.json(
        {
          success: false,
          message:
            "Product name must contain valid characters.",
        },
        { status: 400 }
      );
    }

    let slug = slugBase;

    const existingSlug = await prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingSlug) {
      slug = `${slugBase}-${crypto
        .randomUUID()
        .replace(/-/g, "")
        .slice(0, 6)}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        sku,
        price,
        description: body.description?.trim() || null,
        isActive: body.isActive ?? true,
      },
      include: {
        category: true,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Product created successfully.",
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: product.category.name,
          sku: product.sku,
          price: product.price,
          description: product.description,
          isActive: product.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin product creation failed:",
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
    message: "Unable to create product.",
  },
  { status: 500 }
);
  }
}