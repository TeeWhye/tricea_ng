"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setMessage("");
    setError("");

    if (!email.trim()) {
  setError("Please enter your email address.");
  setIsSubmitting(false);
  return;
}

    try {
      const supabase = createClient();

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo:
              `${window.location.origin}/auth/reset-password`,
          }
        );

      if (error) {
        throw error;
      }

      setMessage(
        "If an account exists with this email address, we've sent a password reset link."
      );
    } catch (error) {
      setError(
  "Unable to send the password reset email. Please try again."
);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="account-page">
      <div className="account-page-inner">
        <div className="account-heading">
          <p className="section-eyebrow">
            MY ACCOUNT
          </p>

          <h1>
            Reset your
            <br />
            password.
          </h1>

          <p>
            Enter the email address associated with
            your Tricea account and we'll send you a
            secure reset link.
          </p>
        </div>

        <form
          className="account-form"
          onSubmit={handleSubmit}
        >
          <div className="account-form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
            />
          </div>

          {error && (
            <p
              className="account-form-error"
              role="alert"
            >
              {error}
            </p>
          )}

          {message && (
            <div className="account-form-success">
              <strong>Check your email.</strong>

              <p>{message}</p>
            </div>
          )}

          <button
            type="submit"
            className="account-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Sending..."
              : "Send Reset Link"}

            {!isSubmitting && <span>→</span>}
          </button>
        </form>

        <div className="account-register">
          <p>Remember your password?</p>

          <Link href="/account/login">
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}