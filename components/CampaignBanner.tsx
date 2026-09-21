import Link from "next/link";

export default function CampaignBanner() {
  return (
    <section className="campaign-banner">
      <div className="campaign-overlay" />

      <div className="campaign-content">
        <p className="campaign-eyebrow">
          THE TRICEA WAY
        </p>

        <h2>
          More than footwear.
          <br />
          A lifestyle.
        </h2>

        <p>
          From everyday moments to unforgettable occasions,
          Tricea is made to move with you.
        </p>

        <Link href="/shop" className="campaign-button">
          Explore Tricea <span>→</span>
        </Link>
      </div>

      <div className="campaign-side-label">
        <span>TRICEA NG</span>
        <span>EST. 2026</span>
      </div>
    </section>
  );
}