import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function createSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function PATCH(
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

    let body: { name?: unknown };

try {
  body = await request.json();
} catch {
  return Response.json(
    {
      success: false,
      message: "Invalid request body.",
    },
    { status: 400 }
  );
}

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return Response.json(
        {
          success: false,
          message: "Category name is required.",
        },
        { status: 400 }
      );
    }

    if (name.length > 100) {
  return Response.json(
    {
      success: false,
      message: "Category name must be 100 characters or fewer.",
    },
    { status: 400 }
  );
}

    const slug = createSlug(name);

    if (!slug) {
      return Response.json(
        {
          success: false,
          message: "Category name is invalid.",
        },
        { status: 400 }
      );
    }

    const category =
      await prisma.category.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    const duplicate =
      await prisma.category.findFirst({
        where: {
          id: {
            not: id,
          },
          OR: [
            {
              name: {
                equals: name,
                mode: "insensitive",
              },
            },
            {
              slug,
            },
          ],
        },
        select: {
          id: true,
        },
      });

    if (duplicate) {
      return Response.json(
        {
          success: false,
          message:
            "A category with this name already exists.",
        },
        { status: 409 }
      );
    }

    const updatedCategory =
      await prisma.category.update({
        where: {
          id,
        },
        data: {
          name,
          slug,
        },
      });

    return Response.json({
      success: true,
      message: "Category updated successfully.",
      category: updatedCategory,
    });
  } catch (error) {
    console.error(
      "Admin category update failed:",
      error
    );

    return Response.json(
  {
    success: false,
    message: "Unable to update category.",
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
    }>;
  }
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

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    if (category._count.products > 0) {
      return Response.json(
        {
          success: false,
          message: `This category cannot be deleted because it contains ${category._count.products} ${
            category._count.products === 1
              ? "product"
              : "products"
          }. Move those products to another category first.`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return Response.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin category deletion failed:",
      error
    );

    return Response.json(
  {
    success: false,
    message: "Unable to delete category.",
  },
  { status: 500 }
);
  }
}