import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductPurchase from "@/components/ProductPurchase";
import ProductGallery from "@/components/ProductGallery";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      images: {
  orderBy: [
    {
      isPrimary: "desc",
    },
    {
      sortOrder: "asc",
    },
  ],
},
      variants: {
        orderBy: {
          size: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="product-page">
      <div className="product-page-inner">
        <div className="product-page-image">
  <ProductGallery
    productName={product.name}
    images={product.images}
  />
</div>

        <div className="product-page-details">
          <Link
            href="/shop"
            className="product-back-link"
          >
            ← Back to Shop
          </Link>

          <p className="product-page-category">
            {product.category.name}
          </p>

          <h1>{product.name}</h1>

          <p className="product-page-price">
            ₦{product.price.toLocaleString("en-NG")}
          </p>

          <div className="product-page-divider" />

          <p className="product-page-description">
            {product.description ??
              "Thoughtfully crafted footwear designed to bring comfort, character, and effortless style to every step."}
          </p>

          <ProductPurchase product={product} />

          <div className="product-delivery">
            <Truck
              size={20}
              strokeWidth={1.5}
            />

            <div>
              <strong>Delivery</strong>

              <p>
                Delivery available across Nigeria.
                Delivery fees are calculated at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}