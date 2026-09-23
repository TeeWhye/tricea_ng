import Link from "next/link";

import { prisma } from "@/lib/prisma";

const collectionInfo: Record<
  string,
  {
    subtitle: string;
    className: string;
  }
> = {
  "premium-palm-slides": {
    subtitle: "Everyday essentials",
    className: "collection-palm",
  },

  sandals: {
    subtitle: "Effortless sophistication",
    className: "collection-sandals",
  },

  "handmade-shoes": {
    subtitle: "Crafted with character",
    className: "collection-handmade",
  },
};

export default async function Collections() {
  const categories = await prisma.category.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  return (
    <section className="collections">
      <div className="collections-heading">
        <div>
          <p className="section-eyebrow">
            EXPLORE THE COLLECTIONS
          </p>

          <h2>
            Made for every
            <br />
            expression.
          </h2>
        </div>

        <p className="collections-intro">
          Discover thoughtfully crafted footwear inspired by African
          craftsmanship and designed for modern life.
        </p>
      </div>

      <div className="collections-grid">
        {categories.map((category, index) => {
  const info = collectionInfo[category.slug] ?? {
    subtitle: "Discover the collection",
    className: `collection-${index + 1}`,
  };

  return (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className={`collection-card ${info.className}`}
            >
              <div className="collection-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="collection-card-content">
                <p>{info.subtitle}</p>

                <h3>{category.name}</h3>

                <span>
                  Shop Collection <strong>→</strong>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}