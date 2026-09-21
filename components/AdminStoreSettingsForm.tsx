"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StoreSettings = {
  store_name: string;
  support_email: string;
  support_phone: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  delivery_partner: string;
};

type AdminStoreSettingsFormProps = {
  initialSettings: StoreSettings;
};

export default function AdminStoreSettingsForm({
  initialSettings,
}: AdminStoreSettingsFormProps) {
  const router = useRouter();

  const [settings, setSettings] =
    useState<StoreSettings>(initialSettings);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(
    field: keyof StoreSettings,
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/admin/settings",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update store settings."
        );
      }

      setMessage(
        "Store settings updated successfully."
      );

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

  return (
    <form
      className="admin-settings-form"
      onSubmit={handleSubmit}
    >
      <div className="admin-settings-section">
        <div className="admin-settings-section-heading">
          <h2>Store Details</h2>

          <p>
            Basic information about your Tricea NG
            store.
          </p>
        </div>

        <div className="admin-settings-grid">
          <div className="admin-form-group">
            <label htmlFor="store-name">
              Store Name
            </label>

            <input
              id="store-name"
              type="text"
              value={settings.store_name}
              onChange={(event) =>
                handleChange(
                  "store_name",
                  event.target.value
                )
              }
              placeholder="Tricea NG"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="delivery-partner">
              Delivery Partner
            </label>

            <input
              id="delivery-partner"
              type="text"
              value={settings.delivery_partner}
              onChange={(event) =>
                handleChange(
                  "delivery_partner",
                  event.target.value
                )
              }
              placeholder="Enter delivery partner"
            />
          </div>
        </div>
      </div>

      <div className="admin-settings-section">
        <div className="admin-settings-section-heading">
          <h2>Customer Support</h2>

          <p>
            Contact information customers can use to
            reach Tricea NG.
          </p>
        </div>

        <div className="admin-settings-grid">
          <div className="admin-form-group">
            <label htmlFor="support-email">
              Support Email
            </label>

            <input
              id="support-email"
              type="email"
              value={settings.support_email}
              onChange={(event) =>
                handleChange(
                  "support_email",
                  event.target.value
                )
              }
              placeholder="support@example.com"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="support-phone">
              Support Phone
            </label>

            <input
              id="support-phone"
              type="tel"
              value={settings.support_phone}
              onChange={(event) =>
                handleChange(
                  "support_phone",
                  event.target.value
                )
              }
              placeholder="+234..."
            />
          </div>
        </div>
      </div>

      <div className="admin-settings-section">
        <div className="admin-settings-section-heading">
          <h2>Bank Transfer Details</h2>

          <p>
            These details are shown to customers when
            they choose bank transfer at checkout.
          </p>
        </div>

        <div className="admin-settings-grid">
          <div className="admin-form-group">
            <label htmlFor="bank-name">
              Bank Name
            </label>

            <input
              id="bank-name"
              type="text"
              value={settings.bank_name}
              onChange={(event) =>
                handleChange(
                  "bank_name",
                  event.target.value
                )
              }
              placeholder="Bank name"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="account-name">
              Account Name
            </label>

            <input
              id="account-name"
              type="text"
              value={settings.account_name}
              onChange={(event) =>
                handleChange(
                  "account_name",
                  event.target.value
                )
              }
              placeholder="Account name"
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="account-number">
              Account Number
            </label>

            <input
              id="account-number"
              type="text"
              inputMode="numeric"
              value={settings.account_number}
              onChange={(event) =>
                handleChange(
                  "account_number",
                  event.target.value
                )
              }
              placeholder="Account number"
            />
          </div>
        </div>
      </div>

      {(message || error) && (
        <div className="admin-settings-feedback">
          {message && (
            <p className="admin-form-success">
              {message}
            </p>
          )}

          {error && (
            <p className="admin-form-error">
              {error}
            </p>
          )}
        </div>
      )}

      <div className="admin-settings-actions">
        <button
          type="submit"
          className="admin-primary-action"
          disabled={isSaving}
        >
          {isSaving
            ? "Saving Changes..."
            : "Save Store Settings"}
        </button>
      </div>
    </form>
  );
}