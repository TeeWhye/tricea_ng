import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type CreateTestimonialRequest = {
  customerName: string;
  content: string;
  rating?: number | null;
  productName?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
};

type UpdateTestimonialRequest = {
  id?: string;
  customerName?: string;
  content?: string;
  rating?: number | null;
  productName?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isJsonObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

async function isAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return false;
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  return profile?.role === "ADMIN";
}

function validateRating(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "number" &&
      Number.isInteger(value) &&
      value >= 1 &&
      value <= 5)
  );
}

function validateSortOrder(value: unknown): boolean {
  return (
    value === undefined ||
    (typeof value === "number" &&
      Number.isInteger(value) &&
      value >= 0 &&
      value <= 100000)
  );
}

function validateProductName(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length <= 150)
  );
}

function validateCustomerName(value: unknown): boolean {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= 150
  );
}

function validateContent(value: unknown): boolean {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= 1000
  );
}

function validateBoolean(value: unknown): boolean {
  return typeof value === "boolean";
}

export async function POST(request: Request) {
  try {
    if (!(await isAdmin())) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      return Response.json(
        {
          success: false,
          message: user ? "Forbidden." : "Unauthorized.",
        },
        { status: user ? 403 : 401 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!isJsonObject(body)) {
      return Response.json(
        { success: false, message: "Request body must be an object." },
        { status: 400 }
      );
    }

    const input = body as unknown as CreateTestimonialRequest;

    if (!validateCustomerName(input.customerName)) {
      return Response.json(
        {
          success: false,
          message:
            "Customer name is required and must not exceed 150 characters.",
        },
        { status: 400 }
      );
    }

    if (!validateContent(input.content)) {
      return Response.json(
        {
          success: false,
          message:
            "Testimonial content is required and must not exceed 1000 characters.",
        },
        { status: 400 }
      );
    }

    if (!validateRating(input.rating)) {
      return Response.json(
        {
          success: false,
          message: "Rating must be a whole number between 1 and 5.",
        },
        { status: 400 }
      );
    }

    if (!validateProductName(input.productName)) {
      return Response.json(
        { success: false, message: "Invalid product name." },
        { status: 400 }
      );
    }

    if (
      input.isPublished !== undefined &&
      !validateBoolean(input.isPublished)
    ) {
      return Response.json(
        { success: false, message: "Invalid publication status." },
        { status: 400 }
      );
    }

    if (
      input.isFeatured !== undefined &&
      !validateBoolean(input.isFeatured)
    ) {
      return Response.json(
        { success: false, message: "Invalid featured status." },
        { status: 400 }
      );
    }

    if (!validateSortOrder(input.sortOrder)) {
      return Response.json(
        { success: false, message: "Invalid display order." },
        { status: 400 }
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        customerName: input.customerName.trim(),
        content: input.content.trim(),
        rating: input.rating ?? null,
        productName: input.productName?.trim() || null,
        isPublished: input.isPublished ?? false,
        isFeatured: input.isFeatured ?? false,
        sortOrder: input.sortOrder ?? 0,
      },
      select: {
        id: true,
        customerName: true,
        content: true,
        rating: true,
        productName: true,
        isPublished: true,
        isFeatured: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json(
      {
        success: true,
        message: "Testimonial created successfully.",
        testimonial,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin testimonial creation failed:", error);

    return Response.json(
      { success: false, message: "Unable to create testimonial." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAdmin())) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      return Response.json(
        {
          success: false,
          message: user ? "Forbidden." : "Unauthorized.",
        },
        { status: user ? 403 : 401 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!isJsonObject(body)) {
      return Response.json(
        { success: false, message: "Request body must be an object." },
        { status: 400 }
      );
    }

    const input = body as unknown as UpdateTestimonialRequest;

    if (
      typeof input.id !== "string" ||
      !UUID_REGEX.test(input.id.trim())
    ) {
      return Response.json(
        { success: false, message: "A valid testimonial ID is required." },
        { status: 400 }
      );
    }

    const data: {
      customerName?: string;
      content?: string;
      rating?: number | null;
      productName?: string | null;
      isPublished?: boolean;
      isFeatured?: boolean;
      sortOrder?: number;
    } = {};

    if (input.customerName !== undefined) {
      if (!validateCustomerName(input.customerName)) {
        return Response.json(
          { success: false, message: "Invalid customer name." },
          { status: 400 }
        );
      }

      data.customerName = input.customerName.trim();
    }

    if (input.content !== undefined) {
      if (!validateContent(input.content)) {
        return Response.json(
          { success: false, message: "Invalid testimonial content." },
          { status: 400 }
        );
      }

      data.content = input.content.trim();
    }

    if (input.rating !== undefined) {
      if (!validateRating(input.rating)) {
        return Response.json(
          {
            success: false,
            message: "Rating must be a whole number between 1 and 5.",
          },
          { status: 400 }
        );
      }

      data.rating = input.rating;
    }

    if (input.productName !== undefined) {
      if (!validateProductName(input.productName)) {
        return Response.json(
          { success: false, message: "Invalid product name." },
          { status: 400 }
        );
      }

      data.productName = input.productName?.trim() || null;
    }

    if (input.isPublished !== undefined) {
      if (!validateBoolean(input.isPublished)) {
        return Response.json(
          { success: false, message: "Invalid publication status." },
          { status: 400 }
        );
      }

      data.isPublished = input.isPublished;
    }

    if (input.isFeatured !== undefined) {
      if (!validateBoolean(input.isFeatured)) {
        return Response.json(
          { success: false, message: "Invalid featured status." },
          { status: 400 }
        );
      }

      data.isFeatured = input.isFeatured;
    }

    if (input.sortOrder !== undefined) {
      if (!validateSortOrder(input.sortOrder)) {
        return Response.json(
          { success: false, message: "Invalid display order." },
          { status: 400 }
        );
      }

      data.sortOrder = input.sortOrder;
    }

    if (Object.keys(data).length === 0) {
      return Response.json(
        { success: false, message: "No changes were provided." },
        { status: 400 }
      );
    }

    const existing = await prisma.testimonial.findUnique({
      where: { id: input.id },
      select: { id: true },
    });

    if (!existing) {
      return Response.json(
        { success: false, message: "Testimonial not found." },
        { status: 404 }
      );
    }

    const testimonial = await prisma.testimonial.update({
      where: { id: input.id },
      data,
      select: {
        id: true,
        customerName: true,
        content: true,
        rating: true,
        productName: true,
        isPublished: true,
        isFeatured: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return Response.json({
      success: true,
      message: "Testimonial updated successfully.",
      testimonial,
    });
  } catch (error) {
    console.error("Admin testimonial update failed:", error);

    return Response.json(
      { success: false, message: "Unable to update testimonial." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await isAdmin())) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      return Response.json(
        {
          success: false,
          message: user ? "Forbidden." : "Unauthorized.",
        },
        { status: user ? 403 : 401 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!isJsonObject(body)) {
      return Response.json(
        { success: false, message: "Request body must be an object." },
        { status: 400 }
      );
    }

    if (
      typeof body.id !== "string" ||
      !UUID_REGEX.test(body.id.trim())
    ) {
      return Response.json(
        { success: false, message: "A valid testimonial ID is required." },
        { status: 400 }
      );
    }

    const id = body.id.trim();

    const existing = await prisma.testimonial.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return Response.json(
        { success: false, message: "Testimonial not found." },
        { status: 404 }
      );
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    return Response.json({
      success: true,
      message: "Testimonial deleted successfully.",
    });
  } catch (error) {
    console.error("Admin testimonial deletion failed:", error);

    return Response.json(
      { success: false, message: "Unable to delete testimonial." },
      { status: 500 }
    );
  }
}