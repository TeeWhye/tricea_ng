export default function BrandStory() {
  return (
    <section className="brand-story">
      <div className="brand-story-inner">
        <div className="brand-story-content">
          <p className="section-eyebrow">THE TRICEA PHILOSOPHY</p>

          <h2>
            Rooted in African craftsmanship.
            <br />
            Designed for modern living.
          </h2>

          <p className="brand-story-description">
            At Tricea NG, we believe footwear should carry character,
            craftsmanship, comfort, and identity.
          </p>

          <a href="/about" className="brand-story-link">
            Discover Our Story <span>→</span>
          </a>
        </div>

        <div className="brand-story-visual">
          <div className="brand-story-image-placeholder">
            <span>TRICEA NG</span>
            <p>Crafted with character.</p>
          </div>
        </div>
      </div>

      <div className="brand-story-values">
        <div>
          <span>01</span>
          <h3>QUALITY</h3>
          <p>Thoughtfully selected materials.</p>
        </div>

        <div>
          <span>02</span>
          <h3>CRAFT</h3>
          <p>Inspired by generations of craftsmanship.</p>
        </div>

        <div>
          <span>03</span>
          <h3>CULTURE</h3>
          <p>A modern expression of African identity.</p>
        </div>
      </div>
    </section>
  );
}