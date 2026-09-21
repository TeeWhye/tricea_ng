import Link from "next/link";

const collections = [
  {
    title: "Palm Slippers",
    subtitle: "Everyday essentials",
    href: "/shop?category=palm-slippers",
    className: "collection-palm",
  },
  {
    title: "Sandals",
    subtitle: "Effortless sophistication",
    href: "/shop?category=sandals",
    className: "collection-sandals",
  },
  {
    title: "Handmade Shoes",
    subtitle: "Crafted with character",
    href: "/shop?category=handmade-shoes",
    className: "collection-handmade",
  },
];

export default function Collections() {
  return (
    <section className="collections">
      <div className="collections-heading">
        <div>
          <p className="section-eyebrow">EXPLORE THE COLLECTIONS</p>

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
        {collections.map((collection, index) => (
          <Link
            key={collection.title}
            href={collection.href}
            className={`collection-card ${collection.className}`}
          >
            <div className="collection-number">
              0{index + 1}
            </div>

            <div className="collection-card-content">
              <p>{collection.subtitle}</p>

              <h3>{collection.title}</h3>

              <span>
                Shop Collection <strong>→</strong>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}