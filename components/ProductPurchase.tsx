"use client";

import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import ProductOptions from "@/components/ProductOptions";
import AddToBagButton from "@/components/AddToBagButton";

type ProductPurchaseProps = {
  product: {
    id: string;
    name: string;
    price: number;
    category: {
      name: string;
    };
    images: {
      url: string;
      altText: string | null;
    }[];
    variants: {
      id: string;
      size: string;
      colour: string;
      sku: string;
      stock: number;
      price: number | null;
    }[];
  };
};

const CUSTOM_COLOURS = [
  "Black",
  "White",
  "Brown",
  "Dark Brown",
  "Cream",
  "Beige",
  "Tan",
  "Grey",
  "Red",
  "Wine",
  "Burgundy",
  "Pink",
  "Blue",
  "Navy Blue",
  "Green",
  "Olive Green",
  "Yellow",
  "Orange",
  "Purple",
  "Gold",
  "Silver",
  "Multicolour",
  "Other",
];

export default function ProductPurchase({
  product,
}: ProductPurchaseProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );

  const [selectedColour, setSelectedColour] = useState("");

  const [wishlisted, setWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  const [showCustomRequest, setShowCustomRequest] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredSize, setPreferredSize] = useState("");
  const [preferredColour, setPreferredColour] = useState("");
  const [otherColour, setOtherColour] = useState("");
  const [customSpecifications, setCustomSpecifications] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestSuccess, setRequestSuccess] = useState("");
  const [requestReference, setRequestReference] = useState("");

  const [isCustomColourMenuOpen, setIsCustomColourMenuOpen] =
  useState(false);

const customColourDropdownRef = useRef<HTMLDivElement>(null);

const customColourTriggerRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  function handleOutsideClick(event: MouseEvent) {
    if (
      customColourDropdownRef.current &&
      !customColourDropdownRef.current.contains(
        event.target as Node
      )
    ) {
      setIsCustomColourMenuOpen(false);
    }
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === "Escape") {
      setIsCustomColourMenuOpen(false);
      customColourTriggerRef.current?.focus();
    }
  }

  document.addEventListener("mousedown", handleOutsideClick);
  document.addEventListener("keydown", handleEscape);

  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
    document.removeEventListener("keydown", handleEscape);
  };
}, []);

  useEffect(() => {
    async function loadWishlistStatus() {
      try {
        const response = await fetch("/api/account/wishlist");

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (Array.isArray(data.productIds)) {
          setWishlisted(data.productIds.includes(product.id));
        }
      } catch {
        // Wishlist is optional for browsing.
      } finally {
        setLoadingWishlist(false);
      }
    }

    loadWishlistStatus();
  }, [product.id]);

  async function handleCustomRequest(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setRequestError("");
    setRequestSuccess("");
    setRequestReference("");

    if (!preferredColour) {
      setRequestError("Please select your preferred colour.");
      return;
    }

    if (preferredColour === "Other" && !otherColour.trim()) {
      setRequestError("Please specify your preferred colour.");
      return;
    }

    if (customSpecifications.trim().length < 10) {
      setRequestError(
        "Please describe your custom design in at least 10 characters."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/custom-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          preferredSize: preferredSize.trim(),
          preferredColour:
            preferredColour === "Other"
              ? otherColour.trim()
              : preferredColour,
          customSpecifications: customSpecifications.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRequestError(
          data.error ||
            "We couldn't submit your request. Please try again."
        );
        return;
      }

      setRequestReference(data.reference ?? "");
      setRequestSuccess(
        "Your custom footwear request has been submitted successfully. We will review your requirements and contact you."
      );

      setFullName("");
      setEmail("");
      setPhone("");
      setPreferredSize("");
      setPreferredColour("");
      setOtherColour("");
      setCustomSpecifications("");
    } catch {
      setRequestError(
        "We couldn't connect to the server. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <ProductOptions
        variants={product.variants}
        onVariantChange={(variantId) => {
          setSelectedVariantId(variantId);
        }}
        onColourChange={(colour) => {
          setSelectedColour(colour);
        }}
      />

      <div className="product-page-actions">
        <AddToBagButton
          product={product}
          selectedVariantId={selectedVariantId}
          selectedColour={selectedColour}
        />

        <button
          type="button"
          className={`product-wishlist-button ${
            wishlisted ? "active" : ""
          }`}
          aria-label={
            wishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          disabled={loadingWishlist}
          onClick={async () => {
            try {
              const response = await fetch("/api/account/wishlist", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  productId: product.id,
                }),
              });

              const data = await response.json();

              if (response.status === 401) {
                window.location.href =
                  "/account/login?redirect=/products/" + product.id;
                return;
              }

              if (!response.ok) {
                return;
              }

              setWishlisted(data.wishlisted);
              window.dispatchEvent(new Event("wishlist-updated"));
            } catch {
              // Keep current wishlist state if the request fails.
            }
          }}
        >
          <Heart
            size={20}
            strokeWidth={1.5}
            fill={wishlisted ? "currentColor" : "none"}
          />
        </button>
      </div>

      <section className="product-customisation">
        <div className="custom-request-heading">
          <p className="product-page-category">MADE FOR YOU</p>

          <h2>Request Custom Footwear</h2>

          <p className="product-option-hint">
            Looking for an unusual size, a different colour, or a unique
            design? Tell us what you have in mind. Our team will review your
            request and contact you about availability and pricing.
          </p>
        </div>

        {!showCustomRequest ? (
          <button
            type="button"
            className="product-add-button"
            onClick={() => setShowCustomRequest(true)}
          >
            Customise This Footwear
          </button>
        ) : (
          <form
            className="custom-request-form"
            onSubmit={handleCustomRequest}
          >
            <div className="custom-request-field">
              <label htmlFor="custom-full-name">Full name</label>

              <input
                id="custom-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div className="custom-request-field">
              <label htmlFor="custom-email">Email address</label>

              <input
                id="custom-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                required
              />
            </div>

            <div className="custom-request-field">
              <label htmlFor="custom-phone">Phone number</label>

              <input
                id="custom-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                maxLength={25}
                required
              />
            </div>

            <div className="custom-request-field">
              <label htmlFor="custom-size">Preferred size</label>

              <input
                id="custom-size"
                name="preferredSize"
                type="text"
                value={preferredSize}
                onChange={(event) =>
                  setPreferredSize(event.target.value)
                }
                maxLength={30}
                placeholder="E.g. 48, 49, or a custom measurement"
                required
              />

              <p className="product-option-hint">
                Enter your preferred size, even if it isn't listed among
                the available options.
              </p>
            </div>

            <div className="custom-request-field">
  <label id="custom-colour-label">
    Preferred colour
  </label>

  <div
    className="product-colour-dropdown"
    ref={customColourDropdownRef}
  >
    <button
      ref={customColourTriggerRef}
      type="button"
      className="product-colour-select"
      aria-labelledby="custom-colour-label"
      aria-haspopup="listbox"
      aria-expanded={isCustomColourMenuOpen}
      onClick={() =>
        setIsCustomColourMenuOpen((previous) => !previous)
      }
    >
      <span>
        {preferredColour || "Select a colour"}
      </span>

      <span
        className={`product-colour-chevron ${
          isCustomColourMenuOpen ? "is-open" : ""
        }`}
        aria-hidden="true"
      >
        ▾
      </span>
    </button>

    {isCustomColourMenuOpen && (
      <div
        className="product-colour-menu"
        role="listbox"
        aria-labelledby="custom-colour-label"
      >
        <button
          type="button"
          role="option"
          aria-selected={preferredColour === ""}
          className={`product-colour-option ${
            preferredColour === "" ? "selected" : ""
          }`}
          onClick={() => {
            setPreferredColour("");
            setOtherColour("");
            setIsCustomColourMenuOpen(false);
          }}
        >
          <span>Select a colour</span>
        </button>

        {CUSTOM_COLOURS.map((colour) => (
          <button
            key={colour}
            type="button"
            role="option"
            aria-selected={preferredColour === colour}
            className={`product-colour-option ${
              preferredColour === colour ? "selected" : ""
            }`}
            onClick={() => {
              setPreferredColour(colour);

              if (colour !== "Other") {
                setOtherColour("");
              }

              setIsCustomColourMenuOpen(false);
            }}
          >
            <span>{colour}</span>

            {preferredColour === colour && (
              <span aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </div>
    )}
  </div>
</div>

            {preferredColour === "Other" && (
              <div className="custom-request-field">
                <label htmlFor="other-custom-colour">
                  Specify your colour
                </label>

                <input
                  id="other-custom-colour"
                  name="otherColour"
                  type="text"
                  value={otherColour}
                  onChange={(event) =>
                    setOtherColour(event.target.value)
                  }
                  maxLength={60}
                  placeholder="Describe your preferred colour"
                  required
                />
              </div>
            )}

            <div className="custom-request-field">
              <label htmlFor="custom-specifications">
                Design and customisation details
              </label>

              <textarea
                id="custom-specifications"
                name="customSpecifications"
                value={customSpecifications}
                onChange={(event) =>
                  setCustomSpecifications(
                    event.target.value.slice(0, 1000)
                  )
                }
                maxLength={1000}
                rows={5}
                placeholder="Describe the design, materials, sole, straps, patterns, finishing, or any other changes you want."
                required
              />

              <div className="product-customisation-footer">
                <span>
                  Your request is subject to availability and confirmation.
                </span>

                <span>{customSpecifications.length}/1000</span>
              </div>
            </div>

            {requestError && (
              <p className="custom-request-error" role="alert">
                {requestError}
              </p>
            )}

            {requestSuccess && (
              <div
                className="custom-request-success"
                role="status"
                aria-live="polite"
              >
                <p>{requestSuccess}</p>

                {requestReference && (
                  <p>
                    Your reference: <strong>{requestReference}</strong>
                  </p>
                )}
              </div>
            )}

            <div className="custom-request-actions">
              <button
                type="submit"
                className="product-add-button"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Submitting Request..."
                  : "Submit Custom Request"}
              </button>

              <button
                type="button"
                className="product-wishlist-button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowCustomRequest(false);
                  setRequestError("");
                }}
              >
                Cancel
              </button>
            </div>

            <p className="product-option-hint">
              Submitting this form is a request, not a confirmed order.
              You won't be charged when you submit it.
            </p>
          </form>
        )}
      </section>
    </>
  );
}