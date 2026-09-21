"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AccountLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
  setError("");

  try {
    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });

    if (error) {
      throw error;
    }
  } catch {
  setError("Unable to continue with Google. Please try again.");
}
}

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setError("");

    try {
     const supabase = createClient();

const { error } =
  await supabase.auth.signInWithPassword({
    email,
    password,
  });

      if (error) {
        throw error;
      }

      router.push("/account");
      router.refresh();
    } catch {
  setError("Unable to sign in. Please check your details and try again.");
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
            Welcome
            <br />
            back.
          </h1>

          <p>
            Sign in to view your orders and manage
            your Tricea account.
          </p>
        </div>

        <button
  type="button"
  className="account-google-button"
  onClick={handleGoogleSignIn}
>
  <span className="account-google-icon">
    G
  </span>

  Continue with Google
</button>

<div className="account-divider">
  <span>OR</span>
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
              placeholder="Your password"
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

          <button
            type="submit"
            className="account-submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Signing In..."
              : "Sign In"}

            {!isSubmitting && <span>→</span>}
          </button>
        </form>

        <div className="account-register">
          <p>
            Don't have a Tricea account?
          </p>

          <Link href="/account/register">
            Create an Account
          </Link>
        </div>
      </div>
    </main>
  );
}