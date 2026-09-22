"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message || "Unable to sign in."
      );
      setIsLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <p className="section-eyebrow">
            TRICEA NG
          </p>

          <h1>
            Admin
            <br />
            Sign In
          </h1>

          <p>
            Sign in to manage your store.
          </p>
        </div>

        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >
          <label>
            <span>Email Address</span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@example.com"
              required
            />
          </label>

          <label>
            <span>Password</span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Your password"
              required
            />
          </label>

          <div className="admin-login-forgot-password">
  <Link href="/account/forgot-password">
    Forgot your password?
  </Link>
</div>

          {error && (
            <p
              className="admin-login-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={isLoading}
          >
            {isLoading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}