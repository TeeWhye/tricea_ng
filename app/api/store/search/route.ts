import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return Response.json({
        success: true,
        products: [],
      });
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            sku: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            category: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      include: {
        category: true,
        images: {
          where: {
            isPrimary: true,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });

    return Response.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Product search failed:", error);

    return Response.json(
      {
        success: false,
        message: "Unable to search products.",
      },
      { status: 500 }
    );
  }
}