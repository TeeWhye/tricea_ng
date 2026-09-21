"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AccountDetailsPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/account/profile");

        if (!response.ok) {
          throw new Error("Unable to load your account details.");
        }

        const data = await response.json();

        setFullName(data.profile.fullName ?? "");
        setPhone(data.profile.phone ?? "");
        setEmail(data.email ?? "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your account details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ?? "Unable to update your account."
        );
      }

      setMessage("Your account details have been updated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update your account."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="account-dashboard">
        <div className="account-dashboard-inner">
          <p className="section-eyebrow">MY ACCOUNT</p>
          <h1>Account Details.</h1>
          <p>Loading your details...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="account-dashboard">
      <div className="account-dashboard-inner">
        <div className="account-dashboard-header">
          <div>
            <p className="section-eyebrow">MY ACCOUNT</p>

            <h1>Account Details.</h1>

            <p>
              Manage the personal information associated
              with your Tricea account.
            </p>
          </div>

          <Link
            href="/account"
            className="account-back-link"
          >
            ← Back to Account
          </Link>
        </div>

        <section className="account-details-section">
          <form
            className="account-details-form"
            onSubmit={handleSubmit}
          >
            <div className="account-details-form-group">
              <label htmlFor="fullName">
                Full Name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                required
              />
            </div>

            <div className="account-details-form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                disabled
              />

              <p className="account-details-help">
                Your email address is managed through your
                sign-in account.
              </p>
            </div>

            <div className="account-details-form-group">
              <label htmlFor="phone">
                Phone Number
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

            {error && (
              <p className="account-form-error">
                {error}
              </p>
            )}

            {message && (
              <p className="account-form-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="account-submit-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}