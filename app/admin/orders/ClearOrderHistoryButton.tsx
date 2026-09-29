"use client";

import { useState } from "react";

const CONFIRMATION_TEXT = "CLEAR ORDER HISTORY";

type Props = {
  orderCount: number;
};

export default function ClearOrderHistoryButton({
  orderCount,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationText, setConfirmationText] =
    useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState("");

  const canClear =
    confirmationText === CONFIRMATION_TEXT &&
    !isClearing;

  function closeModal() {
    if (isClearing) {
      return;
    }

    setIsOpen(false);
    setConfirmationText("");
    setError("");
  }

  async function handleClearHistory() {
    if (!canClear) {
      return;
    }

    setIsClearing(true);
    setError("");

    try {
      const response = await fetch(
        "/api/admin/orders",
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to clear order history."
        );
      }

      window.location.reload();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to clear order history."
      );
      setIsClearing(false);
    }
  }

  if (orderCount === 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="admin-clear-orders-button"
        onClick={() => setIsOpen(true)}
      >
        Clear Order History
      </button>

      {isOpen && (
        <div
          className="admin-clear-orders-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="admin-clear-orders-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-orders-title"
          >
            <p className="section-eyebrow">
              DANGER ZONE
            </p>

            <h2 id="clear-orders-title">
              Clear Order History?
            </h2>

            <p>
              This will permanently delete all{" "}
              <strong>{orderCount}</strong>{" "}
              {orderCount === 1 ? "order" : "orders"},
              including their order items, payments,
              and order notifications.
            </p>

            <p>
              Inventory reserved by these orders will
              also be restored.
            </p>

            <p className="admin-clear-orders-warning">
              This action cannot be undone.
            </p>

            <label
              htmlFor="clear-orders-confirmation"
              className="admin-clear-orders-label"
            >
              Type{" "}
              <strong>{CONFIRMATION_TEXT}</strong>{" "}
              to continue.
            </label>

            <input
              id="clear-orders-confirmation"
              type="text"
              value={confirmationText}
              onChange={(event) =>
                setConfirmationText(
                  event.target.value
                )
              }
              placeholder={CONFIRMATION_TEXT}
              autoComplete="off"
              autoFocus
              disabled={isClearing}
              className="admin-clear-orders-input"
            />

            {error && (
              <p
                className="admin-form-error"
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="admin-clear-orders-actions">
              <button
                type="button"
                className="admin-clear-orders-cancel"
                onClick={closeModal}
                disabled={isClearing}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-clear-orders-confirm"
                onClick={handleClearHistory}
                disabled={!canClear}
              >
                {isClearing
                  ? "Clearing..."
                  : "Clear Order History"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}