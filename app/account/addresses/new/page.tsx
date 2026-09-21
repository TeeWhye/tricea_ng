"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export default function NewAddressPage() {
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        "/api/account/addresses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            label,
            address,
            city,
            state,
            phone,
            isDefault,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "Unable to save address."
        );
      }

      window.location.href = "/account/addresses";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save address."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="account-dashboard">
      <div className="account-dashboard-inner">
        <div className="account-dashboard-header">
          <div>
            <p className="section-eyebrow">MY ACCOUNT</p>

            <h1>Add Address.</h1>

            <p>
              Save a delivery address for a faster
              checkout experience.
            </p>
          </div>

          <Link
            href="/account/addresses"
            className="account-back-link"
          >
            ← Back to Addresses
          </Link>
        </div>

        <section className="account-details-section">
          <form
            className="account-details-form"
            onSubmit={handleSubmit}
          >
            <div className="account-details-form-group">
              <label htmlFor="label">
                Address Label
              </label>

              <input
                id="label"
                type="text"
                value={label}
                onChange={(event) =>
                  setLabel(event.target.value)
                }
                placeholder="e.g. Home"
              />
            </div>

            <div className="account-details-form-group">
              <label htmlFor="address">
                Street Address
              </label>

              <input
                id="address"
                type="text"
                value={address}
                onChange={(event) =>
                  setAddress(event.target.value)
                }
                placeholder="Enter your full delivery address"
                required
              />
            </div>

            <div className="account-details-form-group">
              <label htmlFor="city">City</label>

              <input
                id="city"
                type="text"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
                placeholder="e.g. Sango Ota"
                required
              />
            </div>

            <div className="account-details-form-group">
              <label htmlFor="state">State</label>

              <select
                id="state"
                value={state}
                onChange={(event) =>
                  setState(event.target.value)
                }
                required
              >
                <option value="">
                  Select your state
                </option>

                {NIGERIAN_STATES.map((stateName) => (
                  <option
                    key={stateName}
                    value={stateName}
                  >
                    {stateName}
                  </option>
                ))}
              </select>
            </div>

            <div className="account-details-form-group">
              <label htmlFor="phone">
                Delivery Phone Number
              </label>

              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="e.g. 08012345678"
              />
            </div>

            <label className="account-address-default-toggle">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(event) =>
                  setIsDefault(event.target.checked)
                }
              />

              <span>
                Set as my default delivery address
              </span>
            </label>

            {error && (
              <p className="account-form-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="account-submit-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Address"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}