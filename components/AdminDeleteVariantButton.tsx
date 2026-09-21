"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminDeleteVariantButtonProps = {
  productId: string;
  variantId: string;
};

export default function AdminDeleteVariantButton({
  productId,
  variantId,
}: AdminDeleteVariantButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this variant?"
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete variant."
        );
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="admin-delete-variant">
      <button
        type="button"
        className="admin-danger-action"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>

      {error && (
        <p className="admin-form-error">
          {error}
        </p>
      )}
    </div>
  );
}