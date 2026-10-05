"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminDeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export default function AdminDeleteProductButton({
  productId,
  productName,
}: AdminDeleteProductButtonProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmation === "DELETE PRODUCT";

  async function handleDelete() {
    if (!canDelete || isDeleting) return;

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to delete product."
        );
        setIsDeleting(false);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
      setIsDeleting(false);
    }
  }

  function handleClose() {
    if (isDeleting) return;

    setIsOpen(false);
    setConfirmation("");
    setError("");
  }

  return (
    <>
      <button
        type="button"
        className="admin-delete-product-button"
        onClick={() => setIsOpen(true)}
      >
        Delete Product
      </button>

      {isOpen && (
        <div
          className="admin-delete-modal-backdrop"
          role="presentation"
          onClick={handleClose}
        >
          <div
            className="admin-delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <p className="section-eyebrow">
              DANGER ZONE
            </p>

            <h2 id="delete-product-title">
              Delete Product
            </h2>

            <p>
              You are about to permanently delete{" "}
              <strong>{productName}</strong>.
            </p>

            <p>
              This action cannot be undone. Product
              images and variants associated with this
              product may also be removed.
            </p>

            <label
              htmlFor="delete-product-confirmation"
            >
              Type <strong>DELETE PRODUCT</strong> to
              confirm.
            </label>

            <input
              id="delete-product-confirmation"
              type="text"
              value={confirmation}
              onChange={(event) =>
                setConfirmation(event.target.value)
              }
              placeholder="DELETE PRODUCT"
              autoComplete="off"
              disabled={isDeleting}
            />

            {error && (
              <p className="admin-delete-error">
                {error}
              </p>
            )}

            <div className="admin-delete-modal-actions">
              <button
                type="button"
                className="admin-secondary-action"
                onClick={handleClose}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-danger-action"
                onClick={handleDelete}
                disabled={!canDelete || isDeleting}
              >
                {isDeleting
                  ? "Deleting..."
                  : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}