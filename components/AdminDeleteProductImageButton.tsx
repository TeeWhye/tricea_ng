"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminDeleteProductImageButtonProps = {
  productId: string;
  imageId: string;
  isPrimary: boolean;
};

export default function AdminDeleteProductImageButton({
  productId,
  imageId,
  isPrimary,
}: AdminDeleteProductImageButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images/${imageId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete product image."
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

  if (isPrimary) {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        className="admin-secondary-action admin-delete-image-button"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete Image"}
      </button>

      {error && (
        <p className="admin-form-error">
          {error}
        </p>
      )}
    </div>
  );
}