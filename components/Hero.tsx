
import Link from "next/link";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <p className="hero-eyebrow">
            ROOTED IN CULTURE
            <span>CRAFTED FOR TODAY</span>
          </p>

          <h1>
            Footwear
            <br />
            for Every
            <br />
            Journey
          </h1>

          <p className="hero-description">
            Premium footwear inspired by African heritage,
            thoughtfully crafted for modern life.
          </p>

          <div className="hero-actions">
            <Link href="/shop" className="hero-primary-button">
              Shop Collection
              <span>→</span>
            </Link>

            <Link href="/about" className="hero-secondary-button">
              Discover Tricea
            </Link>
          </div>

          <div className="hero-values">
            <div>
              <span>✦</span>
              <p>
                Premium
                <br />
                Materials
              </p>
            </div>

            <div>
              <span>◇</span>
              <p>
                African
                <br />
                Inspired
              </p>
            </div>

            <div>
              <span>∞</span>
              <p>
                Built
                <br />
                To Last
              </p>
            </div>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <img
  src="/images/hero/tricea-hero.png"
  alt="Tricea NG African-inspired footwear collection"
  className="hero-image"
/>

          <div className="hero-image-label">
            <span>TRICEA NG</span>
            <strong>MEN / WOMEN</strong>
          </div>
        </div>
      </div>
    </section>
  );
}