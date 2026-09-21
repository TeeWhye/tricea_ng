import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="final-cta-inner">
        <p className="section-eyebrow">STEP INTO TRICEA</p>

        <h2>
          Find your
          <br />
          pair.
        </h2>

        <p>
          Thoughtfully crafted footwear for wherever life takes you.
        </p>

        <Link href="/shop" className="final-cta-button">
          Explore the Collection <span>→</span>
        </Link>
      </div>
    </section>
  );
}