import Link from "next/link";

export default function ShippingPage() {
  return (
    <main className="shipping-page">
      <section className="shipping-hero">
        <p className="shipping-eyebrow">TRICEA NG</p>
        <h1>Made to move with you.</h1>
        <p>
          Everything you need to know about delivery, from placing your order
          to receiving it at your door.
        </p>
      </section>

      <section className="shipping-content">
        <div className="shipping-intro">
          <p className="shipping-label">DELIVERY</p>
          <h2>Thoughtful service, wherever you are.</h2>
          <p>
            We deliver Tricea footwear across Nigeria. Once your order has
            been confirmed, our team prepares it carefully for dispatch and
            keeps you informed along the way.
          </p>
        </div>

        <div className="shipping-grid">
          <article className="shipping-card">
            <span>01</span>
            <h3>Order confirmation</h3>
            <p>
              After placing your order, you will receive confirmation with
              your order details. Orders are reviewed before they are prepared
              for dispatch.
            </p>
          </article>

          <article className="shipping-card">
            <span>02</span>
            <h3>Preparation</h3>
            <p>
              Your footwear is carefully checked and packaged before it is
              handed over for delivery.
            </p>
          </article>

          <article className="shipping-card">
            <span>03</span>
            <h3>Dispatch</h3>
            <p>
              Once your order has been dispatched, delivery begins to your
              selected address.
            </p>
          </article>

          <article className="shipping-card">
            <span>04</span>
            <h3>Delivery</h3>
            <p>
              Delivery is available across Nigeria. Delivery fees are
              calculated and displayed during checkout.
            </p>
          </article>
        </div>

        <div className="shipping-section">
          <div>
            <p className="shipping-label">DELIVERY INFORMATION</p>
            <h2>What to expect</h2>
          </div>

          <div className="shipping-details">
            <div className="shipping-detail">
              <h3>Delivery locations</h3>
              <p>
                We currently deliver to addresses within Nigeria. Please make
                sure your delivery address and contact details are accurate
                before completing your order.
              </p>
            </div>

            <div className="shipping-detail">
              <h3>Delivery fees</h3>
              <p>
                Delivery fees depend on your delivery location and are
                calculated at checkout before you place your order.
              </p>
            </div>

            <div className="shipping-detail">
              <h3>Delivery timing</h3>
              <p>
                Delivery times can vary depending on your location, order
                processing, and courier availability. Our team will provide
                relevant updates as your order progresses.
              </p>
            </div>

            <div className="shipping-detail">
              <h3>Address changes</h3>
              <p>
                If you need to change your delivery address after placing an
                order, please contact us as soon as possible. We cannot
                guarantee that an address can be changed after dispatch.
              </p>
            </div>
          </div>
        </div>

        <div className="shipping-note">
          <h2>A little reminder.</h2>
          <p>
            Please ensure someone is available to receive your order at the
            provided address. Delays caused by an incorrect or incomplete
            address may require additional delivery arrangements.
          </p>
        </div>

        <div className="shipping-cta">
          <p>Have a question about your delivery?</p>
          <Link href="/contact">Contact us</Link>
        </div>
      </section>
    </main>
  );
}