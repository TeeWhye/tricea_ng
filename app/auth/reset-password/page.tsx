"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!password.trim()) {
  setError("Please enter a password.");
  return;
}

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      setMessage(
        "Your password has been updated successfully."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/account/login");
      }, 1500);
    } catch {
  setError(
    "Unable to update your password. Please try again."
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
            Create a new
            <br />
            password.
          </h1>

          <p>
            Choose a new password for your Tricea
            account.
          </p>
        </div>

        <form
          className="account-form"
          onSubmit={handleSubmit}
        >
          <div className="account-form-group">
            <label htmlFor="password">
              New Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="account-form-group">
            <label htmlFor="confirm-password">
              Confirm New Password
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Repeat your password"
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
              <strong>Password updated.</strong>

              <p>{message}</p>
            </div>
          )}

          <button
            type="submit"
            className="account-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Updating..."
              : "Update Password"}

            {!isSubmitting && <span>→</span>}
          </button>
        </form>
      </div>
    </main>
  );
}