"use client";

import { useEffect, useRef, useState } from "react";

type ProductVariant = {
  id: string;
  size: string;
  colour: string;
  sku: string;
  stock: number;
  price: number | null;
};

type ProductOptionsProps = {
  variants: ProductVariant[];
  onVariantChange: (variantId: string | null) => void;
  onColourChange?: (colour: string) => void;
};

const AVAILABLE_COLOURS = [
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

export default function ProductOptions({
  variants,
  onVariantChange,
  onColourChange,
}: ProductOptionsProps) {
  const [selectedColour, setSelectedColour] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isColourMenuOpen, setIsColourMenuOpen] = useState(false);

  const colourDropdownRef = useRef<HTMLDivElement>(null);
  const colourTriggerRef = useRef<HTMLButtonElement>(null);

  const sizes = Array.from(
    new Set(variants.map((variant) => variant.size))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        colourDropdownRef.current &&
        !colourDropdownRef.current.contains(event.target as Node)
      ) {
        setIsColourMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsColourMenuOpen(false);
        colourTriggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleColourSelect(colour: string) {
    setSelectedColour(colour);
    setSelectedSize(null);
    setIsColourMenuOpen(false);

    onColourChange?.(colour);
    onVariantChange(null);
  }

  function handleSizeSelect(size: string) {
    const availableVariants = variants.filter(
      (variant) => variant.stock > 0
    );

    const variant = availableVariants.find(
      (item) => item.size === size
    );

    if (!variant) {
      return;
    }

    setSelectedSize(size);
    onVariantChange(variant.id);
  }

  return (
    <div className="product-page-option">
      {/* Colour selection */}
      <div className="product-colour-selection">
        <div className="product-option-header">
          <span>Preferred Colour</span>
        </div>

        <div
          className="product-colour-dropdown"
          ref={colourDropdownRef}
        >
          <button
            ref={colourTriggerRef}
            type="button"
            className="product-colour-select"
            aria-label="Choose your preferred footwear colour"
            aria-haspopup="listbox"
            aria-expanded={isColourMenuOpen}
            onClick={() =>
              setIsColourMenuOpen((previous) => !previous)
            }
          >
            <span>
              {selectedColour || "Select your preferred colour"}
            </span>

            <span
              className={`product-colour-chevron ${
                isColourMenuOpen ? "is-open" : ""
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {isColourMenuOpen && (
            <div
              className="product-colour-menu"
              role="listbox"
              aria-label="Available colours"
            >
              {AVAILABLE_COLOURS.map((colour) => (
                <button
                  key={colour}
                  type="button"
                  role="option"
                  aria-selected={selectedColour === colour}
                  className={`product-colour-option ${
                    selectedColour === colour ? "selected" : ""
                  }`}
                  onClick={() => handleColourSelect(colour)}
                >
                  <span>{colour}</span>

                  {selectedColour === colour && (
                    <span aria-hidden="true">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="product-option-hint">
          Can&apos;t find your preferred colour? Select Other and
          describe the colour you want in the Customisation &amp;
          Special Requests box below.
        </p>
      </div>

      {/* Size selection */}
      <div className="product-option-header">
        <span>Size</span>
        <a href="/size-guide">Size Guide</a>
      </div>

      <div className="size-options">
        {sizes.length === 0 ? (
          <p className="size-selection-hint">
            No sizes are currently listed for this product. You can
            request your preferred size in the customisation box below.
          </p>
        ) : (
          sizes.map((size) => {
            const availableVariant = variants.find(
              (item) => item.size === size && item.stock > 0
            );

            const isOutOfStock = !availableVariant;

            return (
              <button
                key={size}
                type="button"
                disabled={isOutOfStock}
                className={selectedSize === size ? "selected" : ""}
                onClick={() => handleSizeSelect(size)}
                aria-pressed={selectedSize === size}
              >
                {size}
              </button>
            );
          })
        )}
      </div>

      <p className="product-option-hint">
        <strong>Need a different size?</strong> No problem! If your
        preferred size isn&apos;t listed above, let us know in the
        Customisation &amp; Special Requests box below. We&apos;ll
        review your request and confirm availability.
      </p>
    </div>
  );
}