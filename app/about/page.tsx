import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-inner">
          <p className="section-eyebrow">THE TRICEA STORY</p>

          <h1>
            Rooted in
            <br />
            culture.
            <br />
            Made for
            <br />
            today.
          </h1>

          <p className="about-hero-intro">
            Tricea NG creates thoughtfully crafted footwear inspired by
            African craftsmanship, everyday life, and the quiet confidence
            of modern style.
          </p>
        </div>
      </section>

      <section className="about-story">
        <div className="about-story-inner">
          <div className="about-story-label">
            <p className="section-eyebrow">OUR STORY</p>
          </div>

          <div className="about-story-content">
            <h2>
              Footwear with a sense of place.
            </h2>

            <p>
              Tricea NG was created from a simple idea: everyday footwear
              can be comfortable, distinctive, and deeply connected to
              where it comes from.
            </p>

            <p>
              Our designs draw from the textures, materials, craftsmanship,
              and visual language found across African culture, reimagined
              through a contemporary lens.
            </p>

            <p>
              From relaxed palm slippers to refined sandals and handmade
              shoes, every piece is designed to feel effortless while
              carrying a story of its own.
            </p>
          </div>
        </div>
      </section>

      <section className="about-values">
        <div className="about-values-inner">
          <div className="about-values-heading">
            <p className="section-eyebrow">WHAT GUIDES US</p>

            <h2>
              Thoughtful by
              <br />
              design.
            </h2>
          </div>

          <div className="about-values-grid">
            <article>
              <span>01</span>
              <h3>Craft</h3>
              <p>
                We value the hands, techniques, materials, and attention
                to detail behind every pair.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Culture</h3>
              <p>
                African influence is part of our visual identity and the
                foundation from which our designs evolve.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Ease</h3>
              <p>
                Good footwear should fit naturally into everyday life,
                balancing comfort with considered design.
              </p>
            </article>

            <article>
              <span>04</span>
              <h3>Character</h3>
              <p>
                We create pieces with personality—quiet enough for everyday
                wear, distinctive enough to be remembered.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-closing">
        <div className="about-closing-inner">
          <p className="section-eyebrow">THE TRICEA EDIT</p>

          <h2>
            Wear something
            <br />
            that feels like you.
          </h2>

          <p>
            Discover the collection and find your next everyday pair.
          </p>

          <Link href="/shop" className="about-shop-button">
            Explore the Collection <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}