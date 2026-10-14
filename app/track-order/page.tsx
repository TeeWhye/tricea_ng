"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type TrackedOrder = {
  orderNumber: string;
  status: string;
  paymentStatus: string | null;
  createdAt: string;
  updatedAt: string;
  items: {
    name: string;
    quantity: number;
  }[];
};

const orderStatusLabels: Record<string, string> = {
  PENDING: "Order Received",
  CONFIRMED: "Order Confirmed",
  PROCESSING: "Being Prepared",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Payment Pending",
  PAID: "Payment Confirmed",
  SUCCESS: "Payment Confirmed",
  COMPLETED: "Payment Completed",
  FAILED: "Payment Failed",
  CANCELLED: "Payment Cancelled",
  REFUNDED: "Refunded",
};

function formatStatus(status: string) {
  return (
    orderStatusLabels[status] ??
    status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) =>
      char.toUpperCase()
    )
  );
}

function formatPaymentStatus(status: string | null) {
  if (!status) {
    return "Not Available";
  }

  return (
    paymentStatusLabels[status] ??
    status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) =>
      char.toUpperCase()
    )
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setOrder(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/track-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          trackingToken: trackingToken.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "We couldn't retrieve your order. Please try again."
        );
        return;
      }

      if (!data.order) {
        setError("We couldn't retrieve your order. Please try again.");
        return;
      }

      setOrder(data.order as TrackedOrder);
    } catch {
      setError(
        "We couldn't connect to the tracking service. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="track-order-page">
      <div className="track-order-inner">
        <header className="track-order-heading">
          <p className="section-eyebrow">TRICEA NG · ORDER CARE</p>

          <h1>
            Track Your
            <br />
            <span>Order.</span>
          </h1>

          <p>
            Your next favourite pair is worth keeping an eye on.
            Enter the details from your order confirmation email to
            see the latest available update.
          </p>
        </header>

        <section className="track-order-card">
          <div className="track-order-card-heading">
            <span className="track-order-step">ORDER LOOKUP</span>
            <h2>Where is your order?</h2>
            <p>
              Use the order reference and private tracking token sent
              to your email after checkout.
            </p>
          </div>

          <form
            className="track-order-form"
            onSubmit={handleSubmit}
          >
            <div className="account-form-group">
              <label htmlFor="orderNumber">Order reference</label>
              <input
                id="orderNumber"
                name="orderNumber"
                type="text"
                autoComplete="off"
                placeholder="e.g. TRC-20261013-ABC123"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="account-form-group">
              <label htmlFor="trackingToken">Tracking token</label>
              <input
                id="trackingToken"
                name="trackingToken"
                type="password"
                autoComplete="off"
                placeholder="Enter the 64-character token from your email"
                value={trackingToken}
                onChange={(event) => setTrackingToken(event.target.value)}
                minLength={64}
                maxLength={64}
                required
              />
              <p className="track-order-field-help">
                Your tracking token is private. Keep it safe and don't
                share it with anyone.
              </p>
            </div>

            {error && (
              <div className="track-order-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="track-order-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Checking your order..." : "Track My Order"}
            </button>
          </form>

          <p className="track-order-help">
            Can't find your tracking details? Check your order
            confirmation email or{" "}
            <Link href="/contact">contact our team</Link>.
          </p>
        </section>

        {order && (
          <section
            className="track-order-result"
            aria-live="polite"
            aria-labelledby="track-order-result-heading"
          >
            <div className="track-order-result-header">
              <div>
                <p className="section-eyebrow">YOUR ORDER</p>
                <h2 id="track-order-result-heading">
                  {order.orderNumber}
                </h2>
              </div>

              <span
                className={`track-order-status track-order-status-${order.status.toLowerCase()}`}
              >
                {formatStatus(order.status)}
              </span>
            </div>

            <div className="track-order-information">
              <div>
                <span>Order placed</span>
                <strong>{formatDate(order.createdAt)}</strong>
              </div>

              <div>
                <span>Payment status</span>
                <strong>{formatPaymentStatus(order.paymentStatus)}</strong>
              </div>

              <div>
                <span>Last updated</span>
                <strong>{formatDate(order.updatedAt)}</strong>
              </div>
            </div>

            <div className="track-order-items">
              <h3>Items in your order</h3>

              {order.items.length > 0 ? (
                <ul>
                  {order.items.map((item, index) => (
                    <li key={`${item.name}-${index}`}>
                      <span>{item.name}</span>
                      <span>Qty: {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Item details are not currently available.</p>
              )}
            </div>

            <p className="track-order-result-note">
              This page shows the latest order information available
              from Tricea NG. If you need help with your order,{" "}
              <Link href="/contact">contact our team</Link>.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}