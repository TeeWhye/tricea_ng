"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminOrderActionsProps = {
  orderId: string;
  orderStatus:
    | "PENDING"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  paymentStatus:
    | "PENDING"
    | "SUCCESSFUL"
    | "FAILED"
    | "REFUNDED"
    | null;
};

export default function AdminOrderActions({
  orderId,
  orderStatus,
  paymentStatus,
}: AdminOrderActionsProps) {
  const router = useRouter();

  const [selectedOrderStatus, setSelectedOrderStatus] =
    useState(orderStatus);

  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState(paymentStatus ?? "PENDING");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/orders/${orderId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderStatus: selectedOrderStatus,
            paymentStatus: selectedPaymentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update order."
        );
      }

      setMessage("Order updated successfully.");

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-order-card admin-order-actions">
      <div className="admin-order-card-heading">
        <p className="section-eyebrow">
          ORDER MANAGEMENT
        </p>
      </div>

      <div className="admin-action-fields">
        <label>
          <span>Order Status</span>

          <select
            value={selectedOrderStatus}
            onChange={(event) =>
              setSelectedOrderStatus(
                event.target.value as typeof selectedOrderStatus
              )
            }
          >
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </label>

        <label>
          <span>Payment Status</span>

          <select
            value={selectedPaymentStatus}
            onChange={(event) =>
              setSelectedPaymentStatus(
                event.target.value as typeof selectedPaymentStatus
              )
            }
          >
            <option value="PENDING">Pending</option>
            <option value="SUCCESSFUL">Successful</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </label>

        <button
          type="button"
          className="admin-save-button"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        {message && (
          <p className="admin-action-success">
            {message}
          </p>
        )}

        {error && (
          <p
            className="admin-login-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    </section>
  );
}