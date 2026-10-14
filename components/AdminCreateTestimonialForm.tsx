"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCreateTestimonialForm() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [content, setContent] = useState("");
  const [productName, setProductName] = useState("");
  const [rating, setRating] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          content,
          productName: productName.trim() || null,
          rating: rating ? Number(rating) : null,
          sortOrder: Number(sortOrder),
          isPublished,
          isFeatured,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Unable to create testimonial.");
        return;
      }

      setCustomerName("");
      setContent("");
      setProductName("");
      setRating("");
      setSortOrder("0");
      setIsPublished(false);
      setIsFeatured(false);

      setSuccess("Testimonial created successfully.");

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-order-card admin-create-product-card">
      <div>
        <h2>Add a Testimonial</h2>
        <p>
          Enter customer feedback received through your approved
          communication channels.
        </p>
      </div>

      <form
        className="admin-product-form"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label htmlFor="customerName">Customer name</label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={(event) =>
              setCustomerName(event.target.value)
            }
            maxLength={150}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Testimonial</label>
          <textarea
            id="content"
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            rows={5}
            maxLength={1000}
            required
          />
          <small>{content.length}/1000 characters</small>
        </div>

        <div className="form-group">
          <label htmlFor="productName">
            Product name (optional)
          </label>
          <input
            id="productName"
            type="text"
            value={productName}
            onChange={(event) =>
              setProductName(event.target.value)
            }
            maxLength={150}
          />
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating (optional)</label>
          <select
            id="rating"
            value={rating}
            onChange={(event) => setRating(event.target.value)}
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
          <label htmlFor="sortOrder">Display order</label>
          <input
            id="sortOrder"
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
          <small>
            Lower numbers appear first. Equal numbers are ordered
            by creation date.
          </small>
        </div>

        <label className="admin-testimonial-checkbox">
  <input
    type="checkbox"
    checked={isPublished}
    onChange={(event) =>
      setIsPublished(event.target.checked)
    }
  />
  <span>Publish immediately</span>
</label>

<label className="admin-testimonial-checkbox">
  <input
    type="checkbox"
    checked={isFeatured}
    onChange={(event) =>
      setIsFeatured(event.target.checked)
    }
  />
  <span>Mark as featured</span>
</label>

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

        <button
          type="submit"
          className="admin-save-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Add Testimonial"}
        </button>
      </form>
    </div>
  );
}