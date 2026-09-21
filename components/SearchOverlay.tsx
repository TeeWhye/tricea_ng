"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

type SearchProduct = {
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
};

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export default function SearchOverlay({
  open,
  onClose,
}: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setProducts([]);
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function searchProducts() {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/store/search?q=${encodeURIComponent(
            query.trim()
          )}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          setProducts([]);
          return;
        }

        const data = await response.json();

        if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Search failed:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    const timeout = window.setTimeout(
      searchProducts,
      250
    );

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="search-overlay">
      <div
        className="search-overlay-backdrop"
        onClick={onClose}
      />

      <div className="search-overlay-panel">
        <div className="search-overlay-header">
          <p className="section-eyebrow">
            SEARCH TRICEA NG
          </p>

          <button
            type="button"
            className="search-overlay-close"
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="search-overlay-input-wrap">
          <Search
            size={20}
            strokeWidth={1.5}
          />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search products..."
            autoFocus
          />
        </div>

        <div className="search-overlay-results">
          {!query.trim() ? (
            <div className="search-overlay-empty">
              <p className="section-eyebrow">
                EXPLORE
              </p>

              <p>
                Search for a product, category, or
                collection.
              </p>
            </div>
          ) : loading ? (
            <div className="search-overlay-empty">
              <p>Searching...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="search-overlay-empty">
              <p className="section-eyebrow">
                NO RESULTS
              </p>

              <h2>
                Nothing matched your search.
              </h2>

              <p>
                Try another product name or category.
              </p>
            </div>
          ) : (
            <div className="search-result-list">
              {products.map((product) => {
                const image = product.images[0];

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="search-result"
                    onClick={onClose}
                  >
                    <div className="search-result-image">
                      {image ? (
                        <img
                          src={image.url}
                          alt={
                            image.altText ??
                            product.name
                          }
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          Tricea NG
                        </div>
                      )}
                    </div>

                    <div className="search-result-info">
                      <span>
                        {product.category.name}
                      </span>

                      <h2>{product.name}</h2>

                      <p>
                        ₦
                        {product.price.toLocaleString(
                          "en-NG"
                        )}
                      </p>
                    </div>

                    <span className="search-result-arrow">
                      →
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}