import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        {
          success: false,
          message: "Please provide an image file.",
        },
        { status: 400 }
      );
    }

    const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

if (!allowedImageTypes.includes(file.type)) {
  return Response.json(
    {
      success: false,
      message: "Only JPEG, PNG, and WebP images are allowed.",
    },
    { status: 400 }
  );
}

if (file.size === 0) {
  return Response.json(
    {
      success: false,
      message: "The uploaded image is empty.",
    },
    { status: 400 }
  );
}

    const maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return Response.json(
        {
          success: false,
          message: "Image must be 5MB or smaller.",
        },
        { status: 400 }
      );
    }

    const extensionMap: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const extension = extensionMap[file.type];

    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = `products/${id}/${fileName}`;

    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from("product-images")
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Supabase image upload failed:",
        uploadError
      );

      return Response.json(
        {
          success: false,
          message: "Unable to upload image.",
        },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const imageCount = await prisma.productImage.count({
      where: {
        productId: id,
      },
    });

    let image;

try {
  image = await prisma.productImage.create({
    data: {
      productId: id,
      url: publicUrl,
      altText: product.id,
      sortOrder: imageCount,
      isPrimary: imageCount === 0,
    },
  });
} catch (error) {
  console.error(
    "Product image database record creation failed:",
    error
  );

  const { error: cleanupError } =
    await supabaseAdmin.storage
      .from("product-images")
      .remove([filePath]);

  if (cleanupError) {
    console.error(
      "Failed to clean up uploaded product image:",
      cleanupError
    );
  }

  throw error;
}

    return Response.json({
      success: true,
      message: "Product image uploaded successfully.",
      image: {
        id: image.id,
        url: image.url,
        altText: image.altText,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      },
    });
  } catch (error) {
    console.error(
      "Admin product image upload failed:",
      error
    );

    return Response.json(
  {
    success: false,
    message: "Unable to upload product image.",
  },
  { status: 500 }
);
  }
}