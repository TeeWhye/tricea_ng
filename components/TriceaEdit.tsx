import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export default async function TriceaEdit() {
  const featuredProducts = await prisma.product.findMany({
    where: {
      isActive: true,
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
    take: 3,
  });

  return (
    <section className="tricea-edit">
      <div className="tricea-edit-heading">
        <div>
          <p className="section-eyebrow">THE TRICEA EDIT</p>

          <h2>
            Pieces worth
            <br />
            knowing.
          </h2>
        </div>

        <Link href="/shop" className="tricea-edit-link">
          View All Products <span>→</span>
        </Link>
      </div>

      <div className="tricea-edit-grid">
        {featuredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}