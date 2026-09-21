import Link from "next/link";

export default function ReturnsPage() {
  return (
    <main className="returns-page">
      <section className="returns-hero">
        <p className="returns-eyebrow">TRICEA NG</p>
        <h1>Made to be worn. Made to feel right.</h1>
        <p>
          Our returns guidance is here to make your Tricea experience simple,
          clear, and considered.
        </p>
      </section>

      <section className="returns-content">
        <div className="returns-intro">
          <p className="returns-label">RETURNS & EXCHANGES</p>
          <h2>We want you to love every step.</h2>
          <p>
            If your Tricea purchase isn't quite right, please get in touch with
            us as soon as possible. We will review your request and guide you
            through the available options.
          </p>
        </div>

        <div className="returns-grid">
          <article className="returns-card">
            <span>01</span>
            <h3>Contact us</h3>
            <p>
              Send us a message with your order number and a brief explanation
              of the issue. Our team will review your request.
            </p>
          </article>

          <article className="returns-card">
            <span>02</span>
            <h3>Keep your footwear unworn</h3>
            <p>
              Items being considered for return or exchange should be unused,
              unworn, and kept in their original condition and packaging.
            </p>
          </article>

          <article className="returns-card">
            <span>03</span>
            <h3>Assessment</h3>
            <p>
              Once we receive the relevant details, we will assess the request
              and confirm whether it qualifies for a return or exchange.
            </p>
          </article>

          <article className="returns-card">
            <span>04</span>
            <h3>Resolution</h3>
            <p>
              Where approved, we will provide the next steps for your return,
              exchange, or other available resolution.
            </p>
          </article>
        </div>

        <div className="returns-section">
          <div>
            <p className="returns-label">OUR GUIDELINES</p>
            <h2>Before requesting a return</h2>
          </div>

          <div className="returns-details">
            <div className="returns-detail">
              <h3>Condition of the item</h3>
              <p>
                Footwear should be unworn and in its original condition. Please
                include the original packaging where applicable.
              </p>
            </div>

            <div className="returns-detail">
              <h3>Proof of purchase</h3>
              <p>
                Please have your Tricea order number available when contacting
                us about a return or exchange.
              </p>
            </div>

            <div className="returns-detail">
              <h3>Wrong size</h3>
              <p>
                If the size you received isn't right for you, contact us before
                wearing the footwear so we can discuss available exchange
                options.
              </p>
            </div>

            <div className="returns-detail">
              <h3>Damaged or incorrect items</h3>
              <p>
                If your order arrives damaged or you receive an incorrect item,
                please contact us promptly with details of the issue.
              </p>
            </div>
          </div>
        </div>

        <div className="returns-note">
          <h2>A considered approach.</h2>
          <p>
            Return and exchange eligibility can depend on the condition of the
            item and the circumstances of the request. Please contact us before
            sending anything back so we can provide the correct instructions.
          </p>
        </div>

        <div className="returns-cta">
          <p>Need help with an order?</p>
          <Link href="/contact">Contact us</Link>
        </div>
      </section>
    </main>
  );
}