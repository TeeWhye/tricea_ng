"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminDeleteCategoryButtonProps = {
  categoryId: string;
  categoryName: string;
  productCount: number;
};

export default function AdminDeleteCategoryButton({
  categoryId,
  categoryName,
  productCount,
}: AdminDeleteCategoryButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (productCount > 0) {
      setError(
        `This category contains ${productCount} ${
          productCount === 1 ? "product" : "products"
        }. Move those products to another category first.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/categories/${categoryId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete category."
        );
      }

      router.push("/admin/categories");
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
    <div>
      <button
        type="button"
        className="admin-secondary-action admin-delete-category-button"
        onClick={handleDelete}
        disabled={isDeleting || productCount > 0}
      >
        {isDeleting ? "Deleting..." : "Delete Category"}
      </button>

      {error && (
        <p className="admin-form-error">
          {error}
        </p>
      )}
    </div>
  );
}