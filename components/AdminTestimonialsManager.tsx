"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Eye,
  EyeOff,
  Pencil,
  Star,
  Trash2,
  X,
} from "lucide-react";

type Testimonial = {
  id: string;
  customerName: string;
  content: string;
  rating: number | null;
  productName: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

type Props = {
  testimonials: Testimonial[];
};

export default function AdminTestimonialsManager({
  testimonials,
}: Props) {
  const router = useRouter();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [content, setContent] = useState("");
  const [productName, setProductName] = useState("");
  const [rating, setRating] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function startEditing(testimonial: Testimonial) {
    setEditingId(testimonial.id);
    setCustomerName(testimonial.customerName);
    setContent(testimonial.content);
    setProductName(testimonial.productName ?? "");
    setRating(
      testimonial.rating === null
        ? ""
        : String(testimonial.rating)
    );
    setSortOrder(String(testimonial.sortOrder));
    setError("");
    setSuccess("");
  }

  function cancelEditing() {
    setEditingId(null);
    setCustomerName("");
    setContent("");
    setProductName("");
    setRating("");
    setSortOrder("0");
    setError("");
  }

  async function updateTestimonial(
    id: string,
    changes: Partial<Testimonial>
  ) {
    setBusyId(id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...changes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message || "Unable to update testimonial."
        );
        return false;
      }

      setSuccess("Testimonial updated successfully.");
      router.refresh();
      return true;
    } catch {
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          customerName,
          content,
          productName: productName.trim() || null,
          rating: rating ? Number(rating) : null,
          sortOrder: Number(sortOrder),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message || "Unable to save changes."
        );
        return;
      }

      setSuccess("Changes saved successfully.");
      cancelEditing();
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(testimonial: Testimonial) {
    const confirmed = window.confirm(
      `Permanently delete the testimonial from ${testimonial.customerName}? This cannot be undone.`
    );

    if (!confirmed) return;

    setBusyId(testimonial.id);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: testimonial.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(
          result.message || "Unable to delete testimonial."
        );
        return;
      }

      if (editingId === testimonial.id) {
        cancelEditing();
      }

      setSuccess("Testimonial deleted successfully.");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-testimonials-manager">
      {error && (
        <p className="admin-login-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p role="status">
          {success}
        </p>
      )}

      {testimonials.length === 0 ? (
        <p>No testimonials have been added yet.</p>
      ) : (
        <div className="admin-testimonials-list">
          {testimonials.map((testimonial) => {
            const isBusy =
              busyId === testimonial.id || isSaving;

            return (
              <article
                className="admin-order-card admin-testimonial-card"
                key={testimonial.id}
              >
                {editingId === testimonial.id ? (
                  <form
                    className="admin-product-form"
                    onSubmit={handleSave}
                  >
                    <h3>Edit Testimonial</h3>

                    <div className="form-group">
                      <label htmlFor={`name-${testimonial.id}`}>
                        Customer name
                      </label>
                      <input
                        id={`name-${testimonial.id}`}
                        value={customerName}
                        onChange={(event) =>
                          setCustomerName(event.target.value)
                        }
                        maxLength={150}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`content-${testimonial.id}`}>
                        Testimonial
                      </label>
                      <textarea
                        id={`content-${testimonial.id}`}
                        value={content}
                        onChange={(event) =>
                          setContent(event.target.value)
                        }
                        rows={5}
                        maxLength={1000}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`product-${testimonial.id}`}>
                        Product name
                      </label>
                      <input
                        id={`product-${testimonial.id}`}
                        value={productName}
                        onChange={(event) =>
                          setProductName(event.target.value)
                        }
                        maxLength={150}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`rating-${testimonial.id}`}>
                        Rating
                      </label>
                      <select
                        id={`rating-${testimonial.id}`}
                        value={rating}
                        onChange={(event) =>
                          setRating(event.target.value)
                        }
                      >
                        <option value="">No rating</option>
                        <option value="5">5 - Excellent</option>
                        <option value="4">4 - Very good</option>
                        <option value="3">3 - Good</option>
                        <option value="2">2 - Fair</option>
                        <option value="1">1 - Poor</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`order-${testimonial.id}`}>
                        Display order
                      </label>
                      <input
                        id={`order-${testimonial.id}`}
                        type="number"
                        min="0"
                        max="100000"
                        step="1"
                        value={sortOrder}
                        onChange={(event) =>
                          setSortOrder(event.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="admin-testimonial-actions">
                      <button
                        type="submit"
                        className="admin-save-button"
                        disabled={isSaving}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>

                      <button
                        type="button"
                        className="admin-testimonial-secondary"
                        onClick={cancelEditing}
                        disabled={isSaving}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="admin-testimonial-card-header">
                      <div>
                        <h3>{testimonial.customerName}</h3>

                        {testimonial.productName && (
                          <p>
                            Product: {testimonial.productName}
                          </p>
                        )}
                      </div>

                      <span
                        className={
                          testimonial.isPublished
                            ? "admin-testimonial-status published"
                            : "admin-testimonial-status unpublished"
                        }
                      >
                        {testimonial.isPublished
                          ? "Published"
                          : "Unpublished"}
                      </span>
                    </div>

                    <p className="admin-testimonial-content">
                      {testimonial.content}
                    </p>

                    <div className="admin-testimonial-meta">
                      <span>
                        Rating:{" "}
                        {testimonial.rating === null
                          ? "Not provided"
                          : `${testimonial.rating}/5`}
                      </span>

                      <span>
                        Order: {testimonial.sortOrder}
                      </span>

                      {testimonial.isFeatured && (
                        <span>
                          <Star size={14} />
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="admin-testimonial-actions">
                      <button
                        type="button"
                        className="admin-testimonial-secondary"
                        onClick={() =>
                          startEditing(testimonial)
                        }
                        disabled={isBusy}
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="admin-testimonial-secondary"
                        onClick={() =>
                          updateTestimonial(testimonial.id, {
                            isPublished: !testimonial.isPublished,
                          })
                        }
                        disabled={isBusy}
                      >
                        {testimonial.isPublished ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}

                        {testimonial.isPublished
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        className="admin-testimonial-secondary"
                        onClick={() =>
                          updateTestimonial(testimonial.id, {
                            isFeatured: !testimonial.isFeatured,
                          })
                        }
                        disabled={isBusy}
                      >
                        <Star size={16} />

                        {testimonial.isFeatured
                          ? "Unfeature"
                          : "Feature"}
                      </button>

                      <button
                        type="button"
                        className="admin-testimonial-danger"
                        onClick={() =>
                          handleDelete(testimonial)
                        }
                        disabled={isBusy}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}