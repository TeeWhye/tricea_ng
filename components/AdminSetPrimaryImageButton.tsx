"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminSetPrimaryImageButtonProps = {
  productId: string;
  imageId: string;
  isPrimary: boolean;
};

export default function AdminSetPrimaryImageButton({
  productId,
  imageId,
  isPrimary,
}: AdminSetPrimaryImageButtonProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSetPrimary() {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/images/${imageId}`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update primary image."
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
      setIsSaving(false);
    }
  }

  if (isPrimary) {
    return (
      <span className="admin-image-primary-label">
        Primary Image
      </span>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="admin-secondary-action"
        onClick={handleSetPrimary}
        disabled={isSaving}
      >
        {isSaving
          ? "Updating..."
          : "Set as Primary"}
      </button>

      {error && (
        <p className="admin-form-error">
          {error}
        </p>
      )}
    </div>
  );
}