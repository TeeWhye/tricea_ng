import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function createSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

    const existingCategory =
      await prisma.category.findFirst({
        where: {
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

    if (existingCategory) {
      return Response.json(
        {
          success: false,
          message:
            "A category with this name already exists.",
        },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Category created successfully.",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin category creation failed:",
      error
    );

    return Response.json(
  {
    success: false,
    message: "Unable to create category.",
  },
  { status: 500 }
);
  }
}