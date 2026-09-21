"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AccountRegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [registrationComplete, setRegistrationComplete] =
  useState(false);

async function handleSubmit(
  event: React.FormEvent<HTMLFormElement>
) {
  event.preventDefault();

  setError("");
  setRegistrationComplete(false);

  if (!fullName.trim()) {
  setError("Please enter your full name.");
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

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName,
          },
          emailRedirectTo:
            `${window.location.origin}/auth/callback?next=/account`,
        },
      });

    if (error) {
      throw error;
    }

    if (data.session) {
      router.push("/account");
      router.refresh();
      return;
    }

    setRegistrationComplete(true);
  } catch {
  setError(
    "Unable to create your account. Please try again."
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
            Join
            <br />
            Tricea.
          </h1>

          <p>
            Create an account to manage your orders
            and enjoy a more seamless shopping
            experience.
          </p>
        </div>

        <form
          className="account-form"
          onSubmit={handleSubmit}
        >
          <div className="account-form-group">
            <label htmlFor="full-name">
              Full Name
            </label>

            <input
              id="full-name"
              type="text"
              name="fullName"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              placeholder="Your full name"
              required
            />
          </div>

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

          <div className="account-form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
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
              Confirm Password
            </label>

            <input
              id="confirm-password"
              type="password"
              name="confirmPassword"
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

          {registrationComplete && (
  <div className="account-form-success">
    <strong>Check your email.</strong>

    <p>
      We've sent a confirmation link to{" "}
      {email}. Confirm your email address to
      activate your Tricea account.
    </p>
  </div>
)}

          <button
            type="submit"
            className="account-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Creating Account..."
              : "Create Account"}

            {!isSubmitting && <span>→</span>}
          </button>
        </form>

        <div className="account-register">
          <p>
            Already have a Tricea account?
          </p>

          <Link href="/account/login">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}