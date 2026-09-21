export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "The craftsmanship is beautiful. You can immediately tell that attention was paid to the smallest details.",
      name: "Amara",
      location: "Lagos",
    },
    {
      quote:
        "Comfortable, elegant, and easy to wear. Tricea has the kind of pieces that become part of your everyday wardrobe.",
      name: "Daniel",
      location: "Abuja",
    },
    {
      quote:
        "I love how the designs feel distinctly African without looking traditional or dated.",
      name: "Tolu",
      location: "Ibadan",
    },
  ];

  return (
    <section className="testimonials">
      <div className="testimonials-heading">
        <p className="section-eyebrow">THE TRICEA EXPERIENCE</p>

        <h2>
          Worn with
          <br />
          intention.
        </h2>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <article className="testimonial-card" key={testimonial.name}>
            <span className="testimonial-number">
              0{index + 1}
            </span>

            <div className="testimonial-quote-mark">“</div>

            <p className="testimonial-quote">
              {testimonial.quote}
            </p>

            <div className="testimonial-author">
              <strong>{testimonial.name}</strong>
              <span>{testimonial.location}</span>
            </div>
          </article>
        ))}
      </div>

      <p className="testimonial-placeholder-note">
        * Placeholder testimonials — replace with verified customer reviews.
      </p>
    </section>
  );
}