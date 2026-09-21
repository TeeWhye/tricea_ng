import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

const categoryInfo: Record<
  string,
  {
    name: string;
    description: string;
  }
> = {
  "palm-slippers": {
    name: "Palm Slippers",
    description:
      "Effortless everyday footwear crafted for comfort, character, and modern living.",
  },
  sandals: {
    name: "Sandals",
    description:
      "Refined silhouettes designed to bring ease and sophistication to every step.",
  },
  "handmade-shoes": {
    name: "Handmade Shoes",
    description:
      "Distinctive footwear shaped by craftsmanship, detail, and African-inspired design.",
  },
};

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const { category } = await searchParams;

  const selectedCategory =
    category && categoryInfo[category]
      ? category
      : undefined;

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(selectedCategory
        ? {
            category: {
              slug: selectedCategory,
            },
          }
        : {}),
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
  });

  const pageTitle = selectedCategory
    ? categoryInfo[selectedCategory].name
    : "Footwear";

  const pageDescription = selectedCategory
    ? categoryInfo[selectedCategory].description
    : "Discover thoughtfully crafted footwear inspired by African craftsmanship and designed for modern life.";

  return (
    <main className="shop-page">
      <section className="shop-header">
        <div className="shop-header-inner">
          <div>
            <p className="section-eyebrow">
              {selectedCategory
                ? "THE TRICEA COLLECTION"
                : "THE TRICEA COLLECTION"}
            </p>

            <h1>
              {pageTitle}
              <br />
              worth wearing.
            </h1>
          </div>

          <p className="shop-intro">
            {pageDescription}
          </p>
        </div>
      </section>

      <section className="shop-products">
        <div className="shop-toolbar">
          <div className="shop-categories">
            <Link
              href="/shop"
              className={!selectedCategory ? "active" : ""}
            >
              All
            </Link>

            <Link
              href="/shop?category=palm-slippers"
              className={
                selectedCategory === "palm-slippers"
                  ? "active"
                  : ""
              }
            >
              Palm Slippers
            </Link>

            <Link
              href="/shop?category=sandals"
              className={
                selectedCategory === "sandals"
                  ? "active"
                  : ""
              }
            >
              Sandals
            </Link>

            <Link
              href="/shop?category=handmade-shoes"
              className={
                selectedCategory === "handmade-shoes"
                  ? "active"
                  : ""
              }
            >
              Handmade Shoes
            </Link>
          </div>

          <p className="shop-product-count">
            {products.length}{" "}
            {products.length === 1 ? "Product" : "Products"}
          </p>
        </div>

        {products.length > 0 ? (
          <div className="shop-product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="shop-empty">
            <h2>
              No products in this collection yet.
            </h2>

            <p>
              We're working on something new. Check back
              soon or explore another collection.
            </p>

            <Link
              href="/shop"
              className="cart-shop-button"
            >
              Explore All Footwear <span>→</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}