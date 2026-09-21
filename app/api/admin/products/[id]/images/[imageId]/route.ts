import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      imageId: string;
    }>;
  }
) {
  try {
    const { id, imageId } = await params;

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

    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId: id,
      },
      select: {
        id: true,
      },
    });

    if (!image) {
      return Response.json(
        {
          success: false,
          message: "Product image not found.",
        },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.productImage.updateMany({
        where: {
          productId: id,
        },
        data: {
          isPrimary: false,
        },
      }),

      prisma.productImage.update({
        where: {
          id: imageId,
        },
        data: {
          isPrimary: true,
        },
      }),
    ]);

    return Response.json({
      success: true,
      message: "Primary product image updated successfully.",
    });
  } catch (error) {
    console.error(
      "Admin primary image update failed:",
      error
    );

    return Response.json(
  {
    success: false,
    message: "Unable to update primary image.",
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
      imageId: string;
    }>;
  }
) {
  try {
    const { id, imageId } = await params;

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

    const image = await prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId: id,
      },
      select: {
        id: true,
        url: true,
        isPrimary: true,
      },
    });

    if (!image) {
      return Response.json(
        {
          success: false,
          message: "Product image not found.",
        },
        { status: 404 }
      );
    }

    if (image.isPrimary) {
      return Response.json(
        {
          success: false,
          message:
            "The primary image cannot be deleted. Set another image as primary first.",
        },
        { status: 409 }
      );
    }

    const storagePathMarker =
      "/storage/v1/object/public/product-images/";

    const markerIndex =
      image.url.indexOf(storagePathMarker);

    if (markerIndex === -1) {
      return Response.json(
        {
          success: false,
          message:
            "Unable to determine the image storage path.",
        },
        { status: 400 }
      );
    }

    const filePath = decodeURIComponent(
      image.url.slice(
        markerIndex + storagePathMarker.length
      )
    );

    const expectedPrefix = `products/${id}/`;

if (!filePath.startsWith(expectedPrefix)) {
  return Response.json(
    {
      success: false,
      message: "Invalid image storage path.",
    },
    { status: 400 }
  );
}

    const { error: storageError } =
      await supabaseAdmin.storage
        .from("product-images")
        .remove([filePath]);

    if (storageError) {
      console.error(
        "Supabase image deletion failed:",
        storageError
      );

      return Response.json(
        {
          success: false,
          message:
            "Unable to delete image from storage.",
        },
        { status: 500 }
      );
    }

    try {
  await prisma.productImage.delete({
    where: {
      id: imageId,
    },
  });
} catch (error) {
  console.error(
    "Product image database deletion failed after storage deletion:",
    error
  );

  return Response.json(
    {
      success: false,
      message:
        "The image file was removed, but its database record could not be deleted. Please review the image record.",
    },
    { status: 500 }
  );
}

    return Response.json({
      success: true,
      message: "Product image deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin product image deletion failed:",
      error
    );

    return Response.json(
  {
    success: false,
    message: "Unable to delete product image.",
  },
  { status: 500 }
);
  }
}

