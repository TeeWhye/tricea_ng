"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CartItem } from "@/lib/cart";
import { nigeriaStates } from "@/data/nigeria-states";
import { getDeliveryFee } from "@/lib/delivery";

type SavedAddress = {
  id: string;
  label: string | null;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedState, setSelectedState] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(
    []
  );
  const [selectedAddressId, setSelectedAddressId] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");

  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    account_name: "",
    account_number: "",
  });

  useEffect(() => {
    async function loadCustomerProfile() {
      try {
        const response = await fetch("/api/account/profile", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.profile?.fullName) {
          setCustomerName(data.profile.fullName);
        }
      } catch (error) {
        console.error("Unable to load customer profile:", error);
      }
    }

    async function loadBankDetails() {
      try {
        const response = await fetch("/api/store/settings", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load store settings.");
        }

        const data = await response.json();

        if (data.success && data.settings) {
          setBankDetails({
            bank_name: data.settings.bank_name ?? "",
            account_name: data.settings.account_name ?? "",
            account_number: data.settings.account_number ?? "",
          });
        }
      } catch (error) {
        console.error("Unable to load bank details:", error);
      }
    }

    async function loadSavedAddresses() {
      try {
        const response = await fetch("/api/account/addresses", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (Array.isArray(data.addresses)) {
          setSavedAddresses(data.addresses);
        }
      } catch (error) {
        console.error("Unable to load saved addresses:", error);
      }
    }

    const storedCart = localStorage.getItem("tricea-cart");

    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error("Unable to load cart:", error);
        localStorage.removeItem("tricea-cart");
      }
    }

    loadCustomerProfile();
    loadBankDetails();
    loadSavedAddresses();
  }, []);

  const subtotal = cart.reduce((total, item) => {
    const variant = item.product.variants.find(
      (itemVariant) => itemVariant.id === item.variantId
    );

    const unitPrice = variant?.price ?? item.product.price;

    return total + unitPrice * item.quantity;
  }, 0);

  const deliveryFee = selectedState
    ? getDeliveryFee(selectedState)
    : 0;

  const total = subtotal + deliveryFee;

  function handleSavedAddressSelect(addressId: string) {
    const savedAddress = savedAddresses.find(
      (address) => address.id === addressId
    );

    if (!savedAddress) {
      return;
    }

    setSelectedAddressId(addressId);
    setCustomerPhone(savedAddress.phone || "");
    setDeliveryAddress(savedAddress.address);
    setDeliveryCity(savedAddress.city);
    setSelectedState(savedAddress.state);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (cart.length === 0) {
      setOrderError("Your bag is empty.");
      return;
    }

    setIsSubmitting(true);
    setOrderError("");

    const formData = new FormData(event.currentTarget);

    const items = cart.map((item) => ({
      productId: item.product.id,
      variantId: item.variantId,
      size: item.size,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          address: formData.get("address"),
          city: formData.get("city"),
          state: formData.get("state"),
          notes: formData.get("notes"),
          items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to place your order."
        );
      }

      localStorage.removeItem("tricea-cart");

      setOrderNumber(data.order.orderNumber);
      setOrderPlaced(true);
      setCart([]);
    } catch (error) {
      setOrderError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <p className="section-eyebrow">CHECKOUT</p>

          <h1>Your bag is empty.</h1>

          <p>
            Add something from the Tricea collection before
            proceeding to checkout.
          </p>

          <Link
            href="/shop"
            className="cart-shop-button"
          >
            Explore the Collection <span>→</span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      {orderPlaced ? (
        <div className="checkout-success">
          <p className="section-eyebrow">
            ORDER RECEIVED
          </p>

          <h1>Thank you for your order.</h1>

          <p className="checkout-order-number">
            Order Reference: <strong>{orderNumber}</strong>
          </p>

          <p>
            Your order has been received successfully.
            Please complete your bank transfer using the
            details below.
          </p>

          <div className="checkout-bank-details">
            <p className="section-eyebrow">
              BANK TRANSFER DETAILS
            </p>

            <div>
              <span>Bank Name</span>
              <strong>
                {bankDetails.bank_name || "Not provided"}
              </strong>
            </div>

            <div>
              <span>Account Name</span>
              <strong>
                {bankDetails.account_name ||
                  "Not provided"}
              </strong>
            </div>

            <div>
              <span>Account Number</span>
              <strong>
                {bankDetails.account_number ||
                  "Not provided"}
              </strong>
            </div>
          </div>

          <Link
            href="/shop"
            className="cart-shop-button"
          >
            Continue Shopping <span>→</span>
          </Link>
        </div>
      ) : (
        <div className="checkout-page-inner">
          <div className="checkout-heading">
            <p className="section-eyebrow">CHECKOUT</p>

            <h1>
              Complete
              <br />
              your order.
            </h1>
          </div>

          <div className="checkout-layout">
            <form
              className="checkout-form"
              onSubmit={handleSubmit}
            >
              <section className="checkout-section">
                <div className="checkout-section-heading">
                  <span>01</span>
                  <h2>Contact Information</h2>
                </div>

                <div className="checkout-fields">
                  <label>
                    <span>Full Name</span>

                    <input
                      type="text"
                      name="name"
                      value={customerName}
                      onChange={(event) =>
                        setCustomerName(event.target.value)
                      }
                      placeholder="Your full name"
                      required
                    />
                  </label>

                  <label>
                    <span>Email Address</span>

                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      required
                    />
                  </label>

                  <label>
                    <span>Phone Number</span>

                    <input
                      type="tel"
                      name="phone"
                      value={customerPhone}
                      onChange={(event) =>
                        setCustomerPhone(event.target.value)
                      }
                      placeholder="0800 000 0000"
                      required
                    />
                  </label>
                </div>
              </section>

              <section className="checkout-section">
                <div className="checkout-section-heading">
                  <span>02</span>
                  <h2>Delivery Address</h2>
                </div>

                {savedAddresses.length > 0 && (
                  <div className="checkout-saved-addresses">
                    <p className="checkout-saved-addresses-label">
                      Saved Addresses
                    </p>

                    <div className="checkout-saved-address-list">
                      {savedAddresses.map((savedAddress) => (
                        <button
                          key={savedAddress.id}
                          type="button"
                          className={`checkout-saved-address ${
                            selectedAddressId ===
                            savedAddress.id
                              ? "selected"
                              : ""
                          }`}
                          onClick={() =>
                            handleSavedAddressSelect(
                              savedAddress.id
                            )
                          }
                        >
                          <span className="checkout-saved-address-top">
                            <strong>
                              {savedAddress.label ||
                                "Saved Address"}
                            </strong>

                            {savedAddress.isDefault && (
                              <span>Default</span>
                            )}
                          </span>

                          <span>
                            {savedAddress.address}
                          </span>

                          <span>
                            {savedAddress.city},{" "}
                            {savedAddress.state}
                          </span>

                          {savedAddress.phone && (
                            <span>
                              {savedAddress.phone}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="checkout-fields">
                  <label>
                    <span>Address</span>

                    <input
                      type="text"
                      name="address"
                      value={deliveryAddress}
                      onChange={(event) =>
                        setDeliveryAddress(
                          event.target.value
                        )
                      }
                      placeholder="Street address"
                      required
                    />
                  </label>

                  <div className="checkout-field-row">
                    <label>
                      <span>City</span>

                      <input
                        type="text"
                        name="city"
                        value={deliveryCity}
                        onChange={(event) =>
                          setDeliveryCity(
                            event.target.value
                          )
                        }
                        placeholder="City"
                        required
                      />
                    </label>

                    <label>
                      <span>State</span>

                      <select
                        name="state"
                        value={selectedState}
                        onChange={(event) =>
                          setSelectedState(
                            event.target.value
                          )
                        }
                        required
                      >
                        <option value="" disabled>
                          Select your state
                        </option>

                        {nigeriaStates.map((state) => (
                          <option
                            key={state}
                            value={state}
                          >
                            {state}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label>
                    <span>Delivery Notes</span>

                    <textarea
                      name="notes"
                      placeholder="Optional instructions for delivery"
                      rows={4}
                    />
                  </label>
                </div>
              </section>

              <section className="checkout-section">
                <div className="checkout-section-heading">
                  <span>03</span>
                  <h2>Payment</h2>
                </div>

                <div className="payment-method">
                  <div>
                    <strong>Bank Transfer</strong>

                    <p>
                      After placing your order, you'll
                      receive our bank details and payment
                      instructions.
                    </p>
                  </div>

                  <span className="payment-selected">
                    Selected
                  </span>
                </div>
              </section>

              {orderError && (
                <p
                  className="checkout-error"
                  role="alert"
                >
                  {orderError}
                </p>
              )}

              <button
                type="submit"
                className="checkout-submit-button"
                disabled={isSubmitting || orderPlaced}
              >
                {isSubmitting
                  ? "Placing Order..."
                  : orderPlaced
                    ? "Order Received ✓"
                    : "Place Order"}

                {!isSubmitting && !orderPlaced && (
                  <span>→</span>
                )}
              </button>
            </form>

            <aside className="checkout-summary">
              <p className="section-eyebrow">
                YOUR ORDER
              </p>

              <div className="checkout-summary-items">
                {cart.map((item) => {
                  const variant =
                    item.product.variants.find(
                      (itemVariant) =>
                        itemVariant.id === item.variantId
                    );

                  const unitPrice =
                    variant?.price ?? item.product.price;

                  return (
                    <div
                      key={`${item.product.id}-${item.variantId}`}
                      className="checkout-summary-item"
                    >
                      <div className="checkout-summary-image">
                        {item.product.images[0] ? (
                          <img
                            src={
                              item.product.images[0].url
                            }
                            alt={
                              item.product.images[0]
                                .altText ??
                              item.product.name
                            }
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            Tricea NG
                          </div>
                        )}
                      </div>

                      <div>
                        <h3>{item.product.name}</h3>

                        <p>
                          Size {item.size} · Qty{" "}
                          {item.quantity}
                        </p>
                      </div>

                      <strong>
                        ₦
                        {(
                          unitPrice * item.quantity
                        ).toLocaleString("en-NG")}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-total-row">
                <span>Subtotal</span>

                <strong>
                  ₦{subtotal.toLocaleString("en-NG")}
                </strong>
              </div>

              <div className="checkout-total-row">
                <span>Delivery</span>

                <strong>
                  {selectedState
                    ? `₦${deliveryFee.toLocaleString(
                        "en-NG"
                      )}`
                    : "Select state"}
                </strong>
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-grand-total">
                <span>Total</span>

                <strong>
                  ₦{total.toLocaleString("en-NG")}
                </strong>
              </div>
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}