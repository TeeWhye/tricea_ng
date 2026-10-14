import { prisma } from "@/lib/prisma";

export default async function Testimonials() {
const testimonials = await prisma.testimonial.findMany({
  where: { isPublished: true },
  orderBy: [
    { isFeatured: "desc" },
    { sortOrder: "asc" },
    { createdAt: "desc" },
  ],
  select: {
    id: true,
    customerName: true,
    content: true,
    productName: true,
  },
});

  if (testimonials.length === 0) {
    return null;
  }

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
    <article
      className="testimonial-card"
      key={testimonial.id}
    >
      <span className="testimonial-number">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="testimonial-quote-mark">“</div>

      <p className="testimonial-quote">
        {testimonial.content}
      </p>

      <div className="testimonial-author">
        <strong>{testimonial.customerName}</strong>

        {testimonial.productName && (
          <span>{testimonial.productName}</span>
        )}
      </div>
    </article>
  ))}
</div>
    </section>
  );
}