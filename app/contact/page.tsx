"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSending(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send your message."
        );
      }

      form.reset();
      setSubmitted(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send your message."
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-inner">
          <div>
            <p className="section-eyebrow">GET IN TOUCH</p>

            <h1>
              Let&apos;s
              <br />
              talk.
            </h1>
          </div>

          <p className="contact-hero-intro">
            Have a question about an order, a product, or the Tricea
            collection? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="contact-content">
        <div className="contact-content-inner">
          <div className="contact-info">
            <p className="section-eyebrow">CONTACT TRICEA</p>

            <h2>
              We&apos;re here
              <br />
              to help.
            </h2>

            <p>
              Whether you need help choosing a pair, have a question about
              delivery, or simply want to say hello, send us a message and
              we&apos;ll get back to you.
            </p>

            <div className="contact-info-list">
              <div>
                <span>ORDERS &amp; SUPPORT</span>
                <p>For questions about your order or delivery.</p>
              </div>

              <div>
                <span>PRODUCT ENQUIRIES</span>
                <p>
                  Ask us about sizing, colours, availability, or a
                  particular product.
                </p>
              </div>

              <div>
                <span>GENERAL ENQUIRIES</span>
                <p>
                  For anything else, use the form and tell us how we can
                  help.
                </p>
              </div>
            </div>
          </div>

          <div className="contact-form-card">
            <p className="section-eyebrow">SEND AN ENQUIRY</p>

            {submitted ? (
              <div className="contact-success">
                <span>THANK YOU</span>

                <h2>
                  Your message
                  <br />
                  has been received.
                </h2>

                <p>
                  Thank you for reaching out to Tricea NG. We&apos;ll be in
                  touch soon.
                </p>

                <button
                  type="button"
                  className="contact-reset-button"
                  onClick={() => {
                    setSubmitted(false);
                    setError("");
                  }}
                >
                  Send Another Message <span>→</span>
                </button>
              </div>
            ) : (
              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >
                <label>
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    required
                  />
                </label>

                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label>
                  <span>Subject</span>
                  <input
                    type="text"
                    name="subject"
                    placeholder="What can we help with?"
                    required
                  />
                </label>

                <label>
                  <span>Message</span>
                  <textarea
                    name="message"
                    rows={7}
                    placeholder="Tell us a little more..."
                    required
                  />
                </label>

                {error && (
                  <p
                    className="contact-form-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="contact-submit-button"
                  disabled={isSending}
                >
                  {isSending
                    ? "Sending..."
                    : "Send Message"}{" "}
                  <span>→</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}